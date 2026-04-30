import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MessageThread from "@/components/MessageThread";

interface Props {
  params: Promise<{ requestId: string }>;
}

export default async function MessagesPage({ params }: Props) {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/");

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) redirect("/");

  const { requestId } = await params;

  const request = await prisma.rideRequest.findUnique({
    where: { id: requestId },
    include: {
      ride: true,
      rider: { select: { id: true, name: true, email: true } },
      messages: {
        include: {
          sender: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!request) redirect("/");

  // Only the driver or rider can see this thread
  const isDriver = request.ride.driverId === user.id;
  const isRider = request.riderId === user.id;
  if (!isDriver && !isRider) redirect("/");

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          {request.ride.originName} → {request.ride.destinationName}
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          {isDriver
            ? `Chat with ${request.rider.name || request.rider.email}`
            : "Chat with your driver"}
          {" · "}
          <span className="capitalize">{request.status}</span>
        </p>
      </div>

      <MessageThread
        requestId={requestId}
        currentUserId={user.id}
        initialMessages={request.messages}
      />
    </main>
  );
}
