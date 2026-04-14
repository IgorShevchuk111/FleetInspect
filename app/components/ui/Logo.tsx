import Link from 'next/link';

interface LogoProps {
  className?: string;
  showLink?: boolean;
}

export default function Logo({ className = '', showLink = true }: LogoProps) {
  const logoContent = (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <span className="text-xl font-bold text-gray-900">
        Fleet<span className="text-blue-600">Inspect</span>
      </span>
    </div>
  );

  if (showLink) {
    return <Link href="/">{logoContent}</Link>;
  }

  return logoContent;
}
