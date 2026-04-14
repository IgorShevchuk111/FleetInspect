'use client';

import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import {
  ClipboardDocumentCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhotoIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  XMarkIcon,
  UserIcon,
  ClockIcon,
  TruckIcon,
  LightBulbIcon,
  SignalIcon,
  ViewfinderCircleIcon,
  StopCircleIcon,
  DocumentTextIcon,
  CogIcon,
  BeakerIcon,
  SpeakerWaveIcon,
  WindowIcon,
  CircleStackIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ScaleIcon,
  BookmarkIcon,
  LockClosedIcon,
  CloudIcon,
  CpuChipIcon,
  LinkIcon,
  RectangleGroupIcon,
  SparklesIcon,
  FireIcon,
  ArrowsUpDownIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Toaster, toast } from 'sonner';
import Image from 'next/image';
import { getInspectionForm, getInspection } from '@/app/lib/data_servis';
import { useSession } from 'next-auth/react';
import { Database } from '@/types/supabase';
import { createUpdateInspection } from '@/app/lib/actions';
import { compressImage } from '@/app/utils/helper';
import { formatDistanceToNow } from 'date-fns';

type Tables = Database['public']['Tables'];
type FleetInspectionInsert = Tables['fleet_inspections']['Insert'];

interface Vehicle {
  id: string;
  regnumber: string;
  type: string;
}

interface FormItem {
  id: string;
  label: string;
  name: string;
  type: string;
  is_required: boolean;
  position: number;
  placeholder?: string;
  options?: string;
}

interface ImagePreview {
  id: string;
  url: string;
  file: File;
}

type PageParams = {
  [key: string]: string;
  vehicleId: string;
};

export default function InspectionDetailsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const params = useParams<PageParams>();
  const searchParams = useSearchParams();

  const vehicleId = params.vehicleId;
  const tripType = searchParams.get('trip');
  const inspectionId = searchParams.get('inspectionId');
  const mode = searchParams.get('mode') || 'edit';

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [formItems, setFormItems] = useState<FormItem[]>([]);
  const [checkedItems, setCheckedItems] = useState<
    Record<string, 'passed' | 'failed' | undefined>
  >({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [timeValues, setTimeValues] = useState<Record<string, string>>({});
  const [numberValues, setNumberValues] = useState<Record<string, string>>({});
  const [images, setImages] = useState<Record<string, ImagePreview[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [autoFillUsed, setAutoFillUsed] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [existingInspection, setExistingInspection] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureCanvas, setSignatureCanvas] =
    useState<HTMLCanvasElement | null>(null);
  const [isOwner, setIsOwner] = useState(true);
  const [canEdit, setCanEdit] = useState(true);
  const [processingItemId, setProcessingItemId] = useState<string | null>(null);
  const sigPadRef = useRef<SignatureCanvas>(null);

  const fieldIcons = {
    // Time fields
    time_start: { icon: ClockIcon, color: 'text-blue-500 dark:text-blue-400' },
    time_finish: { icon: ClockIcon, color: 'text-blue-600 dark:text-blue-500' },

    // Odometer fields
    odo_reading_start: {
      icon: CircleStackIcon,
      color: 'text-purple-500 dark:text-purple-400',
    },
    odo_reading_finish: {
      icon: CircleStackIcon,
      color: 'text-purple-600 dark:text-purple-500',
    },

    // Tachograph fields
    tachograph_serviceable: {
      icon: CogIcon,
      color: 'text-gray-500 dark:text-gray-400',
    },
    tacho_spare_paper: {
      icon: DocumentTextIcon,
      color: 'text-gray-600 dark:text-gray-500',
    },

    // Driver fields
    driver_cpc_card: {
      icon: CreditCardIcon,
      color: 'text-green-500 dark:text-green-400',
    },

    // Fluid fields
    fluid_levels: {
      icon: BeakerIcon,
      color: 'text-blue-500 dark:text-blue-400',
    },

    // Lights
    lights: {
      icon: LightBulbIcon,
      color: 'text-yellow-500 dark:text-yellow-400',
    },

    // Audio/Camera
    horn_bleeper_cameras: {
      icon: SpeakerWaveIcon,
      color: 'text-orange-500 dark:text-orange-400',
    },

    // Windscreen
    windscreen: { icon: WindowIcon, color: 'text-cyan-500 dark:text-cyan-400' },

    // Mirrors
    mirrors: {
      icon: ViewfinderCircleIcon,
      color: 'text-cyan-600 dark:text-cyan-500',
    },

    // Tyres
    tyres: { icon: TruckIcon, color: 'text-gray-500 dark:text-gray-400' },

    // Wheels
    wheels_nuts_indicators: {
      icon: CogIcon,
      color: 'text-gray-600 dark:text-gray-500',
    },

    // Fuel
    fuel_tanks: { icon: BeakerIcon, color: 'text-red-500 dark:text-red-400' },

    // External equipment
    external_equipment: {
      icon: ShieldCheckIcon,
      color: 'text-indigo-500 dark:text-indigo-400',
    },

    // Brakes
    brakes: { icon: StopCircleIcon, color: 'text-red-600 dark:text-red-500' },

    // Height
    height_value: {
      icon: ScaleIcon,
      color: 'text-red-500 dark:text-red-400',
    },

    // Operators licence
    operators_licence: {
      icon: BookmarkIcon,
      color: 'text-green-600 dark:text-green-500',
    },

    // Load
    load_secured: {
      icon: LockClosedIcon,
      color: 'text-amber-500 dark:text-amber-400',
    },

    // Air
    air_leaks: { icon: CloudIcon, color: 'text-blue-600 dark:text-blue-500' },

    // Advanced systems
    advanced_systems: {
      icon: CpuChipIcon,
      color: 'text-indigo-600 dark:text-indigo-500',
    },

    // Fifth wheel
    fifth_wheel_slider: {
      icon: LinkIcon,
      color: 'text-gray-500 dark:text-gray-400',
    },

    // Trailer
    trailer_docs: {
      icon: DocumentTextIcon,
      color: 'text-green-500 dark:text-green-400',
    },
    landing_legs: {
      icon: ArrowsUpDownIcon,
      color: 'text-orange-600 dark:text-orange-500',
    },

    // Cables
    cables: { icon: LinkIcon, color: 'text-yellow-600 dark:text-yellow-500' },

    // Load bed
    load_bed: {
      icon: RectangleGroupIcon,
      color: 'text-brown-500 dark:text-brown-400',
    },
    load_area_clean: {
      icon: SparklesIcon,
      color: 'text-cyan-500 dark:text-cyan-400',
    },

    // Fridge
    fridge_systems: {
      icon: FireIcon,
      color: 'text-blue-500 dark:text-blue-400',
    },
    fridge_temp_settings: {
      icon: CogIcon,
      color: 'text-blue-600 dark:text-blue-500',
    },
    fridge_temp_start: {
      icon: FireIcon,
      color: 'text-blue-700 dark:text-blue-600',
    },

    // Tail lift
    tail_lift: {
      icon: ArrowsUpDownIcon,
      color: 'text-purple-500 dark:text-purple-400',
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (inspectionId) {
          const inspection = await getInspection(inspectionId);
          setExistingInspection(inspection);

          const currentUserId = session?.user?.userId || session?.user?.id;
          const isAdmin = session?.user?.role === 'admin';
          const isInspectionOwner =
            currentUserId && inspection.user_id === currentUserId;
          const canEditInspection = isAdmin || isInspectionOwner;
          setIsOwner(canEditInspection);

          const initialItems: Record<string, 'passed' | 'failed' | undefined> =
            {};
          // Replace hardcoded array with dynamic form fields
          const { inspectionForm, vehicle } = await getInspectionForm(
            inspection.vehicle_id,
            inspection.trip
          );

          // Initialize all checkbox fields from the form
          inspectionForm.forEach((formField) => {
            if (formField.type === 'checkbox') {
              initialItems[formField.name] = inspection[formField.name];
            }
          });
          setCheckedItems(initialItems);

          const initialNotes: Record<string, string> = {};
          // Initialize all notes fields dynamically
          inspectionForm.forEach((formField) => {
            if (formField.type === 'checkbox') {
              const noteField = `${formField.name}_notes`;
              if (inspection[noteField]) {
                initialNotes[formField.name] = inspection[noteField];
              }
            }
          });
          setNotes(initialNotes);

          const initialTimeValues: Record<string, string> = {};
          // Initialize time fields dynamically
          inspectionForm.forEach((formField) => {
            if (formField.type === 'time') {
              const timeField = `${formField.name}_value`;
              if (inspection[timeField]) {
                initialTimeValues[formField.name] = inspection[timeField];
              }
            }
          });
          setTimeValues(initialTimeValues);

          const initialNumberValues: Record<string, string> = {};
          // Initialize number fields dynamically
          inspectionForm.forEach((formField) => {
            if (formField.type === 'number') {
              const numberField = `${formField.name}_value`;
              if (inspection[numberField]) {
                initialNumberValues[formField.name] = inspection[numberField];
              }
            }
          });
          setNumberValues(initialNumberValues);

          const initialImages: Record<string, ImagePreview[]> = {};
          // Initialize photos for all checkbox fields dynamically
          inspectionForm.forEach((formField) => {
            if (formField.type === 'checkbox') {
              const photoField = `${formField.name}_photos`;
              if (inspection[photoField] && inspection[photoField].length > 0) {
                initialImages[formField.name] = inspection[photoField].map(
                  (url: string) => ({
                    id: Math.random().toString(36).substr(2, 9),
                    url,
                    file: null as any,
                  })
                );
              }
            }
          });
          setImages(initialImages);

          if (inspection.signature) {
            setSignature(inspection.signature);
          }

          setVehicle(vehicle);
          setFormItems(inspectionForm);
        } else {
          const { inspectionForm, vehicle } = await getInspectionForm(
            vehicleId,
            tripType || ''
          );
          setVehicle(vehicle);
          setFormItems(inspectionForm);

          const initialItems: Record<string, 'passed' | 'failed' | undefined> =
            {};
          setCheckedItems(initialItems);

          // Set default current time for time fields in new inspections
          const initialTimeValues: Record<string, string> = {};
          const currentTime = new Date().toTimeString().slice(0, 5); // HH:MM format
          inspectionForm.forEach((item) => {
            if (item.type === 'time') {
              initialTimeValues[item.name] = currentTime;
            }
          });
          setTimeValues(initialTimeValues);
        }
      } catch (error: any) {
        toast.error('Failed to load information', {
          description: error.message || 'Please try again',
        });
      }
    };

    if ((vehicleId && tripType) || inspectionId) {
      fetchData();
    } else {
      toast.error('Missing required parameters', {
        description: 'Vehicle ID and trip type are required',
      });
      router.push('/inspection');
    }
  }, [
    vehicleId,
    tripType,
    inspectionId,
    router,
    session?.user?.id,
    session?.user?.userId,
    session?.user?.role,
  ]);

  // Initialize signature canvas
  useEffect(() => {
    // Simple initialization - the SignatureCanvas component handles everything
  }, [canEdit]);

  useEffect(() => {
    return () => {
      Object.values(images).forEach((itemImages) => {
        itemImages.forEach((img) => {
          if (img.url.startsWith('blob:')) {
            URL.revokeObjectURL(img.url);
          }
        });
      });
    };
  }, [images]);

  useEffect(() => {
    const isEditMode = mode === 'edit';
    const isNewInspection = !inspectionId;
    const editingAllowed = isOwner && (isEditMode || isNewInspection);
    setCanEdit(editingAllowed);
  }, [mode, isOwner, inspectionId]);

  const handleCheck = (itemId: string, isPassed: boolean) => {
    const item = formItems.find((item) => item.id === itemId);
    if (item) {
      setCheckedItems((prev) => ({
        ...prev,
        [item.name]: isPassed ? 'passed' : 'failed',
      }));
      // Reset submit attempt when user starts filling fields
      if (submitAttempted) setSubmitAttempted(false);
    }
  };

  const handleNoteChange = (itemId: string, note: string) => {
    const item = formItems.find((item) => item.id === itemId);
    if (item) {
      setNotes((prev) => ({ ...prev, [item.name]: note }));
      // Reset submit attempt when user starts filling fields
      if (submitAttempted) setSubmitAttempted(false);
    }
  };

  const handleTimeChange = (itemId: string, time: string) => {
    const item = formItems.find((item) => item.id === itemId);
    if (item) {
      setTimeValues((prev) => ({ ...prev, [item.name]: time }));
      // Reset submit attempt when user starts filling fields
      if (submitAttempted) setSubmitAttempted(false);
    }
  };

  const handleNumberChange = (itemId: string, number: string) => {
    const item = formItems.find((item) => item.id === itemId);
    if (item) {
      setNumberValues((prev) => ({ ...prev, [item.name]: number }));
      // Reset submit attempt when user starts filling fields
      if (submitAttempted) setSubmitAttempted(false);
    }
  };

  const handleImageUpload = async (itemId: string, files: FileList) => {
    setProcessingItemId(itemId);

    try {
      const compressedFiles = await Promise.all(
        Array.from(files).map(async (file) => {
          const compressedFile = await compressImage(file);
          return {
            id: Math.random().toString(36).substr(2, 9),
            url: URL.createObjectURL(compressedFile),
            file: compressedFile,
          };
        })
      );

      setImages((prev) => ({
        ...prev,
        [itemId]: [...(prev[itemId] || []), ...compressedFiles],
      }));
    } catch (error) {
      toast.error('Failed to process images', {
        description: 'Please try again with different images.',
      });
    } finally {
      setProcessingItemId(null);
    }
  };

  const handleRemoveImage = (itemId: string, imageId: string) => {
    setImages((prev) => {
      const itemImages = prev[itemId] || [];
      const imageToRemove = itemImages.find((img) => img.id === imageId);

      if (imageToRemove?.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.url);
      }

      return {
        ...prev,
        [itemId]: itemImages.filter((img) => img.id !== imageId),
      };
    });
  };

  const calculateProgress = () => {
    const totalItems = formItems.length;
    const checkedCount = Object.values(checkedItems).filter(
      (status) => status === 'passed' || status === 'failed'
    ).length;
    return Math.round((checkedCount / totalItems) * 100);
  };

  const validateForm = () => {
    let isValid = true;
    let missingItems: string[] = [];

    formItems.forEach((item) => {
      if (item.is_required) {
        if (item.type === 'checkbox') {
          if (!checkedItems[item.name]) {
            isValid = false;
            missingItems.push(item.label);
          }
        } else if (item.type === 'time') {
          if (!timeValues[item.name] || timeValues[item.name].trim() === '') {
            isValid = false;
            missingItems.push(item.label);
          }
        } else if (item.type === 'number') {
          if (
            !numberValues[item.name] ||
            numberValues[item.name].trim() === ''
          ) {
            isValid = false;
            missingItems.push(item.label);
          }
        } else {
          if (!notes[item.name] || notes[item.name].trim() === '') {
            isValid = false;
            missingItems.push(item.label);
          }
        }
      }
    });

    // Check for signature
    if (!signature) {
      isValid = false;
      missingItems.push('Digital Signature');
    }

    if (!isValid) {
      toast.error('Missing Required Items', {
        description: `Please complete the following items:\n${missingItems.join(
          '\n'
        )}`,
        duration: 5000,
      });
    }

    return isValid;
  };

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    if (!validateForm()) return;
    if (!session?.user) {
      toast.error('You must be logged in to submit an inspection');
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Submitting inspection...');

    try {
      const formData = new FormData();

      formData.append('vehicleId', vehicleId);
      formData.append('user_id', session.user.userId);
      formData.append('full_name', session.user.name);
      formData.append('trip', tripType || '');

      // Add signature if available
      if (signature) {
        formData.append('signature', signature);
      }

      Object.entries(checkedItems).forEach(([key, value]) => {
        if (value) {
          formData.append(key, value);
        }
      });

      Object.entries(notes).forEach(([key, value]) => {
        if (value) {
          formData.append(`${key}_notes`, value);
        }
      });

      Object.entries(timeValues).forEach(([key, value]) => {
        if (value) {
          formData.append(`${key}_value`, value);
        }
      });

      Object.entries(numberValues).forEach(([key, value]) => {
        if (value) {
          formData.append(`${key}_value`, value);
        }
      });

      Object.entries(images).forEach(([itemName, itemImages]) => {
        const item = formItems.find((item) => item.name === itemName);
        if (item && itemImages.length > 0) {
          itemImages.forEach((image) => {
            if (image.file) {
              formData.append(`${item.name}_photos`, image.file);
            } else if (image.url) {
              formData.append(`${item.name}_photos_urls`, image.url);
            }
          });
        }
      });

      const result = await createUpdateInspection(
        formData,
        inspectionId || undefined
      );

      if (result.success) {
        toast.dismiss(loadingToast);
        toast.success('Inspection Submitted Successfully', {
          description: 'Your inspection has been recorded.',
        });

        setSubmitAttempted(false); // Reset for next time
        setAutoFillUsed(false); // Reset auto-fill state
        await new Promise((resolve) => setTimeout(resolve, 1500));
        router.push('/inspections');
      } else {
        throw new Error('Failed to submit inspection');
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error('Submission Failed', {
        description:
          error.message || 'Failed to submit inspection. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoPassAll = () => {
    // Check if all checkbox fields are already passed
    const allCheckboxFieldsPassed = formItems
      .filter((item) => item.type === 'checkbox')
      .every((item) => checkedItems[item.name] === 'passed');

    if (allCheckboxFieldsPassed) {
      // Reset all checkbox fields to empty
      setCheckedItems((prev) => {
        const newState = { ...prev };
        formItems.forEach((item) => {
          if (item.type === 'checkbox') {
            delete newState[item.name]; // Remove the field to make it empty
          }
        });
        return newState;
      });

      // Reset states
      setSubmitAttempted(false);
      setAutoFillUsed(false);

      toast.success('All inspection items cleared!');
    } else {
      // Auto-pass all checkbox fields
      setCheckedItems((prev) => ({
        ...prev,
        ...formItems.reduce((acc, item) => {
          if (item.type === 'checkbox') {
            acc[item.name] = 'passed';
          }
          return acc;
        }, {}),
      }));

      // Height field remains empty and required (like odometer fields)

      // Don't reset submitAttempted here so "Required" indicators still show for value fields

      // Set auto-fill used to show "Required" for odometer and signature
      setAutoFillUsed(true);

      toast.success(
        'All items passed! Just fill height, odometer and sign to complete.'
      );
    }
  };

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-[#f8faff] dark:bg-blue-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-primary dark:text-muted-foreground">
            Loading vehicle information...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faff] dark:bg-blue-950">
      <Toaster position="top-center" richColors closeButton />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white dark:bg-card rounded-xl shadow-sm p-4 sm:p-6 border border-border dark:border-border">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Link
                    href={
                      searchParams.get('from') === 'reports'
                        ? '/reports'
                        : searchParams.get('from') === 'user-inspections'
                        ? '/user-inspections'
                        : searchParams.get('from') === 'inspections'
                        ? '/inspections'
                        : '/inspections'
                    }
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary dark:text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-primary-50 dark:hover:bg-muted rounded-lg transition-colors"
                  >
                    <ArrowLeftIcon className="w-4 h-4" />
                    {searchParams.get('from') === 'reports'
                      ? 'Back to Reports'
                      : searchParams.get('from') === 'user-inspections'
                      ? 'Back to All User Inspections'
                      : searchParams.get('from') === 'inspections'
                      ? 'Back to Inspections'
                      : 'Back to Inspections'}
                  </Link>
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground dark:text-white">
                  {inspectionId
                    ? mode === 'edit'
                      ? 'Edit'
                      : 'View'
                    : tripType === 'pre-trip'
                    ? 'Pre-Trip'
                    : 'Post-Trip'}{' '}
                  Inspection
                </h1>
                <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 text-primary dark:text-muted-foreground">
                    <TruckIcon className="w-5 h-5 text-muted-foreground dark:text-muted-foreground" />
                    <span className="text-sm sm:text-base">
                      {vehicle.regnumber} • {vehicle.type}
                    </span>
                  </div>
                  {session?.user && (
                    <div className="flex items-center gap-2 text-primary dark:text-muted-foreground">
                      <UserIcon className="w-5 h-5 text-muted-foreground dark:text-muted-foreground" />
                      <span className="text-sm sm:text-base">
                        Inspector: {session.user.name}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-primary dark:text-muted-foreground">
                    <ClockIcon className="w-5 h-5 text-muted-foreground dark:text-muted-foreground" />
                    <span className="text-sm sm:text-base">
                      {existingInspection
                        ? `Last updated ${formatDistanceToNow(
                            new Date(existingInspection.created_at),
                            { addSuffix: true }
                          )}`
                        : 'New inspection'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-full sm:w-auto bg-white dark:bg-card rounded-lg shadow-sm px-4 py-3 border border-border dark:border-border">
                  <div className="flex items-center gap-2">
                    <ClipboardDocumentCheckIcon className="w-5 h-5 text-muted-foreground dark:text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground dark:text-white">
                      Progress: {calculateProgress()}%
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        calculateProgress() < 25
                          ? 'bg-red-500'
                          : calculateProgress() < 50
                          ? 'bg-orange-500'
                          : calculateProgress() < 75
                          ? 'bg-yellow-500'
                          : calculateProgress() < 100
                          ? 'bg-blue-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${calculateProgress()}%` }}
                    ></div>
                  </div>
                </div>
                {canEdit && (
                  <button
                    type="button"
                    onClick={handleAutoPassAll}
                    disabled={isSubmitting}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      formItems
                        .filter((item) => item.type === 'checkbox')
                        .every((item) => checkedItems[item.name] === 'passed')
                        ? 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-700 hover:border-red-300 dark:hover:border-red-600'
                        : 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-700 hover:border-green-300 dark:hover:border-green-600'
                    } disabled:opacity-50`}
                  >
                    {formItems
                      .filter((item) => item.type === 'checkbox')
                      .every((item) => checkedItems[item.name] === 'passed') ? (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        Clear All
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-4 h-4" />
                        Auto Pass All
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Inspection Form */}
        <div className="space-y-6">
          {formItems.map((item) => {
            const dbFieldName = item.name;
            const ItemIcon = fieldIcons[dbFieldName]?.icon || ChevronRightIcon;
            const status = checkedItems[item.name];

            const getIconColor = (
              itemStatus: string | undefined,
              isRequired: boolean
            ) => {
              // For checkbox fields
              if (itemStatus === 'passed') {
                return 'text-green-500 dark:text-green-400';
              }
              if (itemStatus === 'failed') {
                return 'text-red-500 dark:text-red-400';
              }

              // For time fields
              if (item.type === 'time') {
                const timeValue = timeValues[item.name];
                if (timeValue && timeValue.trim() !== '') {
                  return 'text-green-500 dark:text-green-400';
                }
                if (isRequired) {
                  return 'text-red-500 dark:text-red-400';
                }
              }

              // For number fields
              if (item.type === 'number') {
                const numberValue = numberValues[item.name];
                if (numberValue && numberValue.trim() !== '') {
                  return 'text-green-500 dark:text-green-400';
                }
                if (isRequired) {
                  return 'text-red-500 dark:text-red-400';
                }
              }

              // For text fields
              if (item.type === 'text') {
                const noteValue = notes[item.name];
                if (noteValue && noteValue.trim() !== '') {
                  return 'text-green-500 dark:text-green-400';
                }
                if (isRequired) {
                  return 'text-red-500 dark:text-red-400';
                }
              }

              // For checkbox fields that are required but not selected
              if (isRequired && !itemStatus) {
                return 'text-red-500 dark:text-red-400';
              }

              // Use the field-specific color when no status is set
              return fieldIcons[dbFieldName]?.color || 'text-muted-foreground';
            };

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-card rounded-xl shadow-sm overflow-hidden border border-border dark:border-border"
              >
                <div className="px-6 py-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-2 rounded-lg ${
                            // Checkbox passed
                            status === 'passed' ||
                            // Time filled
                            (item.type === 'time' &&
                              timeValues[item.name] &&
                              timeValues[item.name].trim() !== '') ||
                            // Number filled
                            (item.type === 'number' &&
                              numberValues[item.name] &&
                              numberValues[item.name].trim() !== '') ||
                            // Text filled
                            (item.type === 'text' &&
                              notes[item.name] &&
                              notes[item.name].trim() !== '')
                              ? 'bg-green-50 dark:bg-green-900/20'
                              : // Checkbox failed or required fields empty
                              status === 'failed' ||
                                (item.is_required &&
                                  ((item.type === 'checkbox' && !status) ||
                                    (item.type === 'time' &&
                                      (!timeValues[item.name] ||
                                        timeValues[item.name].trim() === '')) ||
                                    (item.type === 'number' &&
                                      (!numberValues[item.name] ||
                                        numberValues[item.name].trim() ===
                                          '')) ||
                                    (item.type === 'text' &&
                                      (!notes[item.name] ||
                                        notes[item.name].trim() === ''))))
                              ? 'bg-red-50 dark:bg-red-900/20'
                              : 'bg-primary-50 dark:bg-card'
                          }`}
                        >
                          <ItemIcon
                            className={`w-5 h-5 ${getIconColor(
                              status,
                              item.is_required
                            )}`}
                          />
                        </div>
                        <span className="font-medium text-foreground dark:text-white">
                          {item.label}
                        </span>
                        {item.is_required &&
                          (submitAttempted ||
                            (autoFillUsed &&
                              (item.type === 'number' ||
                                item.type === 'time'))) &&
                          (item.type === 'checkbox'
                            ? checkedItems[dbFieldName] === undefined
                            : item.type === 'time'
                            ? !timeValues[item.name] ||
                              timeValues[item.name].trim() === ''
                            : item.type === 'number'
                            ? !numberValues[item.name] ||
                              numberValues[item.name].trim() === ''
                            : !notes[item.name] ||
                              notes[item.name].trim() === '') && (
                            <span className="text-xs text-red-500">
                              Required
                            </span>
                          )}
                      </div>
                      <div className="mt-4 space-y-4">
                        {/* Render based on field type */}
                        {item.type === 'checkbox' ? (
                          <div className="flex items-center gap-6">
                            <button
                              type="button"
                              onClick={() => handleCheck(item.id, true)}
                              disabled={!canEdit}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                checkedItems[item.name] === 'passed'
                                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 ring-1 ring-green-600/20'
                                  : 'bg-primary-50 dark:bg-muted text-primary dark:text-muted-foreground hover:bg-green-50 dark:hover:bg-green-900/10'
                              } ${!canEdit ? 'cursor-not-allowed' : ''}`}
                            >
                              <CheckCircleIcon
                                className={`w-5 h-5 ${
                                  checkedItems[item.name] === 'passed'
                                    ? 'text-green-600 dark:text-green-400'
                                    : ''
                                }`}
                              />
                              Pass
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCheck(item.id, false)}
                              disabled={!canEdit}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                checkedItems[item.name] === 'failed'
                                  ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 ring-1 ring-red-600/20'
                                  : 'bg-primary-50 dark:bg-muted text-primary dark:text-muted-foreground hover:bg-red-50 dark:hover:bg-red-900/10'
                              } ${!canEdit ? 'cursor-not-allowed' : ''}`}
                            >
                              <XCircleIcon
                                className={`w-5 h-5 ${
                                  checkedItems[item.name] === 'failed'
                                    ? 'text-red-600 dark:text-red-400'
                                    : ''
                                }`}
                              />
                              Fail
                            </button>
                          </div>
                        ) : (
                          <div>
                            <input
                              id={`field-${item.id}`}
                              name={`field-${item.name}`}
                              type={
                                item.type === 'number'
                                  ? 'number'
                                  : item.type === 'time'
                                  ? 'time'
                                  : 'text'
                              }
                              disabled={!canEdit}
                              className={`w-full rounded-lg border-2 border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 text-sm text-blue-900 dark:text-blue-100 placeholder-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all ${
                                !canEdit ? 'cursor-not-allowed opacity-50' : ''
                              }`}
                              placeholder={
                                item.placeholder ||
                                `Enter ${item.label.toLowerCase()}`
                              }
                              value={
                                item.type === 'time'
                                  ? timeValues[item.name] || ''
                                  : item.type === 'number'
                                  ? numberValues[item.name] || ''
                                  : notes[item.name] || ''
                              }
                              onChange={(e) =>
                                item.type === 'time'
                                  ? handleTimeChange(item.id, e.target.value)
                                  : item.type === 'number'
                                  ? handleNumberChange(item.id, e.target.value)
                                  : handleNoteChange(item.id, e.target.value)
                              }
                            />
                          </div>
                        )}

                        {/* Only show notes and photos for fields that need them */}
                        {item.type !== 'time' && item.type !== 'number' && (
                          <>
                            <div className="space-y-2">
                              <label
                                htmlFor={`note-${item.id}`}
                                className="flex items-center gap-2 text-sm font-medium text-secondary-foreground dark:text-muted-foreground"
                              >
                                <svg
                                  className="w-4 h-4 text-muted-foreground"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                                Notes
                              </label>
                              <textarea
                                id={`note-${item.id}`}
                                name={`note-${item.name}`}
                                rows={2}
                                disabled={!canEdit}
                                className={`w-full rounded-lg border-2 border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 text-sm text-blue-900 dark:text-blue-100 placeholder-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all ${
                                  !canEdit
                                    ? 'cursor-not-allowed opacity-50'
                                    : ''
                                }`}
                                placeholder="Add any notes about this item..."
                                value={notes[item.name] || ''}
                                onChange={(e) =>
                                  handleNoteChange(item.id, e.target.value)
                                }
                              />
                            </div>

                            <div>
                              <label
                                htmlFor={`photo-upload-${item.id}`}
                                className="flex items-center gap-2 text-sm font-medium text-secondary-foreground dark:text-muted-foreground mb-2"
                              >
                                <PhotoIcon className="w-4 h-4 text-muted-foreground" />
                                Photos
                              </label>
                              <div className="flex flex-wrap items-center gap-4">
                                {images[item.name]?.map((image) => (
                                  <div
                                    key={image.id}
                                    className="relative w-20 h-20 group"
                                  >
                                    <a
                                      href={image.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block"
                                      title="Click to view full image"
                                    >
                                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-primary-50 dark:bg-muted border border-border dark:border-border">
                                        <Image
                                          src={image.url}
                                          alt={`Upload ${image.id}`}
                                          fill
                                          className="object-cover"
                                          sizes="80px"
                                        />
                                      </div>
                                    </a>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveImage(item.name, image.id)
                                      }
                                      disabled={!canEdit}
                                      className={`absolute -top-2 -right-2 p-1.5 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600 ${
                                        !canEdit ? 'hidden' : ''
                                      }`}
                                    >
                                      <XMarkIcon className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                                {canEdit && (
                                  <div
                                    onClick={() => {
                                      if (!processingItemId) {
                                        document
                                          .getElementById(
                                            `photo-upload-${item.id}`
                                          )
                                          ?.click();
                                      }
                                    }}
                                    className={`flex flex-col items-center justify-center w-20 h-20 rounded-lg border-2 border-dashed border-border dark:border-border hover:border-primary dark:hover:border-primary transition-colors bg-primary-50 dark:bg-muted/50 ${
                                      processingItemId === item.name
                                        ? 'cursor-not-allowed opacity-50'
                                        : 'cursor-pointer'
                                    }`}
                                  >
                                    {processingItemId === item.name ? (
                                      <>
                                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
                                        <span className="mt-1 text-xs text-primary dark:text-muted-foreground">
                                          Processing...
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <PhotoIcon className="w-8 h-8 text-muted-foreground" />
                                        <span className="mt-1 text-xs text-muted-foreground dark:text-muted-foreground">
                                          Add Photo
                                        </span>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                              <input
                                type="file"
                                id={`photo-upload-${item.id}`}
                                name={`photo-upload-${item.name}`}
                                className="hidden"
                                accept="image/*"
                                multiple
                                disabled={
                                  !canEdit || processingItemId === item.name
                                }
                                aria-label={`Upload photos for ${item.label}`}
                                onChange={(e) =>
                                  e.target.files &&
                                  handleImageUpload(item.name, e.target.files)
                                }
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Signature Section */}
        {(canEdit || signature) && (
          <div className="mt-8 bg-white dark:bg-card rounded-xl border border-border dark:border-border overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 px-6 py-4 border-b border-border dark:border-border">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Digital Signature Required
                    </h3>
                    {(submitAttempted || autoFillUsed) && !signature && (
                      <span className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    By signing below, you confirm that all identified defects
                    have been reported and repaired as necessary.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {signature ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-green-600 dark:text-green-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Signature Complete
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Your signature has been captured
                        </p>
                      </div>
                    </div>
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => setSignature(null)}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Clear Signature
                      </button>
                    )}
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="relative w-full h-24 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-white shadow-inner">
                      <Image
                        src={signature}
                        alt="Signature"
                        fill
                        className="object-contain p-2"
                        sizes="(max-width: 768px) 100vw, 400px"
                      />
                    </div>
                  </div>
                </div>
              ) : canEdit ? (
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-950/20 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-4 sm:p-6">
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <svg
                          className="w-8 h-8 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        Sign Here
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Use your mouse or finger to draw your signature
                      </p>
                    </div>
                    <div className="bg-white dark:bg-white rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm overflow-hidden">
                      <SignatureCanvas
                        ref={sigPadRef}
                        canvasProps={{
                          className: 'w-full h-32 sm:h-40 cursor-crosshair',
                          style: { touchAction: 'none' },
                        }}
                        penColor="#1e40af"
                        backgroundColor="#ffffff"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <svg
                        className="w-4 h-4 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-xs sm:text-sm">
                        Your signature is required to complete this inspection
                      </span>
                    </div>
                    <div className="flex gap-2 sm:gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (sigPadRef.current) {
                            sigPadRef.current.clear();
                          }
                        }}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                      >
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        <span className="hidden sm:inline">Clear</span>
                        <span className="sm:hidden">Clear</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            sigPadRef.current &&
                            !sigPadRef.current.isEmpty()
                          ) {
                            const dataURL = sigPadRef.current.toDataURL();
                            setSignature(dataURL);
                          } else {
                            toast.error('Please sign before saving', {
                              description:
                                'Draw your signature in the canvas above',
                            });
                          }
                        }}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg transition-all shadow-sm hover:shadow-md"
                      >
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="hidden sm:inline">Save Signature</span>
                        <span className="sm:hidden">Save</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-8 flex items-center justify-end">
          {canEdit && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !canEdit}
              className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring500 transition-all ${
                isSubmitting || !canEdit
                  ? 'cursor-not-allowed'
                  : 'hover:shadow-md hover:-translate-y-0.5'
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <ClipboardDocumentCheckIcon className="w-5 h-5 mr-2" />
                  {inspectionId ? 'Save Changes' : 'Submit Inspection'}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
