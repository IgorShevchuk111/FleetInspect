import Link from 'next/link';

export default function Home() {
  return (
    <div className=" mt-6 text-center">
      <h1 className="text-xl font-bold mb-4">Welcome to FleetInspect!</h1>
      <p className="text-lg text-gray-600 mb-6">
        To get started with managing and inspecting your fleet, please sign in.
      </p>
      <Link
        href="/login"
        className="text-white bg-primary-600 hover:bg-primary-700 px-6 py-3 rounded-md"
      >
        Sign In
      </Link>
    </div>
  );
}
