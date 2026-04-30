import { searchRides } from "@/lib/matching";
import { prisma } from "@/lib/prisma";
import SearchResultCard from "@/components/SearchResultCard";
import Link from "next/link";

interface Props {
  searchParams: Promise<{
    originName: string;
    originLat: string;
    originLng: string;
    destinationName: string;
    destinationLat: string;
    destinationLng: string;
    departureTime: string;
    seats: string;
  }>;
}

export default async function SearchResultsPage({ searchParams }: Props) {
  const params = await searchParams;

  const rides = await searchRides({
    originLat: parseFloat(params.originLat),
    originLng: parseFloat(params.originLng),
    destinationLat: parseFloat(params.destinationLat),
    destinationLng: parseFloat(params.destinationLng),
    departureTime: new Date(params.departureTime),
    seatsRequested: parseInt(params.seats),
  });

  // Log the search for analytics
  await prisma.tripSearch.create({
    data: {
      originName: params.originName,
      destinationName: params.destinationName,
      departureDate: new Date(params.departureTime),
      resultsCount: rides.length,
    },
  });

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black dark:text-white">
          {params.originName} → {params.destinationName}
        </h1>
        <p className="text-zinc-500 mt-1">
          {rides.length} ride{rides.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {rides.length === 0 ? (
        <div className="text-center py-20 text-zinc-400">
          <p className="text-lg">No rides found for this route.</p>
          <p className="text-sm mt-2">Try a different time or nearby cities.</p>
          <Link
            href="/rides/search"
            className="mt-4 inline-block text-purple-700 font-medium hover:underline"
          >
            ← Search again
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {rides.map((ride) => (
            <SearchResultCard key={ride.id} ride={ride} />
          ))}
        </div>
      )}

      <div className="mt-8">
        <Link
          href="/rides/search"
          className="text-sm text-purple-700 hover:underline"
        >
          ← Search again
        </Link>
      </div>
    </main>
  );
}
