"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface RideRequest {
  id: string;
  status: string;
  rider: {
    name: string | null;
    email: string;
  };
}

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
  requests?: RideRequest[];
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
  const [processingId, setProcessingId] = useState<string | null>(null);

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
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  const handleRequestAction = async (
    requestId: string,
    action: "accepted" | "declined",
  ) => {
    setProcessingId(requestId);
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
      if (!res.ok) throw new Error("Failed to update request");
      router.refresh();
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const departureDate = new Date(ride.departureTime);
  const pendingRequests =
    ride.requests?.filter((r) => r.status === "pending") || [];
  const acceptedRequests =
    ride.requests?.filter((r) => r.status === "accepted") || [];

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

      {/* Details */}
      <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
        <span>
          🗓 {formatDate(departureDate)} at {formatTime(departureDate)}
        </span>
        <span>
          💺 {ride.seatsAvailable}/{ride.seatsTotal} seats left
        </span>
        <span>💰 {displayPrice(ride.pricePerSeat)}/seat</span>
      </div>

      {ride.notes && (
        <p className="text-sm text-zinc-400 italic">"{ride.notes}"</p>
      )}

      {/* Pending requests */}
      {pendingRequests.length > 0 && (
        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 flex flex-col gap-2">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
            Pending Requests ({pendingRequests.length})
          </p>
          {pendingRequests.map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between gap-2"
            >
              <span className="text-sm text-zinc-600 dark:text-zinc-300 truncate">
                {req.rider.name || req.rider.email}
              </span>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleRequestAction(req.id, "accepted")}
                  disabled={processingId === req.id}
                  className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 hover:bg-green-200 font-medium disabled:opacity-50"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleRequestAction(req.id, "declined")}
                  disabled={processingId === req.id}
                  className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 font-medium disabled:opacity-50"
                >
                  Decline
                </button>
                <Link
                  href={`/messages/${req.id}`}
                  className="text-xs px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200 font-medium"
                >
                  Message
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Accepted riders */}
      {acceptedRequests.length > 0 && (
        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 flex flex-col gap-2">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
            Accepted Riders ({acceptedRequests.length})
          </p>
          {acceptedRequests.map((req) => (
            <div key={req.id} className="flex items-center justify-between">
              <span className="text-sm text-zinc-600 dark:text-zinc-300 truncate">
                {req.rider.name || req.rider.email}
              </span>
              <Link
                href={`/messages/${req.id}`}
                className="text-xs px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200 font-medium"
              >
                Message
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
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
