'use client';

export default function Error({ error, reset }) {
  return (
    <main className="flex justify-center items-center flex-col gap-2 mt-6">
      <h1 className="text-3xl font-semibold">Vehicle not found!</h1>

      <button
        className="inline-block bg-accent-500 text-primary-800 px-6 py-3 text-lg"
        onClick={reset}
      >
        Try again
      </button>
    </main>
  );
}
