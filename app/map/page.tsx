import MapWrapper from '@/features/map/components/MapWrapper';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold mb-8">Fleet Inspect Map</h1>
      <div className="w-full max-w-5xl h-[500px]">
        <MapWrapper />
      </div>
    </main>
  );
}
