import type { MDXComponents } from "mdx/types";
import * as React from "react";
import { cn } from "@/lib/utils";

function collectText(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number")
    return String(node);
  if (Array.isArray(node)) return node.map(collectText).join("");
  if (React.isValidElement(node)) {
    const ch = (node.props as { children?: React.ReactNode }).children;
    if (ch != null) return collectText(ch);
  }
  return "";
}

/* ─── Callout boxes ──────────────────────────────────────────────── */

export type CalloutVariant = "analogy" | "tip" | "warn" | "info";

export function Callout({
  variant = "info",
  label,
  children,
}: {
  variant?: CalloutVariant;
  label?: string;
  children: React.ReactNode;
}) {
  const cls: Record<CalloutVariant, string> = {
    analogy: "analogy-box",
    tip: "tip-box",
    warn: "warn-box",
    info: "info-box",
  };
  const defaultLabels: Record<CalloutVariant, string> = {
    analogy: "🍳 Real-Life Analogy",
    tip: "💡 Tip",
    warn: "⚠️ Common Mistake",
    info: "ℹ️ Note",
  };
  return (
    <div className={cls[variant]}>
      <div className="box-label">{label ?? defaultLabels[variant]}</div>
      <p>{children}</p>
    </div>
  );
}

/* ─── Roadmap ────────────────────────────────────────────────────── */

const dotColors = ["dot-green", "dot-blue", "dot-amber", "dot-purple", "dot-red"] as const;
const tagColors = ["tag-green", "tag-blue", "tag-amber", "tag-purple", "tag-red"] as const;

export function Roadmap({ children }: { children: React.ReactNode }) {
  return <div className="roadmap-wrap">{children}</div>;
}

export function Phase({
  num,
  title,
  children,
  tagColor,
}: {
  num: 1 | 2 | 3 | 4 | 5;
  title: string;
  /** Body text as children; use <PhaseTags> inside for the tag chips */
  children: React.ReactNode;
  tagColor?: string;
}) {
  const idx = num - 1;
  const dotCls = dotColors[idx] ?? "dot-green";
  void tagColor; // tagColor resolved via PhaseTags child instead
  return (
    <div className="rm-phase">
      <div className={`rm-dot ${dotCls}`}>{num}</div>
      <div className="rm-phase-title">{title}</div>
      {children}
    </div>
  );
}

export function PhaseDesc({ children }: { children: React.ReactNode }) {
  return <div className="rm-phase-sub">{children}</div>;
}

export function PhaseTags({ num, children }: { num: 1 | 2 | 3 | 4 | 5; children: React.ReactNode }) {
  const idx = num - 1;
  const tagCls = tagColors[idx] ?? "tag-green";
  return (
    <div className="rm-tags">
      {React.Children.map(children, (child) =>
        typeof child === "string"
          ? child.split("|").map((t) => t.trim()).filter(Boolean).map((t) => (
              <span key={t} className={`rm-tag ${tagCls}`}>{t}</span>
            ))
          : child
      )}
    </div>
  );
}

/* ─── Cert grid ──────────────────────────────────────────────────── */

export function CertGrid({ children }: { children: React.ReactNode }) {
  return <div className="cert-grid">{children}</div>;
}

export function CertCard({
  name,
  badge,
  color = "tag-green",
  children,
}: {
  name: string;
  badge: string;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="cert-card">
      <div className="cert-name">{name}</div>
      <div className="cert-note">{children}</div>
      <span className={`cert-badge ${color}`}>{badge}</span>
    </div>
  );
}

/* ─── Skills / priority matrix ───────────────────────────────────── */

const barColors: Record<string, string> = {
  green: "bar-green",
  blue: "bar-blue",
  amber: "bar-amber",
  purple: "bar-purple",
};

export function SkillsMatrix({ children }: { children: React.ReactNode }) {
  return <div className="skills-matrix">{children}</div>;
}

export function SkillRow({
  label,
  pct,
  color = "green",
}: {
  label: string;
  pct: number;
  color?: "green" | "blue" | "amber" | "purple";
}) {
  return (
    <div className="skill-row">
      <div className="skill-label">{label}</div>
      <div className="skill-bar-wrap">
        <div className={`skill-bar ${barColors[color] ?? "bar-green"}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="skill-pct">{pct}%</div>
    </div>
  );
}

/* ─── Do / Don't grid ────────────────────────────────────────────── */

export function UseGrid({ children }: { children: React.ReactNode }) {
  return <div className="use-grid">{children}</div>;
}

export function UseCard({
  type,
  title,
  children,
}: {
  type: "yes" | "no";
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`use-card ${type}`}>
      <div className="use-title">{title}</div>
      <ul>{children}</ul>
    </div>
  );
}

/* ─── Two-column comparison card ────────────────────────────────── */

export function CardGrid({ children }: { children: React.ReactNode }) {
  return <div className="pb-grid">{children}</div>;
}

export function CompareCard({
  color,
  title,
  children,
}: {
  color: "green" | "blue";
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`pb-card ${color}`}>
      <div className="pb-title">{title}</div>
      <div className="pb-desc">{children}</div>
    </div>
  );
}

/* ─── One-liner dark quote ───────────────────────────────────────── */

export function Oneliner({
  children,
  attr,
}: {
  children: React.ReactNode;
  attr?: string;
}) {
  return (
    <div className="oneliner">
      <p>{children}</p>
      {attr && <div className="ol-attr">{attr}</div>}
    </div>
  );
}

/* ─── Interview questions section ────────────────────────────────── */

export function IQSection({
  title = "Interview Questions",
  sub,
  children,
}: {
  title?: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="interview-section">
      <div className="int-header">
        <span className="int-tag">Interview Questions</span>
      </div>
      <h2>{title}</h2>
      {sub && <p className="int-sub">{sub}</p>}
      <div className="q-list">{children}</div>
    </div>
  );
}

export function IQItem({
  num,
  level,
  children,
}: {
  num: number;
  level: "core" | "senior" | "advanced";
  children: React.ReactNode;
}) {
  return (
    <div className="q-item">
      <div className="q-num">{num}</div>
      <div>
        <div className="q-text">{children}</div>
        <div className="q-level">
          <span className={`level-badge ${level}`}>{level.charAt(0).toUpperCase() + level.slice(1)}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Manual code block ─────────────────────────────────────────── */

export function CodeBlock({
  language,
  code,
  children,
}: {
  language?: string;
  code?: string;
  children?: React.ReactNode;
}) {
  const text =
    typeof code === "string" && code.length > 0 ? code : collectText(children);
  return (
    <div
      className={cn(
        "not-prose my-6 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-950 text-neutral-100 dark:border-neutral-800"
      )}
    >
      {language ? (
        <div className="border-b border-neutral-800 px-3 py-1.5 font-mono text-xs font-medium text-neutral-400">
          {language}
        </div>
      ) : null}
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-neutral-100">
        <code className="block min-w-0 whitespace-pre bg-transparent p-0 font-mono text-[13px] leading-relaxed text-neutral-100">
          {text}
        </code>
      </pre>
    </div>
  );
}

export function MDXImage({
  className,
  alt,
  ...props
}: React.ComponentPropsWithoutRef<"img">) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt ?? ""}
      className={cn(
        "my-6 h-auto max-w-full rounded-xl border border-neutral-200 dark:border-neutral-800",
        className
      )}
      loading="lazy"
      {...props}
    />
  );
}

export const mdxComponents: MDXComponents = {
  Callout,
  Roadmap,
  Phase,
  PhaseDesc,
  PhaseTags,
  CertGrid,
  CertCard,
  SkillsMatrix,
  SkillRow,
  UseGrid,
  UseCard,
  CardGrid,
  CompareCard,
  Oneliner,
  IQSection,
  IQItem,
  CodeBlock,
  img: MDXImage,
};
