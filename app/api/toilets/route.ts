import { NextResponse } from "next/server";
import { mockToilets, type Toilet } from "@/lib/mock-data";
import { getDistanceMeters } from "@/lib/dummy-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get("lat");
  const lngStr = searchParams.get("lng");

  const lat = latStr ? parseFloat(latStr) : 37.498095;
  const lng = lngStr ? parseFloat(lngStr) : 127.02761;

  const kakaoApiKey = process.env.KAKAO_REST_API_KEY;

  if (kakaoApiKey) {
    try {
      // 카카오 로컬 API: 키워드로 반경 내 장소 검색
      // "화장실" 키워드로 현재 좌표(y, x) 기준 반경 2km 이내, 거리순 정렬
      const query = encodeURIComponent("화장실");
      const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${query}&y=${lat}&x=${lng}&radius=2000&sort=distance`;
      
      const res = await fetch(url, {
        headers: {
          Authorization: `KakaoAK ${kakaoApiKey}`,
        },
        next: { revalidate: 3600 } // 캐싱 옵션
      });
      const data = await res.json();

      if (data?.documents) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items: any[] = data.documents;
        
        const parsedToilets: Toilet[] = items
          .map((item, index) => {
            const itemLat = parseFloat(item.y);
            const itemLng = parseFloat(item.x);
            // 카카오 API는 distance를 string으로 내려줍니다.
            const distance = parseInt(item.distance, 10) || Math.round(getDistanceMeters({ lat, lng }, { lat: itemLat, lng: itemLng }));
            
            // 이름에 특정 키워드가 들어가면 타입(색상/아이콘)을 다르게 지정
            let type: Toilet["type"] = "public";
            if (item.place_name.includes("스타벅스") || item.place_name.includes("카페") || item.place_name.includes("이디야") || item.place_name.includes("투썸")) {
              type = "partner";
            } else if (item.place_name.includes("주유소") || item.place_name.includes("상가")) {
              type = "unknown";
            }
            
            return {
              id: `kakao-${item.id || index}`,
              name: item.place_name || "공중화장실",
              building: item.road_address_name || item.address_name || "주소 없음",
              type,
              distance,
              walkTime: Math.ceil(distance / 80), // 성인 평균 도보속도 80m/min 기준
              nunchiLevel: type === "partner" ? "medium" : "low",
              successRate: 100, // 카카오 API에는 성공률 데이터가 없으므로 기본값 100
              confirmedUsers: 0,
              cleanliness: type === "partner" ? 4 : 3, // 임시 추정치
              hasPaper: true, // 임시 추정치
              isGenderSeparated: true, // 임시 추정치
              lat: itemLat,
              lng: itemLng,
            } as Toilet;
          });

        if (parsedToilets.length > 0) {
          return NextResponse.json(parsedToilets);
        } else {
          // 반경 내 화장실이 0개인 경우 빈 배열 반환
          return NextResponse.json([]);
        }
      } else {
        // documents 필드가 없으면 카카오 API 에러 발생 (인증키 오류 등)
        console.error("Kakao API Error Response:", data);
        return NextResponse.json({ error: "Kakao API Error", details: data }, { status: 500 });
      }
    } catch (error) {
      console.error("Kakao API Fetch Error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }

  // API 키가 아예 설정되지 않은 경우
  console.error("KAKAO_REST_API_KEY is not set in environment variables");
  return NextResponse.json({ error: "API Key is missing" }, { status: 500 });
}
