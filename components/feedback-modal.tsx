"use client";

import type { Toilet } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { X, ThumbsUp, ThumbsDown, Lock } from "lucide-react";

interface FeedbackModalProps {
  toilet: Toilet;
  onClose: () => void;
  onSubmit: (feedback: "success" | "fail" | "locked") => void;
}

export function FeedbackModal({ toilet, onClose, onSubmit }: FeedbackModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-card rounded-t-2xl p-6 pb-safe animate-in slide-in-from-bottom duration-300">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
          aria-label="닫기"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Content */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🚻</div>
          <h2 className="text-lg font-bold text-foreground mb-1">
            방금 이용하신 화장실은 어떠셨나요?
          </h2>
          <p className="text-sm text-muted-foreground">{toilet.name}</p>
        </div>

        {/* Feedback buttons */}
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant="outline"
            onClick={() => onSubmit("success")}
            className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-success/10 hover:border-success hover:text-success"
          >
            <ThumbsUp className="w-6 h-6" />
            <span className="text-xs font-medium">문제없이 이용</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => onSubmit("fail")}
            className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-primary/10 hover:border-primary hover:text-primary"
          >
            <ThumbsDown className="w-6 h-6" />
            <span className="text-xs font-medium">이용 불가</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => onSubmit("locked")}
            className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-warning/10 hover:border-warning hover:text-warning-foreground"
          >
            <Lock className="w-6 h-6" />
            <span className="text-xs font-medium">문 잠김</span>
          </Button>
        </div>

        {/* Skip button */}
        <button
          onClick={onClose}
          className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          나중에 할게요
        </button>
      </div>
    </div>
  );
}
