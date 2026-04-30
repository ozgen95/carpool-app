import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { id: rideId } = await params;

  const ride = await prisma.ride.findUnique({ where: { id: rideId } });
  if (!ride) {
    return NextResponse.json({ error: "Ride not found" }, { status: 404 });
  }

  if (ride.status !== "active") {
    return NextResponse.json({ error: "Ride is not active" }, { status: 400 });
  }

  if (ride.driverId === user.id) {
    return NextResponse.json(
      { error: "You cannot request your own ride" },
      { status: 400 },
    );
  }

  if (ride.seatsAvailable < 1) {
    return NextResponse.json({ error: "No seats available" }, { status: 400 });
  }

  // Check for duplicate request
  const existing = await prisma.rideRequest.findFirst({
    where: { rideId, riderId: user.id },
  });

  if (existing) {
    return NextResponse.json(
      { error: "You already requested this ride" },
      { status: 400 },
    );
  }

  const request = await prisma.rideRequest.create({
    data: {
      rideId,
      riderId: user.id,
      seatsRequested: 1,
      status: "pending",
    },
  });

  return NextResponse.json(request, { status: 201 });
}
