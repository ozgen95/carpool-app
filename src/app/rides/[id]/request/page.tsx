import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import RequestButton from "@/components/RequestButton";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RequestRidePage({ params }: Props) {
  const { userId: clerkId } = await auth();

  if (!clerkId) redirect("/");

  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) redirect("/");

  const ride = await prisma.ride.findUnique({ where: { id } });
  if (!ride || ride.status !== "active") redirect("/rides/search");

  // Can't request your own ride
  if (ride.driverId === user.id) redirect("/rides/mine");

  // Check if already requested
  const existingRequest = await prisma.rideRequest.findFirst({
    where: { rideId: id, riderId: user.id },
  });

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <Link
        href="/rides/search"
        className="text-sm text-purple-700 hover:underline mb-8 inline-block"
      >
        ← Back to search
      </Link>

      <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col gap-4 mb-8">
        <h2 className="text-xl font-bold text-black dark:text-white">
          {ride.originName} → {ride.destinationName}
        </h2>
        <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
          <span>🗓 {new Date(ride.departureTime).toLocaleString()}</span>
          <span>💺 {ride.seatsAvailable} seats available</span>
          <span>💰 ${(ride.pricePerSeat / 100).toFixed(2)}/seat</span>
        </div>
        {ride.notes && (
          <p className="text-sm text-zinc-400 italic">"{ride.notes}"</p>
        )}
      </div>

      {existingRequest ? (
        <div className="text-center py-8">
          <p className="text-zinc-500 mb-2">
            You already have a{" "}
            <span className="font-medium capitalize">
              {existingRequest.status}
            </span>{" "}
            request for this ride.
          </p>
          <Link
            href={`/messages/${existingRequest.id}`}
            className="text-purple-700 hover:underline font-medium"
          >
            View messages →
          </Link>
        </div>
      ) : (
        <RequestButton rideId={id} />
      )}
    </main>
  );
}
