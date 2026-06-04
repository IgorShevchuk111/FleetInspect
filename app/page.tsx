import Link from 'next/link';
import { getUser } from '@/lib/auth/auth';

export default async function HomePage() {
  const user = await getUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Fleet Inspection <span className="text-blue-600">System</span>
          </h1>

          <div className="flex gap-4 justify-center">
            {user ? (
              <>
                <Link
                  href="/inspection"
                  className="px-6 py-4 bg-blue-600 text-white rounded-lg"
                >
                  Start Inspection
                </Link>

                <Link
                  href="/inspections"
                  className="px-6 py-4 border border-blue-600 text-blue-600 rounded-lg"
                >
                  View Inspections
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="px-6 py-4 bg-blue-600 text-white rounded-lg"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
