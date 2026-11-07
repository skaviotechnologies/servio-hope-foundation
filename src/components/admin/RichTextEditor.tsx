import { useEffect, useRef } from "react";
import { EditorContent, useEditor, useEditorState, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Bold, Italic, Underline, Strikethrough, Heading2, Heading3, List, ListOrdered, Quote, Link2, Unlink, Undo2, Redo2, ImagePlus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadMedia } from "./ImageUpload";
import { safeArticleUrl } from "@/lib/articles";
import { toast } from "sonner";

export function RichTextEditor({ value, onChange }: { value: JSONContent; onChange: (content: JSONContent) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const editor = useEditor({ extensions: [StarterKit.configure({ heading: { levels: [2,3] }, link: { openOnClick: false } }), Image], immediatelyRender: false, content: value, onUpdate: ({ editor }) => onChange(editor.getJSON()), editorProps: { attributes: { class: "article-rich min-h-80 p-5 focus:outline-none", "aria-label": "Article content", role: "textbox", "aria-multiline": "true" } } });
  useEffect(() => { if (editor && JSON.stringify(editor.getJSON()) !== JSON.stringify(value)) editor.commands.setContent(value, { emitUpdate: false }); }, [editor, value]);
  const state = useEditorState({ editor, selector: ({ editor }) => ({ bold: editor?.isActive("bold"), italic: editor?.isActive("italic"), underline: editor?.isActive("underline"), strike: editor?.isActive("strike"), h2: editor?.isActive("heading", {level:2}), h3: editor?.isActive("heading", {level:3}), bullet: editor?.isActive("bulletList"), ordered: editor?.isActive("orderedList"), quote: editor?.isActive("blockquote"), link: editor?.isActive("link") }) });
  const tools = [
    { name: "Bold", icon: Bold, active: state?.bold, action: () => editor?.chain().focus().toggleBold().run() },
    { name: "Italic", icon: Italic, active: state?.italic, action: () => editor?.chain().focus().toggleItalic().run() },
    { name: "Underline", icon: Underline, active: state?.underline, action: () => editor?.chain().focus().toggleUnderline().run() },
    { name: "Strikethrough", icon: Strikethrough, active: state?.strike, action: () => editor?.chain().focus().toggleStrike().run() },
    { name: "Heading 2", icon: Heading2, active: state?.h2, action: () => editor?.chain().focus().toggleHeading({level:2}).run() },
    { name: "Heading 3", icon: Heading3, active: state?.h3, action: () => editor?.chain().focus().toggleHeading({level:3}).run() },
    { name: "Bullet list", icon: List, active: state?.bullet, action: () => editor?.chain().focus().toggleBulletList().run() },
    { name: "Numbered list", icon: ListOrdered, active: state?.ordered, action: () => editor?.chain().focus().toggleOrderedList().run() },
    { name: "Quote", icon: Quote, active: state?.quote, action: () => editor?.chain().focus().toggleBlockquote().run() },
    { name: "Add link", icon: Link2, active: state?.link, action: () => { const url = window.prompt("Link URL", editor?.getAttributes("link").href ?? "https://"); if (url === null) return; if (!url) { editor?.chain().focus().unsetLink().run(); return; } if (!safeArticleUrl(url)) { toast.error("Use an HTTPS, HTTP, email or telephone link."); return; } editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run(); } },
    { name: "Remove link", icon: Unlink, action: () => editor?.chain().focus().unsetLink().run() },
    { name: "Insert image", icon: ImagePlus, action: () => input.current?.click() },
    { name: "Divider", icon: Minus, action: () => editor?.chain().focus().setHorizontalRule().run() },
    { name: "Undo", icon: Undo2, action: () => editor?.chain().focus().undo().run() },
    { name: "Redo", icon: Redo2, action: () => editor?.chain().focus().redo().run() },
  ];
  return <div className="overflow-hidden rounded-md border bg-background"><div role="toolbar" aria-label="Article formatting" className="flex flex-wrap gap-1 border-b bg-soft p-2">{tools.map(tool => <Button key={tool.name} type="button" variant={tool.active ? "secondary" : "ghost"} size="icon" title={tool.name} aria-label={tool.name} aria-pressed={!!tool.active} disabled={!editor} onClick={tool.action}><tool.icon className="size-4"/></Button>)}</div><input ref={input} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" aria-label="Insert article image" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; try { const src = await uploadMedia(file); editor?.chain().focus().setImage({src, alt: window.prompt("Image description", "") ?? ""}).run(); } catch(error) { toast.error(error instanceof Error ? error.message : "Upload failed"); } e.target.value = ""; }}/><EditorContent editor={editor}/></div>;
}