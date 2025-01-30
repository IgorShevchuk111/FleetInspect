import ButtonLink from '@/app/_components/ButtonLink';
import Link from 'next/link';

export default function Page() {
  return (
    <div className="text-center space-y-6 px-4 py-6">
      <h1 className="text-3xl font-semibold">Thank you for your inspection!</h1>
      <div className=" flex gap-2 justify-center">
        <ButtonLink label="Inspection page" href="/inspection" />
        <ButtonLink label="My inspections" href="/inspections" />
      </div>
    </div>
  );
}
