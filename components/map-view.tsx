"use client";

import { useEffect, useRef, useState } from "react";
import type { Toilet } from "@/lib/mock-data";

interface MapViewProps {
  toilets: Toilet[];
  selectedToilet: Toilet | null;
  onSelectToilet: (toilet: Toilet) => void;
  userLocation: { lat: number; lng: number };
}

/** 화장실 유형별 마커 색상 */
function getPinHexColor(type: Toilet["type"]): string {
  switch (type) {
    case "partner":
      return "#10b981"; // green-500
    case "public":
      return "#3b82f6"; // blue-500
    case "unknown":
      return "#6b7280"; // gray-500
  }
}

/** SVG 마커 아이콘 HTML (색상 + 선택 효과) */
function createMarkerSvg(color: string, isSelected: boolean): string {
  const size = isSelected ? 44 : 36;
  const ring = isSelected
    ? '<circle cx="18" cy="18" r="17" fill="none" stroke="#0f172a" stroke-width="2"/>'
    : "";
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="16" fill="${color}" stroke="white" stroke-width="3"/>
      ${ring}
      <path fill="white" d="M18 10c-3.3 0-6 2.7-6 6 0 4.5 6 10 6 10s6-5.5 6-10c0-3.3-2.7-6-6-6zm0 8.2c-1.2 0-2.2-1-2.2-2.2s1-2.2 2.2-2.2 2.2 1 2.2 2.2-1 2.2-2.2 2.2z"/>
    </svg>
  `;
}

export function MapView({ toilets, selectedToilet, onSelectToilet, userLocation }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<Map<string, any>>(new Map());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  // ─────────────────────────────────────────────────────────
  // 1) Leaflet 동적 로드 + 지도 초기화 (최초 1회)
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    import("leaflet").then((leafletModule) => {
      if (cancelled || !containerRef.current) return;

      const L = leafletModule.default;
      LRef.current = L;

      if (mapRef.current) return;

      const map = L.map(containerRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 16,
        zoomControl: false,       // ✨ +/- 컨트롤 숨김 (공간 확보)
        attributionControl: false, // ✨ 저작권 표시 숨김 (나중에 별도 표시)
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      // 현재 위치 표시
      const locationMarker = L.circleMarker([userLocation.lat, userLocation.lng], {
        radius: 8,
        fillColor: "#ef4444",
        color: "#ffffff",
        weight: 3,
        opacity: 1,
        fillOpacity: 0.9,
      })
        .bindTooltip("내 위치", { permanent: false, direction: "top" })
        .addTo(map);

      // Save user location marker to ref for future updates
      LRef.current.userLocationMarker = locationMarker;

      mapRef.current = map;
      setIsReady(true);
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current.clear();
    };
  }, []);

  // ─────────────────────────────────────────────────────────
  // 2) 마커 그리기 / 업데이트
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isReady || !mapRef.current || !LRef.current) return;

    const L = LRef.current;
    const map = mapRef.current;
    const markers = markersRef.current;
    const currentIds = new Set(toilets.map((t) => t.id));

    markers.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        map.removeLayer(marker);
        markers.delete(id);
      }
    });

    toilets.forEach((toilet) => {
      const isSelected = selectedToilet?.id === toilet.id;
      const color = getPinHexColor(toilet.type);
      const iconSize: [number, number] = isSelected ? [44, 44] : [36, 36];
      const iconAnchor: [number, number] = isSelected ? [22, 44] : [18, 36];

      const divIcon = L.divIcon({
        className: "custom-toilet-marker",
        html: createMarkerSvg(color, isSelected),
        iconSize,
        iconAnchor,
      });

      const existing = markers.get(toilet.id);
      if (existing) {
        existing.setIcon(divIcon);
      } else {
        const marker = L.marker([toilet.lat, toilet.lng], {
          icon: divIcon,
          title: toilet.name,
        })
          .bindTooltip(toilet.name, {
            direction: "top",
            offset: [0, -iconSize[1] / 2],
          })
          .addTo(map);

        marker.on("click", () => {
          onSelectToilet(toilet);
        });

        markers.set(toilet.id, marker);
      }
    });
  }, [isReady, toilets, selectedToilet, onSelectToilet]);

  // ─────────────────────────────────────────────────────────
  // 3) 선택된 화장실로 지도 중심 이동 및 내 위치 업데이트
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isReady || !mapRef.current) return;
    
    // Update user location marker if it exists
    if (LRef.current?.userLocationMarker) {
      LRef.current.userLocationMarker.setLatLng([userLocation.lat, userLocation.lng]);
    }
    
    if (!selectedToilet) return;
    mapRef.current.flyTo([selectedToilet.lat, selectedToilet.lng], 17, {
      duration: 0.5,
    });
  }, [isReady, selectedToilet, userLocation]);

  return (
    // ✨ 핵심: isolation-isolate 로 stacking context 만들기 + z-0 명시
    <div className="absolute inset-0 bg-muted isolate" style={{ zIndex: 0 }}>
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{ background: "#e5e7eb", zIndex: 0 }}
      />

      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 1 }}>
          <div className="text-muted-foreground/50 text-center">
            <div className="text-6xl mb-2 animate-pulse">🗺️</div>
            <p className="text-sm">지도 불러오는 중...</p>
          </div>
        </div>
      )}
    </div>
  );
}