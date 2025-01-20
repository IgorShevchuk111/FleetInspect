import Link from 'next/link';

export default function Page() {
  return (
    <div className="text-center space-y-6 mt-4">
      <h1 className="text-3xl font-semibold">Thank you for your inspection!</h1>
      <Link
        href="/inspection"
        className="underline text-xl text-accent-500 inline-block"
      >
        Back to inspection page &rarr;
      </Link>
    </div>
  );
}
