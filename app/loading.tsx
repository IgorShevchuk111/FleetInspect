import Spinner from '@/components/ui/Spinner';

export default function Loading() {
  return (
    <div className="flex justify-center min-h-screen pt-10">
      <Spinner className="h-12 w-12" />
    </div>
  );
}
