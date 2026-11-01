import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "./ImageUpload";
import { DocumentUpload } from "./DocumentUpload";
import type { CollectionItem } from "@/lib/programmes";

export type CollectionColumn = { key: string; label: string; type?: "image" | "target" | "document" | "date" | "textarea" };
export function CollectionEditor({ value, onChange, columns, label }: { value: CollectionItem[]; onChange: (items: CollectionItem[]) => void; columns: CollectionColumn[]; label: string }) {
  const update = (index: number, key: string, next: string) => onChange(value.map((item, i) => i === index ? { ...item, [key]: next } : item));
  return <div className="space-y-4">
    {value.map((item, index) => <div key={index} className="space-y-3 border-l-2 pl-4">
      <div className="flex items-center justify-between"><span className="text-sm font-semibold">{label} {index + 1}</span><Button type="button" variant="ghost" size="icon" aria-label={`Remove ${label} ${index + 1}`} onClick={() => onChange(value.filter((_, i) => i !== index))}><Trash2 /></Button></div>
      {columns.map((column) => <div key={column.key} className="space-y-1.5"><Label htmlFor={`${label}-${index}-${column.key}`}>{column.label}</Label>
        {column.type === "document" ? <DocumentUpload label={`${label} ${index + 1}`} value={item[column.key]} onChange={url => update(index, column.key, url)} /> : column.type === "image" ? <ImageUpload label={`${label} ${index + 1}`} value={item[column.key] ?? null} onChange={(url) => update(index, column.key, url ?? "")} /> : column.type === "target" ? <select id={`${label}-${index}-${column.key}`} className="h-9 w-full rounded-md border bg-background px-3 text-sm" value={item[column.key] || "/donate"} onChange={(e) => update(index, column.key, e.target.value)}><option value="/donate">Donate</option><option value="/get-involved">Get involved</option><option value="/contact">Contact</option></select> : column.type === "textarea" ? <textarea id={`${label}-${index}-${column.key}`} className="min-h-24 w-full rounded-md border bg-background p-3 text-sm" value={item[column.key] ?? ""} onChange={e => update(index, column.key, e.target.value)} /> : <Input id={`${label}-${index}-${column.key}`} type={column.type === "date" ? "date" : "text"} value={item[column.key] ?? ""} onChange={(e) => update(index, column.key, e.target.value)} />}
      </div>)}
    </div>)}
    <Button type="button" variant="outline" size="sm" onClick={() => onChange([...value, Object.fromEntries(columns.map((column) => [column.key, column.type === "target" ? "/donate" : ""]))])}><Plus /> Add {label}</Button>
  </div>;
}