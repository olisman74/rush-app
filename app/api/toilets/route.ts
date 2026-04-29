import { NextResponse } from "next/server";
import { mockToilets, type Toilet } from "@/lib/mock-data";
import { getDistanceMeters } from "@/lib/dummy-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get("lat");
  const lngStr = searchParams.get("lng");

  const lat = latStr ? parseFloat(latStr) : 37.498095;
  const lng = lngStr ? parseFloat(lngStr) : 127.02761;

  const apiKey = process.env.PUBLIC_DATA_API_KEY;

  if (apiKey) {
    try {
      // 실제 공공데이터포털 API 호출 (예시 엔드포인트)
      // 전국 공중화장실 표준데이터: http://api.data.go.kr/openapi/tn_pubr_public_toilet_api
      const url = `http://api.data.go.kr/openapi/tn_pubr_public_toilet_api?serviceKey=${apiKey}&pageNo=1&numOfRows=1000&type=json`;
      const res = await fetch(url, { next: { revalidate: 3600 } });
      const data = await res.json();

      if (data?.response?.body?.items) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items: any[] = data.response.body.items;
        
        // 데이터 매핑 및 거리 필터링 (반경 2km 이내)
        const parsedToilets: Toilet[] = items
          .map((item, index) => {
            const itemLat = parseFloat(item.latitude || "0");
            const itemLng = parseFloat(item.longitude || "0");
            const distance = Math.round(getDistanceMeters({ lat, lng }, { lat: itemLat, lng: itemLng }));
            
            return {
              id: `api-${index}`,
              name: item.toiletNm || "공중화장실",
              building: item.rdnmadr || item.lnmadr || "주소 없음",
              type: "public",
              distance,
              walkTime: Math.ceil(distance / 80), // 80m/min 기준
              nunchiLevel: "low",
              successRate: 100, // 기본값
              confirmedUsers: 0,
              cleanliness: 3,
              hasPaper: item.tissueYn === "Y",
              isGenderSeparated: item.mwSeperatedYn === "Y",
              lat: itemLat,
              lng: itemLng,
            } as Toilet;
          })
          .filter(t => t.lat !== 0 && t.distance < 2000)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 20); // 상위 20개만

        if (parsedToilets.length > 0) {
          return NextResponse.json(parsedToilets);
        }
      }
    } catch (error) {
      console.error("API Fetch Error:", error);
      // 에러 발생 시 아래 mock data fallback 으로 진행
    }
  }

  // API 키가 없거나 실패 시 Mock Data 반환 (현재 위치 기반 거리 재계산)
  const fallback = mockToilets.map((t) => ({
    ...t,
    distance: Math.round(getDistanceMeters({ lat, lng }, { lat: t.lat, lng: t.lng })),
  })).sort((a, b) => a.distance - b.distance);

  return NextResponse.json(fallback);
}
