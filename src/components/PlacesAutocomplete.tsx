"use client";

import { useMemo, useState } from "react";
import { APIProvider, useMapsLibrary } from "@vis.gl/react-google-maps";

interface Props {
  placeholder: string;
  onSelect: (name: string, lat: number, lng: number) => void;
}

function AutocompleteInput({ placeholder, onSelect }: Props) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const places = useMapsLibrary("places");

  const autocompleteService = useMemo(() => {
    if (!places) return null;
    return new places.AutocompleteService();
  }, [places]);

  const placesService = useMemo(() => {
    if (!places) return null;
    return new places.PlacesService(document.createElement("div"));
  }, [places]);

  const handleInput = async (value: string) => {
    setInputValue(value);
    if (!autocompleteService || value.length < 2) {
      setSuggestions([]);
      return;
    }

    autocompleteService.getPlacePredictions(
      { input: value, types: ["(cities)"] },
      (predictions: any[] | null) => {
        setSuggestions(predictions || []);
      },
    );
  };

  const handleSelect = (placeId: string, description: string) => {
    if (!placesService) return;
    setInputValue(description);
    setSuggestions([]);

    placesService.getDetails(
      { placeId, fields: ["geometry", "formatted_address", "name"] },
      (place: any) => {
        if (!place?.geometry?.location) return;
        onSelect(
          place.formatted_address || place.name || description,
          place.geometry.location.lat(),
          place.geometry.location.lng(),
        );
      },
    );
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => handleInput(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2 bg-white dark:bg-zinc-900"
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg mt-1 shadow-lg max-h-60 overflow-auto">
          {suggestions.map((s) => (
            <li
              key={s.place_id}
              onClick={() => handleSelect(s.place_id, s.description)}
              className="px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer text-sm"
            >
              {s.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function PlacesAutocomplete({ placeholder, onSelect }: Props) {
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY!}>
      <AutocompleteInput placeholder={placeholder} onSelect={onSelect} />
    </APIProvider>
  );
}
