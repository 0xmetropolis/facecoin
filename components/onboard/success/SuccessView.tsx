"use client";

export function SuccessView() {
  const tokenAmount = calculateTokenAmount(5);

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold mb-4">
          Congrats Facecoin Terminal Has Given You
        </h1>
        <p className="text-4xl font-bold text-purple-600 mb-6">
          {tokenAmount.toLocaleString()} Facecoin
        </p>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Farcaster For 2x bonus</p>
        </div>
      </div>
    </div>
  );
}

function calculateTokenAmount(followerCount: number): number {
  // Basic calculation - can be adjusted based on your tokenomics
  const baseAmount = 10000;
  const followerBonus = Math.floor(followerCount * 1.5);
  return baseAmount + followerBonus;
}
