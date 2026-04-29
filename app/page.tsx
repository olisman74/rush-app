"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { mockToilets as initialToilets, type Toilet } from "@/lib/mock-data";
import { Header } from "@/components/header";
import { MapView } from "@/components/map-view";
import { BottomSheet } from "@/components/bottom-sheet";
import { SOSButton } from "@/components/sos-button";
import { FeedbackModal } from "@/components/feedback-modal";

const DEFAULT_LOCATION = { lat: 37.498095, lng: 127.02761 };

export default function RushApp() {
  const [toilets, setToilets] = useState<Toilet[]>(initialToilets);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>(DEFAULT_LOCATION);
  const [selectedToilet, setSelectedToilet] = useState<Toilet | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackToilet, setFeedbackToilet] = useState<Toilet | null>(null);

  const fetchToilets = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`/api/toilets?lat=${lat}&lng=${lng}`);
      const data = await res.json();
      setToilets(data);
    } catch (error) {
      console.error("Failed to fetch toilets:", error);
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by your browser");
      fetchToilets(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        fetchToilets(latitude, longitude);
      },
      (error) => {
        console.warn("Error getting user location:", error);
        fetchToilets(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  const sortedToilets = useMemo(
    () => [...toilets].sort((a, b) => a.distance - b.distance),
    [toilets],
  );

  const handleSOSPress = useCallback(() => {
    const nearest = sortedToilets[0];
    if (nearest) setSelectedToilet(nearest);
  }, [sortedToilets]);

  const handleNavigate = useCallback((toilet: Toilet) => {
    alert(`${toilet.name}으로 길 안내를 시작합니다!`);
  }, []);

  const handleComplete = useCallback((toilet: Toilet) => {
    setFeedbackToilet(toilet);
    setShowFeedback(true);
    setSelectedToilet(null);
  }, []);

  const handleFeedbackSubmit = useCallback(
    (feedback: "success" | "fail" | "locked") => {
      if (!feedbackToilet) return;

      setToilets((prev) =>
        prev.map((t) => {
          if (t.id !== feedbackToilet.id) return t;
          const prevTotal = t.confirmedUsers;
          const prevSuccessCount = Math.round((t.successRate / 100) * prevTotal);
          const newTotal = prevTotal + 1;
          const newSuccessCount =
            feedback === "success" ? prevSuccessCount + 1 : prevSuccessCount;
          const newSuccessRate = Math.round((newSuccessCount / newTotal) * 100);
          return { ...t, confirmedUsers: newTotal, successRate: newSuccessRate };
        }),
      );

      console.log(`[Feedback] ${feedbackToilet.name}: ${feedback}`);
      setShowFeedback(false);
      setFeedbackToilet(null);
    },
    [feedbackToilet],
  );

  const handleFeedbackClose = useCallback(() => {
    setShowFeedback(false);
    setFeedbackToilet(null);
  }, []);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-background">
      <MapView
        toilets={sortedToilets}
        selectedToilet={selectedToilet}
        onSelectToilet={setSelectedToilet}
        userLocation={userLocation}
      />
      <Header />
      <div className="absolute bottom-44 right-6 z-40">
        <SOSButton onPress={handleSOSPress} />
      </div>
      <BottomSheet
        toilets={sortedToilets}
        selectedToilet={selectedToilet}
        onSelectToilet={setSelectedToilet}
        onNavigate={handleNavigate}
        onComplete={handleComplete}
      />
      {showFeedback && feedbackToilet && (
        <FeedbackModal
          toilet={feedbackToilet}
          onClose={handleFeedbackClose}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </div>
  );
}
