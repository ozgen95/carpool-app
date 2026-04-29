import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import PostRideForm from "@/components/PostRideForm";

export default async function NewRidePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2 text-black dark:text-white">
        Post a Ride
      </h1>
      <p className="text-zinc-500 mb-8">
        Fill in your trip details and we'll match you with riders heading the
        same way.
      </p>
      <PostRideForm />
    </main>
  );
}
