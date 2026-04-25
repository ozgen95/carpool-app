-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "school" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ride" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "originName" TEXT NOT NULL,
    "originLat" DOUBLE PRECISION NOT NULL,
    "originLng" DOUBLE PRECISION NOT NULL,
    "destinationName" TEXT NOT NULL,
    "destinationLat" DOUBLE PRECISION NOT NULL,
    "destinationLng" DOUBLE PRECISION NOT NULL,
    "departureTime" TIMESTAMP(3) NOT NULL,
    "seatsTotal" INTEGER NOT NULL,
    "seatsAvailable" INTEGER NOT NULL,
    "pricePerSeat" INTEGER NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RideRequest" (
    "id" TEXT NOT NULL,
    "rideId" TEXT NOT NULL,
    "riderId" TEXT NOT NULL,
    "seatsRequested" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RideRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "rideRequestId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripSearch" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "originName" TEXT NOT NULL,
    "destinationName" TEXT NOT NULL,
    "departureDate" TIMESTAMP(3) NOT NULL,
    "resultsCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripSearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedBaseline" (
    "id" TEXT NOT NULL,
    "originName" TEXT NOT NULL,
    "destinationName" TEXT NOT NULL,
    "rideshareEstimateCents" INTEGER NOT NULL,
    "transitEstimateCents" INTEGER,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedBaseline_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Ride" ADD CONSTRAINT "Ride_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RideRequest" ADD CONSTRAINT "RideRequest_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "Ride"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RideRequest" ADD CONSTRAINT "RideRequest_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_rideRequestId_fkey" FOREIGN KEY ("rideRequestId") REFERENCES "RideRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
