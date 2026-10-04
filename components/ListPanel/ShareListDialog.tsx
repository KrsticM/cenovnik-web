"use client";

import { ComponentType, ReactNode, useEffect, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { DesignSwitch } from "@/components/PillSwitch/PillSwitch";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";

interface ShareListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listName: string;
  shareToken: string | null;
  onPublicChange: (isPublic: boolean) => Promise<void>;
}

const COPIED_RESET_MS = 2000;

export function ShareIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
      <circle cx="18" cy="5" r="2.6" />
      <circle cx="6" cy="12" r="2.6" />
      <circle cx="18" cy="19" r="2.6" />
      <line x1="8.3" y1="10.7" x2="15.7" y2="6.3" />
      <line x1="8.3" y1="13.3" x2="15.7" y2="17.7" />
    </svg>
  );
}

export function ShareListDialog({
  open,
  onOpenChange,
  listName,
  shareToken,
  onPublicChange,
}: ShareListDialogProps) {
  const mobile = useMediaQuery("(max-width: 639px)");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPublic = shareToken !== null;
  const shareUrl =
    shareToken && typeof window !== "undefined" ? `${window.location.origin}/lista/${shareToken}` : "";

  useEffect(() => () => {
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
  }, []);

  const togglePublic = async () => {
    setSaving(true);
    setCopied(false);
    await onPublicChange(!isPublic);
    setSaving(false);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // Clipboard can be denied; the URL stays visible for manual copy.
    }
    setCopied(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({ title: `${listName} · eCenovnik`, url: shareUrl }).catch(() => {});
    } else {
      copyLink();
    }
  };

  const bodyProps = { isPublic, saving, copied, shareUrl, mobile, togglePublic, copyLink, shareLink };

  if (mobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
        <DrawerContent
          hideHandle
          overlayClassName="z-[85] data-[state=open]:animate-[fadeIn_160ms_ease_both] bg-scrim"
          className="z-[85] mt-0 rounded-t-[20px] border-0 bg-white p-6 shadow-modal outline-none"
        >
          <ShareBody parts={{ Title: DrawerTitle, Description: DrawerDescription, Close: DrawerClose }} {...bodyProps} />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[85] data-[state=open]:animate-[fadeIn_160ms_ease_both] bg-scrim" />
        <div className="pointer-events-none fixed inset-0 z-[85] flex items-center justify-center p-4">
          <DialogPrimitive.Content className="pointer-events-auto relative w-full max-w-[440px] data-[state=open]:animate-[qtyIn_180ms_ease_both] rounded-[18px] bg-white p-6 shadow-modal outline-none">
            <ShareBody
              parts={{ Title: DialogPrimitive.Title, Description: DialogPrimitive.Description, Close: DialogPrimitive.Close }}
              {...bodyProps}
            />
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

// Dialog (desktop) and Drawer (mobile) each need their own Title/Description/Close for a11y wiring.
type BodyParts = {
  Title: ComponentType<{ className?: string; children?: ReactNode }>;
  Description: ComponentType<{ className?: string; children?: ReactNode }>;
  Close: ComponentType<{ asChild?: boolean; children?: ReactNode }>;
};

interface ShareBodyProps {
  parts: BodyParts;
  isPublic: boolean;
  saving: boolean;
  copied: boolean;
  shareUrl: string;
  mobile: boolean;
  togglePublic: () => void;
  copyLink: () => void;
  shareLink: () => void;
}

function ShareBody({ parts, isPublic, saving, copied, shareUrl, mobile, togglePublic, copyLink, shareLink }: ShareBodyProps) {
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <parts.Title className="text-[19px] font-semibold tracking-[-0.01em] text-ink">
          Podeli listu
        </parts.Title>
        <parts.Close asChild>
          <Button
            variant="ghost-clear"
            size="icon-md"
            aria-label="Zatvori"
            className="text-lg font-normal hover:bg-paper"
          >
            ×
          </Button>
        </parts.Close>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <span id="share-public-label" className="text-[15px] font-medium text-ink">
          Omogući javni pristup
        </span>
        <DesignSwitch
          size="md"
          checked={isPublic}
          aria-labelledby="share-public-label"
          disabled={saving}
          onCheckedChange={togglePublic}
        />
      </div>
      <parts.Description className="mt-2.5 text-[13px] leading-[1.55] text-ink-muted">
        Kada je uključen, svako ko ima link može da pregleda ovu listu, i bez prijave.
      </parts.Description>

      {isPublic && (
        <div className="mt-[22px] animate-[dropIn_160ms_ease_both]">
          <div className="text-[13px] font-semibold text-ink">Link do liste</div>
          <div className="mt-2 flex items-center gap-2 rounded-[12px] border border-line bg-paper py-1.5 pl-3.5 pr-1.5">
            <span className="min-w-0 flex-1 break-all font-mono text-xs leading-normal text-ink">
              {shareUrl}
            </span>
            {mobile && (
              <Button
                variant="pill"
                onClick={copyLink}
                aria-label="Kopiraj link"
                className="h-9 shrink-0 rounded-[10px] px-3 text-[13px] text-sage-dark"
              >
                {copied ? "Kopirano ✓" : "Kopiraj"}
              </Button>
            )}
          </div>

          <Button
            variant="sage"
            size="pill-lg"
            onClick={mobile ? shareLink : copyLink}
            className="mt-4 w-full gap-2.5 [&_svg]:size-[17px]"
          >
            {mobile ? (
              <>
                <ShareIcon size={17} />
                Podeli link
              </>
            ) : (
              <>
                <CopyIcon />
                {copied ? "Link je kopiran ✓" : "Kopiraj link"}
              </>
            )}
          </Button>
        </div>
      )}
    </>
  );
}

function CopyIcon() {
  return (
    <span aria-hidden="true" className="relative block h-4 w-3.5">
      <span className="absolute left-0 top-[3px] block h-3 w-2.5 rounded-[3px] border-[1.6px] border-current" />
      <span className="absolute left-1 top-0 block h-3 w-2.5 rounded-[3px] border-[1.6px] border-current bg-sage-dark" />
    </span>
  );
}
