import Link from 'next/link';

function Logo() {
  return (
    <Link href="/inspection">
      <h1 className="text-3xl font-bold text-center p-1 text-white">
        FleetInspect
      </h1>
    </Link>
  );
}

export default Logo;
