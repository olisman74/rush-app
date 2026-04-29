// lib/dummy-data.ts
// 강남역 주변 긴급 화장실 더미 데이터
// 추후 백엔드 API 연동 시 이 타입을 DTO로 재사용 가능

export type ToiletType = "public" | "cafe" | "commercial" | "subway";

export interface Toilet {
  id: string;
  name: string;
  type: ToiletType;
  lat: number;
  lng: number;
  address: string;
  /** 0~100 (%) */
  successRate: number;
  reviewCount: number;
  isOpen: boolean;
  hours: string;
  features: string[];
  /** ISO 8601 */
  lastUpdated: string;
}

/** 지도 초기 중심 좌표 (강남역 2번 출구 부근) */
export const GANGNAM_CENTER = {
  lat: 37.4979,
  lng: 127.0276,
} as const;

/** 강남역 반경 ~500m 이내 5개 화장실 */
export const TOILETS: Toilet[] = [
  {
    id: "t-001",
    name: "강남역 지하 공중화장실",
    type: "subway",
    lat: 37.4979,
    lng: 127.0276,
    address: "서울 강남구 강남대로 396 강남역 지하 1층",
    successRate: 92,
    reviewCount: 1247,
    isOpen: true,
    hours: "05:30 - 24:00",
    features: ["무료", "휠체어", "기저귀교환대"],
    lastUpdated: "2026-04-22T08:15:00+09:00",
  },
  {
    id: "t-002",
    name: "스타벅스 강남R점",
    type: "cafe",
    lat: 37.4986,
    lng: 127.0269,
    address: "서울 강남구 강남대로 390",
    successRate: 78,
    reviewCount: 412,
    isOpen: true,
    hours: "07:00 - 22:00",
    features: ["음료구매권장", "깨끗함", "비밀번호"],
    lastUpdated: "2026-04-22T09:02:00+09:00",
  },
  {
    id: "t-003",
    name: "CGV 강남 화장실",
    type: "commercial",
    lat: 37.4972,
    lng: 127.0283,
    address: "서울 강남구 강남대로 438 스타플렉스 B1",
    successRate: 85,
    reviewCount: 689,
    isOpen: true,
    hours: "10:00 - 24:00",
    features: ["무료입장", "넓음"],
    lastUpdated: "2026-04-22T07:45:00+09:00",
  },
  {
    id: "t-004",
    name: "교보타워 1층 화장실",
    type: "commercial",
    lat: 37.5005,
    lng: 127.0252,
    address: "서울 강남구 강남대로 465 교보타워 1F",
    successRate: 67,
    reviewCount: 203,
    isOpen: true,
    hours: "평일 08:00 - 20:00",
    features: ["무료", "직원문의필요"],
    lastUpdated: "2026-04-22T06:30:00+09:00",
  },
  {
    id: "t-005",
    name: "강남대로 공원 공중화장실",
    type: "public",
    lat: 37.4965,
    lng: 127.0288,
    address: "서울 강남구 강남대로 지하보도",
    successRate: 54,
    reviewCount: 178,
    isOpen: true,
    hours: "24시간",
    features: ["무료", "24시간", "관리상태보통"],
    lastUpdated: "2026-04-22T05:10:00+09:00",
  },
];

/* ------------------------------------------------------------------ */
/*  유틸 함수 - 2단계(SOS 버튼)에서 사용                               */
/* ------------------------------------------------------------------ */

/**
 * 두 좌표 사이 거리 계산 (미터)
 * Haversine formula - 단거리(500m~수km)에서 충분히 정확
 */
export function getDistanceMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371e3; // 지구 반지름(m)
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** 거리가 포함된 화장실 타입 */
export type ToiletWithDistance = Toilet & { distanceMeters: number };

/**
 * 현재 위치 기준으로 가장 가까운 화장실 N개 반환
 * @param from  현재 위치 (기본값: 강남역 중심)
 * @param limit 반환 개수 (기본값: 3)
 */
export function findNearestToilets(
  from: { lat: number; lng: number } = GANGNAM_CENTER,
  limit = 3,
): ToiletWithDistance[] {
  return TOILETS
    .map((t) => ({
      ...t,
      distanceMeters: Math.round(getDistanceMeters(from, { lat: t.lat, lng: t.lng })),
    }))
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, limit);
}

/** 거리를 사람이 읽기 쉬운 포맷으로 ("120m" / "1.2km") */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}