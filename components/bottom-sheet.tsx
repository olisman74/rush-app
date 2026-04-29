"use client";

import { useState, useMemo, useRef } from "react";
import type { Toilet, ToiletType } from "@/lib/mock-data";
import { ToiletCard } from "./toilet-card";
import { ChevronUp, ChevronDown, X } from "lucide-react";

interface BottomSheetProps {
  toilets: Toilet[];
  selectedToilet: Toilet | null;
  onSelectToilet: (toilet: Toilet | null) => void;
  onNavigate: (toilet: Toilet) => void;
  onComplete: (toilet: Toilet) => void;
}

/** 필터 값: "all" 이거나 특정 ToiletType */
type FilterValue = "all" | ToiletType;

/** 필터 칩 정의 (라벨, 값, 배지 색상) */
const FILTER_OPTIONS: { value: FilterValue; label: string; dotClass: string }[] = [
  { value: "all", label: "전체", dotClass: "" },
  { value: "partner", label: "파트너", dotClass: "bg-success" },
  { value: "public", label: "공용", dotClass: "bg-info" },
  { value: "unknown", label: "불확실", dotClass: "bg-muted-foreground" },
];

export function BottomSheet({
  toilets,
  selectedToilet,
  onSelectToilet,
  onNavigate,
  onComplete,
}: BottomSheetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filter, setFilter] = useState<FilterValue>("all");
  const sheetRef = useRef<HTMLDivElement>(null);

  // ✨ 필터 적용된 목록
  const filteredToilets = useMemo(() => {
    if (filter === "all") return toilets;
    return toilets.filter((t) => t.type === filter);
  }, [toilets, filter]);

  // 각 타입별 개수 (필터 칩에 표시)
  const typeCounts = useMemo(() => {
    return {
      all: toilets.length,
      partner: toilets.filter((t) => t.type === "partner").length,
      public: toilets.filter((t) => t.type === "public").length,
      unknown: toilets.filter((t) => t.type === "unknown").length,
    };
  }, [toilets]);

  const nearestThree = filteredToilets.slice(0, 3);

  // If a toilet is selected, show detailed view
  if (selectedToilet) {
    return (
      <div className="absolute bottom-0 left-0 right-0 z-30 pb-safe">
        <div className="bg-card rounded-t-2xl shadow-2xl p-4 max-h-[70vh] overflow-y-auto">
          {/* Close button */}
          <button
            onClick={() => onSelectToilet(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

          <ToiletCard
            toilet={selectedToilet}
            onNavigate={() => onNavigate(selectedToilet)}
            onComplete={() => onComplete(selectedToilet)}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={sheetRef}
      className={`absolute bottom-0 left-0 right-0 z-30 transition-all duration-300 ease-out pb-safe ${isExpanded ? "h-[60vh]" : "h-auto"
        }`}
    >
      <div className="bg-card rounded-t-2xl shadow-2xl h-full flex flex-col">
        {/* Handle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex flex-col items-center py-3 w-full"
          aria-label={isExpanded ? "접기" : "펼치기"}
        >
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mb-2" />
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {isExpanded ? (
              <>
                <ChevronDown className="w-4 h-4" />
                접기
              </>
            ) : (
              <>
                <ChevronUp className="w-4 h-4" />
                더 보기
              </>
            )}
          </div>
        </button>

        {/* ✨ 필터 칩 */}
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
            {FILTER_OPTIONS.map((opt) => {
              const count = typeCounts[opt.value];
              const isActive = filter === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/70"
                    }`}
                >
                  {opt.dotClass && (
                    <span className={`w-2 h-2 rounded-full ${opt.dotClass}`} />
                  )}
                  <span>{opt.label}</span>
                  <span className={`${isActive ? "opacity-80" : "opacity-60"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className={`px-4 pb-4 ${isExpanded ? "overflow-y-auto flex-1" : ""}`}>
          {/* 결과 없을 때 */}
          {filteredToilets.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              선택한 조건의 화장실이 없어요
            </div>
          )}

          {/* Collapsed view - horizontal scroll */}
          {!isExpanded && filteredToilets.length > 0 && (
            <>
              <h2 className="text-sm font-semibold text-muted-foreground mb-3">
                가까운 화장실 {nearestThree.length}곳
              </h2>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                {nearestThree.map((toilet) => (
                  <ToiletCard
                    key={toilet.id}
                    toilet={toilet}
                    isCompact
                    onSelect={() => onSelectToilet(toilet)}
                  />
                ))}
              </div>
            </>
          )}

          {/* Expanded view - vertical list */}
          {isExpanded && filteredToilets.length > 0 && (
            <>
              <h2 className="text-sm font-semibold text-muted-foreground mb-3">
                주변 화장실 {filteredToilets.length}곳
              </h2>
              <div className="space-y-3">
                {filteredToilets.map((toilet) => (
                  <ToiletCard
                    key={toilet.id}
                    toilet={toilet}
                    isCompact
                    onSelect={() => onSelectToilet(toilet)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}