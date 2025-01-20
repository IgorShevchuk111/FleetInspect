function SubmitButton({ signature }) {
  if (!signature) return null;
  return (
    <div className="flex justify-center mt-4">
      <button className="bg-blue-500 text-white py-2 px-4 rounded-md shadow max-w-80">
        Submit
      </button>
    </div>
  );
}

export default SubmitButton;
