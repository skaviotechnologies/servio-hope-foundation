import { useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;
const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml", "image/x-icon", "image/vnd.microsoft.icon"];

export async function uploadMedia(file: File): Promise<string> {
  if (!ALLOWED.includes(file.type)) throw new Error("Please upload a PNG, JPG, WebP, GIF, SVG or ICO image.");
  if (file.size > 10 * 1024 * 1024) throw new Error("Image must be 10MB or smaller.");
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
  const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, { contentType: file.type, cacheControl: "31536000" });
  if (error) throw error;
  const { data, error: e2 } = await supabase.storage.from("media").createSignedUrl(path, TEN_YEARS);
  if (e2 || !data) throw e2 ?? new Error("Could not create link");
  return data.signedUrl;
}

export function ImageUpload({ value, onChange, label = "Image", compact }: { value?: string | null; onChange: (url: string | null) => void; label?: string; compact?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  async function pick(f?: File) {
    if (!f) return;
    setBusy(true);
    try {
      onChange(await uploadMedia(f));
      toast.success("Image uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  }
  return (
    <div className="flex items-center gap-4">
      <div className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-soft ${compact ? "h-16 w-16" : "h-24 w-36"}`}>
        {value ? <img src={value} alt="" className="h-full w-full object-contain" /> : <ImagePlus className="h-6 w-6 text-muted-foreground" aria-hidden />}
      </div>
      <div className="flex flex-wrap gap-2">
        <input ref={ref} type="file" accept={ALLOWED.join(",")} className="hidden" onChange={(e) => pick(e.target.files?.[0])} aria-label={`Upload ${label}`} />
        <Button type="button" variant="outline" size="sm" onClick={() => ref.current?.click()} disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : <ImagePlus />} {value ? "Replace" : "Upload"}
        </Button>
        {value && <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}><X /> Remove</Button>}
      </div>
    </div>
  );
}
