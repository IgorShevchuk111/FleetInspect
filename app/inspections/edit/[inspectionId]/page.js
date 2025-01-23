import InspectionForm from '@/app/_components/InspectionForm';
import { auth } from '@/app/_lib/auth';
import { getInspection, getInspectionForm } from '@/app/_lib/data_servis';

async function page({ params }) {
  const { inspectionId } = params;
  const session = await auth();
  const inspection = await getInspection(inspectionId);

  const { inspectionForm, vehicle } = await getInspectionForm(
    inspection.vehicleId,
    inspection.trip
  );

  return (
    <InspectionForm
      questions={inspectionForm}
      vehicle={vehicle}
      user={session.user}
      trip={inspection.trip}
      inspection={inspection}
    />
  );
}

export default page;
