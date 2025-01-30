import Link from 'next/link';

function Logo() {
  return (
    <Link href="/inspection">
      <h1 className="text-4xl font-bold ">FleetInspect</h1>
    </Link>
  );
}

export default Logo;
