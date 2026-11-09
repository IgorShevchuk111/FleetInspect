import TachographClient from '@/features/driver-journal/components/tachograph/tachograph-client';
import { getLatestShift } from '@/features/driver-journal/queries/get-latest-shift';
import { getTachographData } from '@/features/driver-journal/queries/get-tachograph-data';

export default async function TachographPage() {
  const [latestShiftResult, tachographDataResult] = await Promise.all([
    getLatestShift(),
    getTachographData(),
  ]);

  if (latestShiftResult.success === false) {
    return (
      <TachographClient
        initialShift={null}
        initialError={latestShiftResult.error}
        initialShifts={[]}
        initialRestCompensations={[]}
        initialBreaks={[]}
      />
    );
  }

  if (tachographDataResult.success === false) {
    return (
      <TachographClient
        initialShift={latestShiftResult.shift}
        initialError={tachographDataResult.error}
        initialShifts={[]}
        initialRestCompensations={[]}
        initialBreaks={[]}
      />
    );
  }

  return (
    <TachographClient
      initialShift={latestShiftResult.shift}
      initialError={null}
      initialShifts={tachographDataResult.data.shifts}
      initialRestCompensations={tachographDataResult.data.restCompensations}
      initialBreaks={tachographDataResult.data.breaks}
    />
  );
}
