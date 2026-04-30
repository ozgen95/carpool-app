"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PlacesAutocomplete from "@/components/PlacesAutocomplete";

export default function SearchForm() {
  const router = useRouter();
  const [origin, setOrigin] = useState({ name: "", lat: 0, lng: 0 });
  const [destination, setDestination] = useState({ name: "", lat: 0, lng: 0 });
  const [departureTime, setDepartureTime] = useState("");
  const [seats, setSeats] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!origin.name || origin.lat === 0) {
      setError("Please select an origin from the dropdown.");
      return;
    }
    if (!destination.name || destination.lat === 0) {
      setError("Please select a destination from the dropdown.");
      return;
    }
    if (!departureTime) {
      setError("Please select a departure date and time.");
      return;
    }

    const params = new URLSearchParams({
      originName: origin.name,
      originLat: origin.lat.toString(),
      originLng: origin.lng.toString(),
      destinationName: destination.name,
      destinationLat: destination.lat.toString(),
      destinationLng: destination.lng.toString(),
      departureTime,
      seats: seats.toString(),
    });

    router.push(`/rides/search/results?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <label className="block text-sm font-medium mb-1">From</label>
        <PlacesAutocomplete
          placeholder="e.g. Toronto, ON"
          onSelect={(name, lat, lng) => setOrigin({ name, lat, lng })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">To</label>
        <PlacesAutocomplete
          placeholder="e.g. Montreal, QC"
          onSelect={(name, lat, lng) => setDestination({ name, lat, lng })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Departure Date & Time
        </label>
        <input
          type="datetime-local"
          value={departureTime}
          onChange={(e) => setDepartureTime(e.target.value)}
          className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2 bg-white dark:bg-zinc-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Seats Needed</label>
        <input
          type="number"
          min={1}
          max={8}
          value={seats}
          onChange={(e) => setSeats(Number(e.target.value))}
          className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2 bg-white dark:bg-zinc-900"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        className="h-12 rounded-full bg-purple-700 text-white font-medium hover:bg-purple-800 transition-colors"
      >
        Search Rides
      </button>
    </form>
  );
}
