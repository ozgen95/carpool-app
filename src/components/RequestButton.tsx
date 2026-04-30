"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  rideId: string;
}

export default function RequestButton({ rideId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequest = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/rides/${rideId}/request`, {
        method: "POST",
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Something went wrong");
      }

      const data = await res.json();
      router.push(`/messages/${data.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-zinc-500 text-sm">
        Requesting a seat will notify the driver. They can accept or decline
        your request.
      </p>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        onClick={handleRequest}
        disabled={loading}
        className="h-12 rounded-full bg-purple-700 text-white font-medium hover:bg-purple-800 transition-colors disabled:opacity-50"
      >
        {loading ? "Requesting..." : "Request a Seat"}
      </button>
    </div>
  );
}
