import Link from 'next/link';

const ButtonLink = ({ href, label }) => {
  return (
    <Link
      href={href || ''}
      className="inline-block bg-blue-500 text-white py-2 px-4 rounded-md shadow hover:bg-blue-600 text-sm"
    >
      {label || ''}
    </Link>
  );
};

export default ButtonLink;
