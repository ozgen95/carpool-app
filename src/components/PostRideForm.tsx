"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import PlacesAutocomplete from "./PlacesAutocomplete";

const schema = z.object({
  originName: z.string().min(1, "Origin is required"),
  originLat: z.number(),
  originLng: z.number(),
  destinationName: z.string().min(1, "Destination is required"),
  destinationLat: z.number(),
  destinationLng: z.number(),
  departureTime: z.string().min(1, "Departure time is required"),
  seatsTotal: z.number().min(1).max(8),
  pricePerSeat: z.number().min(0),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function PostRideForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/rides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          departureTime: new Date(data.departureTime).toISOString(),
          pricePerSeat: Math.round(data.pricePerSeat * 100), // convert to cents
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Something went wrong");
      }

      router.push("/rides/mine");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {/* Origin */}
      <div>
        <label className="block text-sm font-medium mb-1">From</label>
        <PlacesAutocomplete
          placeholder="e.g. Toronto, ON"
          onSelect={(name, lat, lng) => {
            setValue("originName", name);
            setValue("originLat", lat);
            setValue("originLng", lng);
          }}
        />
        {errors.originName && (
          <p className="text-red-500 text-sm mt-1">
            {errors.originName.message}
          </p>
        )}
      </div>

      {/* Destination */}
      <div>
        <label className="block text-sm font-medium mb-1">To</label>
        <PlacesAutocomplete
          placeholder="e.g. Montreal, QC"
          onSelect={(name, lat, lng) => {
            setValue("destinationName", name);
            setValue("destinationLat", lat);
            setValue("destinationLng", lng);
          }}
        />
        {errors.destinationName && (
          <p className="text-red-500 text-sm mt-1">
            {errors.destinationName.message}
          </p>
        )}
      </div>

      {/* Departure time */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Departure Date & Time
        </label>
        <input
          type="datetime-local"
          {...register("departureTime")}
          className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2 bg-white dark:bg-zinc-900"
        />
        {errors.departureTime && (
          <p className="text-red-500 text-sm mt-1">
            {errors.departureTime.message}
          </p>
        )}
      </div>

      {/* Seats */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Seats Available
        </label>
        <input
          type="number"
          min={1}
          max={8}
          defaultValue={1}
          {...register("seatsTotal", { valueAsNumber: true })}
          className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2 bg-white dark:bg-zinc-900"
        />
        {errors.seatsTotal && (
          <p className="text-red-500 text-sm mt-1">
            {errors.seatsTotal.message}
          </p>
        )}
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Price per Seat ($)
        </label>
        <input
          type="number"
          min={0}
          step={0.01}
          defaultValue={0}
          {...register("pricePerSeat", { valueAsNumber: true })}
          className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2 bg-white dark:bg-zinc-900"
        />
        {errors.pricePerSeat && (
          <p className="text-red-500 text-sm mt-1">
            {errors.pricePerSeat.message}
          </p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Notes (optional)
        </label>
        <textarea
          {...register("notes")}
          placeholder="e.g. No smoking, one bag only"
          rows={3}
          className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2 bg-white dark:bg-zinc-900"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-12 rounded-full bg-purple-700 text-white font-medium hover:bg-purple-800 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? "Posting..." : "Post Ride"}
      </button>
    </form>
  );
}
