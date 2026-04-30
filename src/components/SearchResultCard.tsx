import { RideWithScore } from "@/lib/matching";

interface Props {
  ride: RideWithScore;
}

const displayPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

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

const scoreLabel = (score: number) => {
  if (score >= 70)
    return { label: "Great match", color: "bg-green-100 text-green-700" };
  if (score >= 40)
    return { label: "Good match", color: "bg-yellow-100 text-yellow-700" };
  return { label: "Loose match", color: "bg-zinc-100 text-zinc-500" };
};

export default function SearchResultCard({ ride }: Props) {
  const departureDate = new Date(ride.departureTime);
  const { label, color } = scoreLabel(ride.score);

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
          💺 {ride.seatsAvailable} seat{ride.seatsAvailable !== 1 ? "s" : ""}{" "}
          available
        </span>
        <span>💰 {displayPrice(ride.pricePerSeat)}/seat</span>
      </div>

      {ride.notes && (
        <p className="text-sm text-zinc-400 italic">"{ride.notes}"</p>
      )}

      {/* Footer: match score + request button */}
      <div className="flex items-center justify-between mt-1">
        <span className={`text-xs font-medium px-3 py-1 rounded-full ${color}`}>
          {label} ({ride.score}/100)
        </span>

        <a
          href={`/rides/${ride.id}/request`}
          className="text-sm font-medium text-purple-700 hover:text-purple-900 transition-colors"
        >
          Request seat →
        </a>
      </div>
    </div>
  );
}
