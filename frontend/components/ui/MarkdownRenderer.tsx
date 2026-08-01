"use client";

import React from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  isUserMessage?: boolean;
}

export function MarkdownRenderer({ content, className = "", isUserMessage = false }: MarkdownRendererProps) {
  if (!content) return null;

  const textColorClass = isUserMessage ? "text-primary-foreground" : "text-foreground/90";
  const strongColorClass = isUserMessage ? "text-primary-foreground font-bold" : "text-foreground font-semibold";
  const headingColorClass = isUserMessage ? "text-primary-foreground font-bold" : "text-foreground font-bold";

  // Split text into blocks (paragraphs, headers, tables, lists, quotes)
  const renderFormattedMarkdown = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let inTable = false;
    let tableHeader: string[] = [];
    let tableRows: string[][] = [];
    let listItems: string[] = [];
    let listType: "ul" | "ol" | null = null;

    const flushTable = (key: string) => {
      if (tableHeader.length > 0 || tableRows.length > 0) {
        elements.push(
          <div key={`table-${key}`} className="my-3 overflow-x-auto rounded-lg border border-border bg-card shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              {tableHeader.length > 0 && (
                <thead className="bg-muted/80 border-b border-border text-foreground font-semibold">
                  <tr>
                    {tableHeader.map((th, i) => (
                      <th key={i} className="px-3.5 py-2.5 border-r border-border/60 last:border-r-0">
                        {renderInlineFormatting(th.trim())}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody className="divide-y divide-border/60">
                {tableRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-muted/30 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3.5 py-2 border-r border-border/60 last:border-r-0 text-muted-foreground leading-relaxed">
                        {renderInlineFormatting(cell.trim())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableHeader = [];
        tableRows = [];
      }
      inTable = false;
    };

    const flushList = (key: string) => {
      if (listItems.length > 0 && listType) {
        const ListTag = listType;
        elements.push(
          <ListTag
            key={`list-${key}`}
            className={`my-2 space-y-1 text-xs sm:text-sm ${textColorClass} pl-5 ${
              listType === "ul" ? "list-disc" : "list-decimal"
            }`}
          >
            {listItems.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {renderInlineFormatting(item)}
              </li>
            ))}
          </ListTag>
        );
        listItems = [];
        listType = null;
      }
    };

    const renderInlineFormatting = (inlineText: string): React.ReactNode => {
      if (!inlineText) return null;

      // Handle bold **text**
      const parts = inlineText.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
      return parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className={strongColorClass}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("*") && part.endsWith("*")) {
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={i}
              className={`px-1.5 py-0.5 rounded font-mono text-[11px] ${
                isUserMessage ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-primary"
              }`}
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      });
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Detect Table Line (| col1 | col2 |)
      if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        flushList(`${idx}`);
        const cells = trimmed
          .split("|")
          .slice(1, -1)
          .map((c) => c.trim());

        if (cells.every((c) => /^:?-+:?$/.test(c))) {
          return;
        }

        if (!inTable) {
          inTable = true;
          tableHeader = cells;
        } else {
          tableRows.push(cells);
        }
        return;
      } else if (inTable) {
        flushTable(`${idx}`);
      }

      // Detect Bullet / Ordered List Item
      const bulletMatch = trimmed.match(/^[-*+]\s+(.+)/);
      const numberMatch = trimmed.match(/^(\d+)\.\s+(.+)/);

      if (bulletMatch) {
        if (listType !== "ul") flushList(`${idx}`);
        listType = "ul";
        listItems.push(bulletMatch[1]);
        return;
      } else if (numberMatch) {
        if (listType !== "ol") flushList(`${idx}`);
        listType = "ol";
        listItems.push(numberMatch[2]);
        return;
      } else if (listType) {
        flushList(`${idx}`);
      }

      // Empty Line
      if (!trimmed) {
        return;
      }

      // Headings (# ## ###)
      if (trimmed.startsWith("### ")) {
        elements.push(
          <h4 key={idx} className={`mt-4 mb-1.5 text-sm ${headingColorClass} tracking-tight`}>
            {renderInlineFormatting(trimmed.slice(4))}
          </h4>
        );
        return;
      }
      if (trimmed.startsWith("## ")) {
        elements.push(
          <h3 key={idx} className={`mt-4 mb-2 text-base ${headingColorClass} tracking-tight`}>
            {renderInlineFormatting(trimmed.slice(3))}
          </h3>
        );
        return;
      }
      if (trimmed.startsWith("# ")) {
        elements.push(
          <h2 key={idx} className={`mt-5 mb-2 text-lg font-extrabold ${headingColorClass} tracking-tight`}>
            {renderInlineFormatting(trimmed.slice(2))}
          </h2>
        );
        return;
      }

      // Blockquotes (> text)
      if (trimmed.startsWith("> ")) {
        elements.push(
          <blockquote
            key={idx}
            className={`my-2 border-l-3 border-emerald-500 px-3.5 py-2.5 rounded-r-lg text-xs sm:text-sm italic ${
              isUserMessage
                ? "bg-primary-foreground/15 text-primary-foreground"
                : "bg-emerald-500/10 dark:bg-emerald-500/5 text-foreground/90"
            }`}
          >
            {renderInlineFormatting(trimmed.slice(2))}
          </blockquote>
        );
        return;
      }

      // Standard Paragraph
      elements.push(
        <p key={idx} className={`my-1.5 text-xs sm:text-sm ${textColorClass} leading-relaxed`}>
          {renderInlineFormatting(trimmed)}
        </p>
      );
    });

    flushTable("end");
    flushList("end");

    return elements;
  };

  return <div className={`space-y-1.5 ${className}`}>{renderFormattedMarkdown(content)}</div>;
}
