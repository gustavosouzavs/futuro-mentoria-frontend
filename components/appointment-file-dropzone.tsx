"use client";

import { useCallback, useRef, useState } from "react";
import { FileUp, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
  className?: string;
};

const ACCEPT = ".pdf,.doc,.docx,.odt,.txt,.png,.jpg,.jpeg,.webp,.gif";

export function AppointmentFileDropzone({ onFileSelected, disabled, className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const pick = useCallback(
    (files: FileList | null) => {
      const f = files?.[0];
      if (f) onFileSelected(f);
    },
    [onFileSelected],
  );

  return (
    <div
      className={cn(
        "rounded-xl border-2 border-dashed transition-colors",
        drag ? "border-primary bg-primary/5" : "border-muted-foreground/20 bg-muted/40",
        disabled && "pointer-events-none opacity-60",
        className,
      )}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        if (!disabled) pick(e.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={ACCEPT}
        disabled={disabled}
        onChange={(e) => {
          pick(e.target.files);
          e.target.value = "";
        }}
      />
      <div className="flex flex-col items-center justify-center gap-3 px-6 py-8 text-center sm:py-10">
        <div className="rounded-full border bg-background p-3 shadow-sm">
          <FileUp className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Arraste um arquivo ou envie pelo botão</p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            PDF, Word, imagens ou texto — até 20 MB. O arquivo fica disponível para mentor e estudante
            nesta mentoria.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          Escolher arquivo
        </Button>
      </div>
    </div>
  );
}
