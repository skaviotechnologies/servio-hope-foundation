import { Fragment, type ReactNode } from "react";
import type { JSONContent } from "@tiptap/react";
import { safeArticleUrl } from "@/lib/articles";

function renderNode(node: JSONContent, key: number): ReactNode {
  const children = (node.content ?? []).map(renderNode);
  if (node.type === "text") {
    let text: ReactNode = node.text ?? "";
    for (const mark of node.marks ?? []) {
      if (mark.type === "bold") text = <strong>{text}</strong>;
      if (mark.type === "italic") text = <em>{text}</em>;
      if (mark.type === "underline") text = <u>{text}</u>;
      if (mark.type === "strike") text = <s>{text}</s>;
      if (mark.type === "code") text = <code>{text}</code>;
      if (mark.type === "link") { const href = safeArticleUrl(mark.attrs?.href); if (href) text = <a href={href} rel="noopener noreferrer" target="_blank">{text}</a>; }
    }
    return <Fragment key={key}>{text}</Fragment>;
  }
  switch (node.type) {
    case "paragraph": return <p key={key}>{children}</p>;
    case "heading": return node.attrs?.level === 3 ? <h3 key={key}>{children}</h3> : <h2 key={key}>{children}</h2>;
    case "bulletList": return <ul key={key}>{children}</ul>;
    case "orderedList": return <ol key={key}>{children}</ol>;
    case "listItem": return <li key={key}>{children}</li>;
    case "blockquote": return <blockquote key={key}>{children}</blockquote>;
    case "codeBlock": return <pre key={key}><code>{children}</code></pre>;
    case "hardBreak": return <br key={key}/>;
    case "horizontalRule": return <hr key={key}/>;
    case "image": { const src = safeArticleUrl(node.attrs?.src, true); return src ? <img key={key} src={src} alt={typeof node.attrs?.alt === "string" ? node.attrs.alt : ""} loading="lazy"/> : null; }
    default: return <Fragment key={key}>{children}</Fragment>;
  }
}
export function ArticleContent({ content, body }: { content: unknown; body: string }) {
  if (!content || typeof content !== "object" || !("type" in content) || content.type !== "doc") return <div className="prose-body">{body}</div>;
  return <div className="article-rich">{renderNode(content as JSONContent, 0)}</div>;
}