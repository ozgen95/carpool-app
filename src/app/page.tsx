import Link from "next/link";
import { Show, SignInButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-3xl flex flex-col items-center text-center gap-8">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-black dark:text-white leading-tight">
          Share the ride.
          <br />
          <span className="text-purple-700">Split the cost.</span>
        </h1>

        <p className="max-w-xl text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Find students heading the same way and travel for a fraction of the
          price of rideshare or transit.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="h-12 px-8 rounded-full bg-purple-700 text-white font-medium hover:bg-purple-800 transition-colors">
                Get started
              </button>
            </SignInButton>
            <Link
              href="/rides/search"
              className="h-12 px-8 flex items-center justify-center rounded-full border border-zinc-300 dark:border-zinc-700 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              Browse rides
            </Link>
          </Show>

          <Show when="signed-in">
            <Link
              href="/rides/new"
              className="h-12 px-8 flex items-center justify-center rounded-full bg-purple-700 text-white font-medium hover:bg-purple-800 transition-colors"
            >
              Post a ride
            </Link>
            <Link
              href="/rides/search"
              className="h-12 px-8 flex items-center justify-center rounded-full border border-zinc-300 dark:border-zinc-700 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              Find a ride
            </Link>
          </Show>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 w-full">
          <FeatureCard
            title="Save money"
            description="Travel for less than the cost of a bus ticket on most routes."
          />
          <FeatureCard
            title="Easy matching"
            description="We find drivers heading your way at the time you need."
          />
          <FeatureCard
            title="Built for students"
            description="A community of UofT students sharing rides home and beyond."
          />
        </div>
      </div>
    </main>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-left">
      <h3 className="font-semibold text-lg mb-2 text-black dark:text-white">
        {title}
      </h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
