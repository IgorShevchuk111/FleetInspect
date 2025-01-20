import { auth } from './_lib/auth';

export default async function Home() {
  const session = await auth();
  return (
    <div className="text-center">
      {!session?.user && <h1>Please Sign in</h1>}
    </div>
  );
}
