"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ImageModalProps {
  open: boolean;
  title: string;
  imageUrl: string;
  fallbackUrl?: string;
  onClose: () => void;
}

export function ImageModal({ open, title, imageUrl, fallbackUrl, onClose }: ImageModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex flex-col gap-0 p-0 w-[calc(100%-2rem)] sm:max-w-[600px] max-h-[95dvh] sm:max-h-[90dvh]">
        <DialogHeader>
          <DialogTitle className="border-b border-border px-6 py-5 pr-10 text-lg font-bold text-foreground m-0">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-auto flex items-start justify-center p-4 sm:p-6">
          <img
            className="max-w-full max-h-full object-contain"
            src={imageUrl}
            alt={title}
            onError={(e) => {
              if (fallbackUrl) {
                e.currentTarget.onerror = null;
                e.currentTarget.src = fallbackUrl;
              }
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
