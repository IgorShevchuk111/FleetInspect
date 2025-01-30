import InspectionForm from '@/app/_components/InspectionForm';
import { auth } from '@/app/_lib/auth';
import { getInspectionForm } from '@/app/_lib/data_servis';

async function Page({ params, searchParams }) {
  const { vehicleId } = await params;
  const { trip } = await searchParams;

  const session = await auth();
  const { inspectionForm, vehicle } = await getInspectionForm(vehicleId, trip);

  return (
    <InspectionForm
      questions={inspectionForm}
      vehicle={vehicle}
      user={session?.user}
      trip={trip}
    />
  );
}

export default Page;
