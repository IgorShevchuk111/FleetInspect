import Link from 'next/link';

function LoginMessage() {
  return (
    <div className="grid  ">
      <p className="text-center text-xl py-12 self-center">
        Please{' '}
        <Link href="/login" className="underline text-primary-500">
          log in
        </Link>{' '}
        to complete
        <br /> the inspection now
      </p>
    </div>
  );
}

export default LoginMessage;
