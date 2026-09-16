// function Spinner() {
//   return <div className="spinner text-primary"></div>;
// }

// export default Spinner;
import { cn } from '@/lib/utils/cn';

type SpinnerProps = {
  className?: string;
};

export default function Spinner({ className }: SpinnerProps) {
  return (
    <div
      className={cn(
        'h-10 w-10 rounded-full border-4 border-current border-r-transparent animate-spin text-primary',
        className,
      )}
    />
  );
}
