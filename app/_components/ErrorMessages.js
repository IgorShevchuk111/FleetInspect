function ErrorMessages() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-80">
      <p>Please complete all mandatory fields (marked with *)</p>
      <div className="flex justify-end mt-4">
        <button className="text-primary-500">Close</button>
      </div>
    </div>
  );
}

export default ErrorMessages;
