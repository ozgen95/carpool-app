import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
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

  const { id } = await params;
  const body = await req.json();

  const request = await prisma.rideRequest.findUnique({
    where: { id },
    include: { ride: true },
  });

  if (!request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  // Only the driver of the ride can accept/decline
  if (request.ride.driverId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.rideRequest.update({
    where: { id },
    data: { status: body.status },
  });

  // If accepted, decrement available seats
  if (body.status === "accepted") {
    const newSeatsAvailable =
      request.ride.seatsAvailable - request.seatsRequested;

    await prisma.ride.update({
      where: { id: request.rideId },
      data: {
        seatsAvailable: newSeatsAvailable,
        status: newSeatsAvailable <= 0 ? "full" : "active",
      },
    });
  }

  return NextResponse.json(updated);
}
