import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import RideCard from "@/components/RideCard";

export default async function MyRidesPage() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!user) {
    redirect("/");
  }

  const rides = await prisma.ride.findMany({
    where: { driverId: user.id },
    orderBy: { departureTime: "asc" },
  });

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">
            My Rides
          </h1>
          <p className="text-zinc-500 mt-1">Rides you've posted as a driver</p>
        </div>
        <a
          href="/rides/new"
          className="h-10 px-5 flex items-center rounded-full bg-purple-700 text-white text-sm font-medium hover:bg-purple-800 transition-colors"
        >
          + Post a Ride
        </a>
      </div>

      {rides.length === 0 ? (
        <div className="text-center py-20 text-zinc-400">
          <p className="text-lg">You haven't posted any rides yet.</p>
          <a
            href="/rides/new"
            className="mt-4 inline-block text-purple-700 font-medium hover:underline"
          >
            Post your first ride →
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {rides.map((ride) => (
            <RideCard key={ride.id} ride={ride} />
          ))}
        </div>
      )}
    </main>
  );
}
