import Filter from './Filter';
import SortBy from './SortBy';

function InspectionOperations() {
  return (
    <div className=" flex justify-end gap-1 mb-4 items-center">
      <Filter />
      <SortBy />
    </div>
  );
}

export default InspectionOperations;
