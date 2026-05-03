import { prisma } from "@/lib/prisma";

interface SearchParams {
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
  departureTime: Date;
  seatsRequested: number;
}

export interface RideWithScore {
  id: string;
  driverId: string;
  originName: string;
  originLat: number;
  originLng: number;
  destinationName: string;
  destinationLat: number;
  destinationLng: number;
  departureTime: Date;
  seatsAvailable: number;
  seatsTotal: number;
  pricePerSeat: number;
  notes: string | null;
  status: string;
  createdAt: Date;
  score: number;
}

// Haversine formula — great circle distance between two lat/lng points in km
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function scoreRide(ride: any, params: SearchParams): number {
  // Distance score (50% of total)
  // How far is the ride's origin from the rider's origin?
  // How far is the ride's destination from the rider's destination?
  const originDetour = haversineDistance(
    params.originLat,
    params.originLng,
    ride.originLat,
    ride.originLng,
  );
  const destDetour = haversineDistance(
    params.destinationLat,
    params.destinationLng,
    ride.destinationLat,
    ride.destinationLng,
  );
  const totalDetour = originDetour + destDetour;
  // 0km detour = 100 points, 20km+ detour = 0 points
  const distanceScore = Math.max(0, 100 - totalDetour * 5);

  // Time score (40% of total)
  // How close is the ride's departure to the rider's desired time?
  const timeDiffMs = Math.abs(
    ride.departureTime.getTime() - params.departureTime.getTime(),
  );
  const timeDiffMinutes = timeDiffMs / (1000 * 60);
  // Exact match = 100 points, 3 hours off = 0 points
  const timeScore = Math.max(0, 100 - timeDiffMinutes / 1.8);

  // Freshness score (10% of total)
  // Rides posted recently get a slight boost
  const ageMs = Date.now() - ride.createdAt.getTime();
  const ageHours = ageMs / (1000 * 60 * 60);
  const freshnessScore = Math.max(0, 100 - ageHours * 2);

  return distanceScore * 0.5 + timeScore * 0.4 + freshnessScore * 0.1;
}

export async function searchRides(
  params: SearchParams,
): Promise<RideWithScore[]> {
  const GEO_DELTA = 0.5; // ~55km bounding box

  // Step 1: Hard filter in SQL — narrow the universe fast
  const candidates = await prisma.ride.findMany({
    where: {
      status: "active",
      seatsAvailable: { gte: params.seatsRequested },
      departureTime: {
        gte: new Date(params.departureTime.getTime() - 12 * 60 * 60 * 1000),
        lte: new Date(params.departureTime.getTime() + 12 * 60 * 60 * 1000),
      },
      originLat: {
        gte: params.originLat - GEO_DELTA,
        lte: params.originLat + GEO_DELTA,
      },
      originLng: {
        gte: params.originLng - GEO_DELTA,
        lte: params.originLng + GEO_DELTA,
      },
      destinationLat: {
        gte: params.destinationLat - GEO_DELTA,
        lte: params.destinationLat + GEO_DELTA,
      },
      destinationLng: {
        gte: params.destinationLng - GEO_DELTA,
        lte: params.destinationLng + GEO_DELTA,
      },
    },
    take: 100,
  });

  // Step 2: Score each candidate in app code
  const scored = candidates.map((ride) => ({
    ...ride,
    score: Math.round(scoreRide(ride, params)),
  }));

  // Step 3: Sort by score descending, return top 20
  return scored.sort((a, b) => b.score - a.score).slice(0, 20);
}
