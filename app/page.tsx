'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Logo from './components/ui/Logo';
import {
  ClipboardIcon,
  TruckIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  ClockIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

export default function HomePage() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-12 sm:mb-6">
              Fleet Inspection
              <span className="text-blue-600"> System</span>
            </h1>
            <p className="hidden md:block text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8 px-2">
              Streamline your vehicle inspections with our comprehensive digital
              solution. Track, manage, and maintain your fleet with ease and
              precision.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              {!isLoading && (
                <>
                  {session ? (
                    // Logged in user - show inspection buttons
                    <>
                      <Link
                        href="/inspection"
                        className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
                      >
                        Start Inspection
                      </Link>
                      <Link
                        href="/inspections"
                        className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all duration-200"
                      >
                        View Inspections
                      </Link>
                    </>
                  ) : (
                    // Not logged in - show only get started button
                    <>
                      <Link
                        href="/login"
                        className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
                      >
                        Get Started
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Everything you need for fleet management
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
              Our comprehensive platform provides all the tools you need to keep
              your fleet running safely and efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
                <ClipboardIcon className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                Digital Forms
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Replace paper forms with our comprehensive digital inspection
                checklists that adapt to your specific needs.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
                <TruckIcon className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                Fleet Management
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Track and manage your entire fleet in one centralized location
                with real-time updates and notifications.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
                <MagnifyingGlassIcon className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                Quick Search
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Find vehicle records, inspection history, and maintenance
                schedules instantly with our powerful search feature.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-100 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
                <ChartBarIcon className="w-6 h-6 sm:w-7 sm:h-7 text-orange-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                Analytics & Reports
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Generate detailed reports and analytics to track fleet
                performance, maintenance schedules, and compliance.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-100 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
                <ClockIcon className="w-6 h-6 sm:w-7 sm:h-7 text-red-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                Time Tracking
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Monitor driver hours, vehicle usage, and maintenance intervals
                with our integrated time tracking system.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
                <ShieldCheckIcon className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                Safety & Compliance
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Ensure regulatory compliance and maintain safety standards with
                automated alerts and documentation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 sm:py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Prioritize fleet safety and compliance
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-8 px-2">
            Ensure your vehicles meet safety standards and regulatory
            requirements with our comprehensive inspection system.
          </p>
          <Link
            href="/inspection"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-4 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:bg-blue-50 transition-all duration-200 transform hover:scale-105"
          >
            Start Your First Inspection
          </Link>
        </div>
      </div>
    </div>
  );
}
