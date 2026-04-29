"use client";

interface SOSButtonProps {
  onPress: () => void;
}

export function SOSButton({ onPress }: SOSButtonProps) {
  return (
    <button
      onClick={onPress}
      className="group relative w-28 h-28 rounded-full bg-primary shadow-2xl ring-2 ring-white/60 active:scale-95 transition-transform"
      aria-label="지금 당장 가장 가까운 화장실 찾기"
    >
      {/* Pulsing rings - 긴급함을 시각적으로 강조 */}
      <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-30" />
      <span
        className="absolute inset-0 rounded-full bg-primary opacity-20"
        style={{ animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite 0.5s" }}
      />

      {/* Button content */}
      <span className="relative flex flex-col items-center justify-center h-full text-primary-foreground">
        <span className="text-3xl leading-none">🚨</span>
        <span className="text-sm font-bold mt-1.5 leading-tight text-center">
          지금 당장
          <br />
          찾기
        </span>
      </span>
    </button>
  );
}