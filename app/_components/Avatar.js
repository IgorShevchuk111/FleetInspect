'use client';
import Image from 'next/image';

function Avatar({ avatar, alt }) {
  return (
    <div className=" relative h-6 w-6">
      <Image
        src={avatar}
        alt={alt}
        referrerPolicy="no-referrer"
        className="rounded-full"
        fill
        sizes="(max-width: 768px) 24px, (max-width: 1200px) 32px, 48px"
      />
    </div>
  );
}

export default Avatar;
