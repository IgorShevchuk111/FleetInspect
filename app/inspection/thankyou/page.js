import ButtonLink from '@/app/_components/ButtonLink';
import Link from 'next/link';

export default function Page() {
  return (
    <div className="text-center space-y-6 mt-4">
      <h1 className="text-3xl font-semibold">Thank you for your inspection!</h1>
      <div className=" flex gap-2 justify-center">
        <ButtonLink label="Go to inspection page" href="/inspection" />
        <ButtonLink label="Go to my inspections" href="/inspections" />
      </div>
    </div>
  );
}
