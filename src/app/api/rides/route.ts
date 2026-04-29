import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  originName: z.string().min(1),
  originLat: z.number(),
  originLng: z.number(),
  destinationName: z.string().min(1),
  destinationLat: z.number(),
  destinationLng: z.number(),
  departureTime: z.string(),
  seatsTotal: z.number().min(1).max(8),
  pricePerSeat: z.number().min(0),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // Look up our internal user from the clerkId
  const user = await prisma.user.findUnique({ where: { clerkId } });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const data = parsed.data;

  const ride = await prisma.ride.create({
    data: {
      driverId: user.id,
      originName: data.originName,
      originLat: data.originLat,
      originLng: data.originLng,
      destinationName: data.destinationName,
      destinationLat: data.destinationLat,
      destinationLng: data.destinationLng,
      departureTime: new Date(data.departureTime),
      seatsTotal: data.seatsTotal,
      seatsAvailable: data.seatsTotal,
      pricePerSeat: data.pricePerSeat,
      notes: data.notes,
    },
  });

  return NextResponse.json(ride, { status: 201 });
}
