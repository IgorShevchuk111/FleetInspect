'use client';

import { useState, useRef, useEffect } from 'react';
import {
  UserCircleIcon,
  ClipboardDocumentCheckIcon,
  ArrowRightOnRectangleIcon,
  CameraIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { toast, Toaster } from 'sonner';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { supabase } from '@/app/lib/supabase';

export default function ProfilePage() {
  const { data: session, status } = useSession();

  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    session?.user?.image || null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [recentInspections, setRecentInspections] = useState([]);
  const [stats, setStats] = useState({
    completedInspections: 0,
    pendingInspections: 0,
    totalVehicles: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Fetch user data and stats
  useEffect(() => {
    async function fetchUserData() {
      // Try both possible user ID fields
      const userId = session?.user?.id || session?.user?.userId;

      if (!userId) {
        return;
      }

      try {
        // First, check if we can get any inspections at all
        const { data: allInspections, error: allError } = await supabase
          .from('fleet_inspections')
          .select('*');

        if (allError) {
          return;
        }

        // Now try to get user's inspections
        const { data: userInspections, error: userError } = await supabase
          .from('fleet_inspections')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (userError) {
          return;
        }

        if (!userInspections?.length) {
          setStats({
            completedInspections: 0,
            pendingInspections: 0,
            totalVehicles: 0,
          });
          setRecentInspections([]);
          return;
        }

        // Get vehicles for these inspections
        const vehicleIds = [
          ...new Set(userInspections.map((i) => i.vehicle_id)),
        ];

        const { data: vehicles, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('id, type, regnumber')
          .in('id', vehicleIds);

        if (vehiclesError) {
          return;
        }

        // Create a map of vehicles for easy lookup
        const vehicleMap = new Map(vehicles?.map((v) => [v.id, v]));

        // Calculate stats
        const stats = {
          completedInspections: userInspections.filter(
            (i) => i.status === 'passed'
          ).length,
          pendingInspections: userInspections.filter(
            (i) => i.status === 'failed'
          ).length,
          totalVehicles: vehicleIds.length,
        };

        setStats(stats);

        // Get recent inspections with vehicle data
        const recentOnes = userInspections.slice(0, 3).map((inspection) => ({
          ...inspection,
          vehicle: vehicleMap.get(inspection.vehicle_id) || {
            type: 'unknown',
            regnumber: 'unknown',
          },
        }));

        setRecentInspections(recentOnes);
      } catch (error) {
        toast.error('Failed to load user data');
      }
    }

    if (session) {
      fetchUserData();
    }
  }, [session]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type', {
        description: 'Please upload an image file.',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', {
        description: 'Please upload an image smaller than 5MB.',
      });
      return;
    }

    setIsUploading(true);
    const loadingToast = toast.loading('Uploading profile picture...');

    try {
      const tempUrl = URL.createObjectURL(file);
      setAvatarUrl(tempUrl);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${session?.user?.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(fileName);

      // Update user metadata
      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      toast.dismiss(loadingToast);
      toast.success('Profile picture updated');

      URL.revokeObjectURL(tempUrl);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Upload failed', {
        description: 'Failed to update profile picture. Please try again.',
      });
      setAvatarUrl(session?.user?.image || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f8faff] dark:bg-blue-950">
      <Toaster position="top-center" richColors closeButton />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - User Info */}
          <div className="lg:col-span-1">
            {/* Profile Card */}
            <div className="bg-white dark:bg-card rounded-xl shadow-sm p-6 border border-border dark:border-border">
              <div className="flex flex-col items-center text-center">
                <div className="relative group">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-700 dark:to-blue-800 ring-4 ring-white dark:ring-blue-700 shadow-sm">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt={session?.user?.name || ''}
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    ) : (
                      <UserCircleIcon className="w-32 h-32 text-muted-foreground dark:text-muted-foreground" />
                    )}
                  </div>
                  <button
                    onClick={handleAvatarClick}
                    disabled={isUploading}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-full"
                    aria-label="Change profile picture"
                  >
                    <CameraIcon className="w-8 h-8 text-white" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    aria-label="Upload profile picture"
                  />
                </div>
                <h2 className="mt-6 text-2xl font-bold text-foreground dark:text-white">
                  {session?.user?.name}
                </h2>
                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400">
                  {session?.user?.role || 'Inspector'}
                </div>
                <p className="mt-3 text-sm text-muted-foreground dark:text-muted-foreground">
                  {session?.user?.email}
                </p>
              </div>

              {/* Stats */}
              <div className="mt-6 grid grid-cols-3 gap-4 border-t border-blue-100 dark:border-blue-800 pt-6">
                <div className="text-center">
                  <p className="text-2xl font-semibold text-foreground dark:text-white">
                    {stats.completedInspections}
                  </p>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                    Passed
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-foreground dark:text-white">
                    {stats.pendingInspections}
                  </p>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                    Failed
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-foreground dark:text-white">
                    {stats.totalVehicles}
                  </p>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                    Vehicles
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-8">
                <button
                  onClick={handleSignOut}
                  className="flex items-center justify-between w-full px-6 py-3 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    Sign Out
                  </div>
                  <span className="text-red-400 transform group-hover:translate-x-1 transition-transform duration-200">
                    →
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Inspections */}
            <div className="bg-white dark:bg-card rounded-xl shadow-sm p-6 border border-border dark:border-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground dark:text-white">
                  Recent Inspections
                </h3>
                <Link
                  href="/inspections"
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                >
                  View all
                  <span className="text-muted-foreground">→</span>
                </Link>
              </div>

              <div className="space-y-4">
                {recentInspections.map((inspection) => (
                  <div
                    key={inspection.id}
                    className="flex items-center justify-between p-4 bg-white dark:bg-card rounded-lg border border-blue-100 dark:border-blue-800 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-lg ${
                          inspection.status === 'passed'
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                            : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                        }`}
                      >
                        <ClipboardDocumentCheckIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground dark:text-white">
                          {inspection.vehicle?.regnumber}
                        </p>
                        <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                          {inspection.vehicle?.type?.charAt(0).toUpperCase() +
                            inspection.vehicle?.type?.slice(1)}{' '}
                          •{' '}
                          {new Date(inspection.created_at).toLocaleDateString(
                            'en-GB',
                            {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full ${
                        inspection.status === 'passed'
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                          : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                      }`}
                    >
                      {inspection.status.charAt(0).toUpperCase() +
                        inspection.status.slice(1)}
                    </span>
                  </div>
                ))}

                {recentInspections.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground dark:text-muted-foreground">
                    <ClipboardDocumentCheckIcon className="w-12 h-12 mb-4 text-muted-foreground dark:text-muted-foreground" />
                    <p className="text-lg font-medium">
                      No recent inspections found
                    </p>
                    <p className="mt-1 text-sm">
                      Start by creating your first inspection
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
