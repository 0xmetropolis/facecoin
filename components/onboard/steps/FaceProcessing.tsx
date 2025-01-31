export function FaceProcessing() {
  return (
    <div className="text-center space-y-4">
      <h2 className="text-2xl font-bold">Processing your face...</h2>
      <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg animate-pulse" />
      <p className="text-gray-600">
        Please wait while we process your image and calculate your rewards
      </p>
    </div>
  );
}
