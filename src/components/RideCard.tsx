"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Ride {
  id: string;
  originName: string;
  destinationName: string;
  departureTime: Date;
  seatsAvailable: number;
  seatsTotal: number;
  pricePerSeat: number;
  notes: string | null;
  status: string;
}

interface Props {
  ride: Ride;
}

const displayPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  full: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-zinc-100 text-zinc-500",
};

const formatDate = (date: Date) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
};

const formatTime = (date: Date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export default function RideCard({ ride }: Props) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this ride?")) return;

    setCancelling(true);
    try {
      const res = await fetch(`/api/rides/${ride.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (!res.ok) throw new Error("Failed to cancel");
      router.refresh();
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  const departureDate = new Date(ride.departureTime);

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col gap-3">
      {/* Route */}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-black dark:text-white truncate">
          {ride.originName}
        </span>
        <span className="text-zinc-400">→</span>
        <span className="font-semibold text-black dark:text-white truncate">
          {ride.destinationName}
        </span>
      </div>

      {/* Details row */}
      <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
        <span>
          🗓 {formatDate(departureDate)} at {formatTime(departureDate)}
        </span>
        <span>
          💺 {ride.seatsAvailable}/{ride.seatsTotal} seats left
        </span>
        <span>💰 {displayPrice(ride.pricePerSeat)}/seat</span>
      </div>

      {/* Notes */}
      {ride.notes && (
        <p className="text-sm text-zinc-400 italic">"{ride.notes}"</p>
      )}

      {/* Footer: status + cancel button */}
      <div className="flex items-center justify-between mt-1">
        <span
          className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${
            statusColors[ride.status] || statusColors.active
          }`}
        >
          {ride.status}
        </span>

        {ride.status === "active" && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="text-sm text-red-500 hover:text-red-700 font-medium disabled:opacity-50 transition-colors"
          >
            {cancelling ? "Cancelling..." : "Cancel ride"}
          </button>
        )}
      </div>
    </div>
  );
}
