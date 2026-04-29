"use client";

import type { Toilet } from "@/lib/mock-data";
import { MapPin, Clock, Star, CheckCircle, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ToiletCardProps {
  toilet: Toilet;
  isCompact?: boolean;
  onSelect?: () => void;
  onNavigate?: () => void;
  onComplete?: () => void;
}

function getTypeLabel(type: Toilet["type"]) {
  switch (type) {
    case "partner":
      return { label: "파트너 매장", color: "bg-success/10 text-success" };
    case "public":
      return { label: "개방형", color: "bg-info/10 text-info" };
    case "unknown":
      return { label: "정보 부족", color: "bg-muted text-muted-foreground" };
  }
}

function getNunchiInfo(level: Toilet["nunchiLevel"]) {
  switch (level) {
    case "low":
      return { label: "낮음", description: "자유롭게 이용 가능", color: "bg-success/10 text-success" };
    case "medium":
      return { label: "중간", description: "약간의 눈치 필요", color: "bg-warning/10 text-warning-foreground" };
    case "high":
      return { label: "높음", description: "진입 장벽 높음", color: "bg-primary/10 text-primary" };
  }
}

export function ToiletCard({ toilet, isCompact = false, onSelect, onNavigate, onComplete }: ToiletCardProps) {
  const typeInfo = getTypeLabel(toilet.type);
  const nunchiInfo = getNunchiInfo(toilet.nunchiLevel);

  if (isCompact) {
    return (
      <button
        onClick={onSelect}
        className="flex-shrink-0 w-[280px] bg-card rounded-xl p-4 shadow-md text-left hover:shadow-lg transition-shadow active:scale-[0.98]"
      >
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-foreground text-sm line-clamp-1">{toilet.name}</h3>
            <p className="text-xs text-muted-foreground">{toilet.building}</p>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeInfo.color}`}>
            {typeInfo.label}
          </span>
        </div>
        
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {toilet.distance}m
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {toilet.walkTime}분
          </span>
          <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${nunchiInfo.color} text-[10px]`}>
            눈치 {nunchiInfo.label}
          </span>
        </div>
      </button>
    );
  }

  return (
    <div className="bg-card rounded-xl p-4 shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-foreground text-lg">{toilet.name}</h3>
          <p className="text-sm text-muted-foreground">{toilet.building}</p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${typeInfo.color}`}>
          {typeInfo.label}
        </span>
      </div>

      {/* Distance & Time */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="font-semibold text-foreground">{toilet.distance}m</span>
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="w-4 h-4 text-primary" />
          <span className="font-semibold text-foreground">{toilet.walkTime}분</span>
        </span>
      </div>

      {/* Nunchi Badge */}
      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg mb-4 ${nunchiInfo.color}`}>
        <span className="font-semibold text-sm">눈치 지수: {nunchiInfo.label}</span>
        <span className="text-xs opacity-80">{nunchiInfo.description}</span>
      </div>

      {/* Success Rate */}
      <div className="flex items-center gap-2 mb-4 text-sm">
        <CheckCircle className="w-4 h-4 text-success" />
        <span className="text-muted-foreground">
          최근 성공률 <span className="font-bold text-foreground">{toilet.successRate}%</span>
          <span className="text-xs ml-1">({toilet.confirmedUsers}명 확인)</span>
        </span>
      </div>

      {/* Facility Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full">
          청결도
          {Array.from({ length: 5 }).map((_, i) => (
            <Star 
              key={i} 
              className={`w-3 h-3 ${i < toilet.cleanliness ? "text-warning fill-warning" : "text-muted-foreground/30"}`} 
            />
          ))}
        </span>
        {toilet.hasPaper && (
          <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full">
            휴지있음 ✓
          </span>
        )}
        {toilet.isGenderSeparated && (
          <span className="text-xs bg-info/10 text-info px-2 py-1 rounded-full">
            남녀분리 ✓
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={onNavigate} className="flex-1 gap-2">
          <Navigation className="w-4 h-4" />
          길 안내
        </Button>
        <Button onClick={onComplete} variant="outline" className="flex-1">
          사용 완료
        </Button>
      </div>
    </div>
  );
}
