// Data Provider - /src/context/DataContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Types
export type EventItem = {
  id: string;
  title: string;
  category: string;
  date: string;
  posterUrl: string;
};

type DataContextType = {
  events: EventItem[];
  sponsors: string[];
  heroVideoUrl: string;
  addEvent: (event: EventItem) => void;
  removeEvent: (id: string) => void;
  addSponsor: (name: string) => void;
  removeSponsor: (name: string) => void;
  setHeroVideoUrl: (url: string) => void;
};

// Initial Mock Data
const INITIAL_EVENTS: EventItem[] = [];

const INITIAL_SPONSORS = ["NVIDIA", "RED BULL", "LOGITECH", "DISCORD"];

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [sponsors, setSponsors] = useState<string[]>(INITIAL_SPONSORS);
  const [heroVideoUrl, setHeroVideoUrl] = useState<string>("/Ananta 1St Half.mp4");

  // Load from LocalStorage on mount (Client-side persistence)
  useEffect(() => {
    const savedEvents = localStorage.getItem("cybrella_events");
    const savedSponsors = localStorage.getItem("cybrella_sponsors");
    const savedHeroVideo = localStorage.getItem("cybrella_hero_video");
    if (savedEvents) setEvents(JSON.parse(savedEvents));
    if (savedSponsors) setSponsors(JSON.parse(savedSponsors));
    if (savedHeroVideo) setHeroVideoUrl(savedHeroVideo);
  }, []);

  // Save to LocalStorage whenever data changes
  useEffect(() => {
    localStorage.setItem("cybrella_events", JSON.stringify(events));
    localStorage.setItem("cybrella_sponsors", JSON.stringify(sponsors));
    localStorage.setItem("cybrella_hero_video", heroVideoUrl);
  }, [events, sponsors, heroVideoUrl]);

  const addEvent = (event: EventItem) => setEvents([...events, event]);
  const removeEvent = (id: string) => setEvents(events.filter((e) => e.id !== id));

  const addSponsor = (name: string) => setSponsors([...sponsors, name]);
  const removeSponsor = (name: string) => setSponsors(sponsors.filter((s) => s !== name));

  return (
    <DataContext.Provider value={{
      events,
      sponsors,
      heroVideoUrl,
      addEvent,
      removeEvent,
      addSponsor,
      removeSponsor,
      setHeroVideoUrl
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within a DataProvider");
  return context;
};
