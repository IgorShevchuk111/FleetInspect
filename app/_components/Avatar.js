import Link from 'next/link';
import { auth } from '../_lib/auth';
import Image from 'next/image';

async function Avatar() {
  const session = await auth();
  return (
    <Link href="#">
      {
        <div className=" relative h-6 w-6">
          <Image
            src={session.user.image}
            alt={session.user.name}
            referrerPolicy="no-referrer"
            className="rounded-full"
            fill
            sizes="(max-width: 768px) 24px, (max-width: 1200px) 32px, 48px"
          />
        </div>
      }
    </Link>
  );
}

export default Avatar;
