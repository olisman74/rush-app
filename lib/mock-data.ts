export type ToiletType = "partner" | "public" | "unknown";
export type NunchiLevel = "low" | "medium" | "high";

export interface Toilet {
  id: string;
  name: string;
  building: string;
  type: ToiletType;
  distance: number; // in meters
  walkTime: number; // in minutes
  nunchiLevel: NunchiLevel;
  successRate: number;
  confirmedUsers: number;
  cleanliness: number; // 1-5 stars
  hasPaper: boolean;
  isGenderSeparated: boolean;
  lat: number;
  lng: number;
}

export const mockToilets: Toilet[] = [
  {
    id: "1",
    name: "스타벅스 강남역점",
    building: "강남역 지하상가 B1",
    type: "partner",
    distance: 45,
    walkTime: 1,
    nunchiLevel: "low",
    successRate: 94,
    confirmedUsers: 67,
    cleanliness: 4,
    hasPaper: true,
    isGenderSeparated: true,
    lat: 37.498095,
    lng: 127.027610,
  },
  {
    id: "2",
    name: "강남역 지하철 공용화장실",
    building: "강남역 2번 출구 인근",
    type: "public",
    distance: 120,
    walkTime: 2,
    nunchiLevel: "low",
    successRate: 88,
    confirmedUsers: 234,
    cleanliness: 3,
    hasPaper: true,
    isGenderSeparated: true,
    lat: 37.497942,
    lng: 127.027621,
  },
  {
    id: "3",
    name: "이디야커피 역삼점",
    building: "역삼빌딩 1층",
    type: "partner",
    distance: 180,
    walkTime: 3,
    nunchiLevel: "medium",
    successRate: 76,
    confirmedUsers: 45,
    cleanliness: 4,
    hasPaper: true,
    isGenderSeparated: false,
    lat: 37.500074,
    lng: 127.036544,
  },
  {
    id: "4",
    name: "GS25 강남점",
    building: "강남빌딩 1층",
    type: "unknown",
    distance: 250,
    walkTime: 4,
    nunchiLevel: "high",
    successRate: 52,
    confirmedUsers: 12,
    cleanliness: 2,
    hasPaper: false,
    isGenderSeparated: false,
    lat: 37.496513,
    lng: 127.028974,
  },
  {
    id: "5",
    name: "교보타워 지하 화장실",
    building: "교보타워 지하 1층",
    type: "public",
    distance: 320,
    walkTime: 5,
    nunchiLevel: "low",
    successRate: 91,
    confirmedUsers: 234,
    cleanliness: 5,
    hasPaper: true,
    isGenderSeparated: true,
    lat: 37.500874,
    lng: 127.026869,
  },
];
