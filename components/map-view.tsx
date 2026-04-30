"use client";

import { useEffect, useRef } from "react";
import { Map, CustomOverlayMap, useKakaoLoader } from "react-kakao-maps-sdk";
import type { Toilet } from "@/lib/mock-data";

interface MapViewProps {
  toilets: Toilet[];
  selectedToilet: Toilet | null;
  onSelectToilet: (toilet: Toilet) => void;
  userLocation: { lat: number; lng: number };
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kakao: any;
  }
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
  const [loading, error] = useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY as string,
    libraries: ["clusterer", "services"],
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (loading || error || !mapRef.current || !selectedToilet) return;
    const moveLatLon = new window.kakao.maps.LatLng(selectedToilet.lat, selectedToilet.lng);
    mapRef.current.panTo(moveLatLon);
  }, [loading, error, selectedToilet]);

  useEffect(() => {
    // 최초 위치 설정 시 부드럽게 이동, 혹은 선택된 화장실이 없을 때
    if (loading || error || !mapRef.current || selectedToilet) return;
    const moveLatLon = new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng);
    mapRef.current.panTo(moveLatLon);
  }, [loading, error, userLocation, selectedToilet]);

  const isReady = !loading && !error;

  return (
    <div className="absolute inset-0 bg-muted isolate" style={{ zIndex: 0 }}>
      {isReady ? (
        <Map
          center={{ lat: userLocation.lat, lng: userLocation.lng }}
          style={{ width: "100%", height: "100%", background: "#e5e7eb" }}
          level={3}
          ref={mapRef}
          isPanto={true}
        >
          {/* 내 위치 마커 */}
          <CustomOverlayMap position={{ lat: userLocation.lat, lng: userLocation.lng }} zIndex={2}>
            <div className="relative flex flex-col items-center pointer-events-none">
              <div className="w-4 h-4 bg-red-500 rounded-full border-[3px] border-white shadow-md relative z-10" />
              <div className="absolute -top-7 whitespace-nowrap px-2 py-1 bg-white/90 text-xs rounded shadow-sm font-semibold z-20">
                내 위치
              </div>
            </div>
          </CustomOverlayMap>

          {/* 화장실 마커들 */}
          {toilets.map((toilet) => {
            const isSelected = selectedToilet?.id === toilet.id;
            const color = getPinHexColor(toilet.type);
            const svgString = createMarkerSvg(color, isSelected);

            return (
              <CustomOverlayMap 
                key={toilet.id} 
                position={{ lat: toilet.lat, lng: toilet.lng }}
                zIndex={isSelected ? 10 : 1}
              >
                <div 
                  onClick={() => onSelectToilet(toilet)}
                  className="cursor-pointer flex flex-col items-center"
                >
                  {/* Tooltip for toilet name */}
                  <div className="absolute -top-7 whitespace-nowrap px-2 py-1 bg-white/90 text-[10px] rounded shadow-sm font-semibold pointer-events-none text-slate-800 transition-all duration-200"
                    style={{
                      transform: isSelected ? 'translateY(-4px)' : 'translateY(0)',
                      opacity: isSelected ? 1 : 0.8
                    }}
                  >
                    {toilet.name}
                  </div>
                  <div
                    className="flex justify-center items-center drop-shadow-md transition-transform duration-200 hover:scale-105"
                    dangerouslySetInnerHTML={{ __html: svgString }}
                  />
                </div>
              </CustomOverlayMap>
            );
          })}
        </Map>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-[#e5e7eb]" style={{ zIndex: 1 }}>
          <div className="text-muted-foreground/50 text-center flex flex-col items-center gap-2">
            <div className="text-6xl mb-2 animate-pulse">🗺️</div>
            {error ? (
              <p className="text-sm text-red-500 font-semibold">지도 스크립트를 불러오는데 실패했습니다.<br/>앱 키나 도메인 설정을 확인해주세요.</p>
            ) : (
              <p className="text-sm">지도 불러오는 중...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}