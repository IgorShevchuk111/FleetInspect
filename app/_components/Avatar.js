import Image from 'next/image';

function Avatar({ avatar, alt, height, width }) {
  return (
    <Image
      src={avatar}
      alt={alt}
      referrerPolicy="no-referrer"
      className="rounded-full"
      height={height}
      width={width}
    />
  );
}

export default Avatar;
