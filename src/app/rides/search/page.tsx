import SearchForm from "@/components/SearchForm";

export default function SearchPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2 text-black dark:text-white">
        Find a Ride
      </h1>
      <p className="text-zinc-500 mb-8">
        Enter your trip details and we'll find drivers heading your way.
      </p>
      <SearchForm />
    </main>
  );
}
