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
    analogy: "box box-analogy",
    tip:     "box box-tip",
    warn:    "box box-warn",
    info:    "box box-info",
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
      {children}
    </div>
  );
}

/* ─── Section label ─────────────────────────────────────────────── */

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="section-label">{children}</div>;
}

/* ─── Hero meta pills ───────────────────────────────────────────── */

export function HeroPills({ children }: { children: React.ReactNode }) {
  return <div className="meta-row">{children}</div>;
}

export function Pill({
  color = "blue",
  children,
}: {
  color?: "green" | "blue" | "amber" | "purple" | "red";
  children: React.ReactNode;
}) {
  return <span className={`pill pill-${color}`}>{children}</span>;
}

/* ─── Hero tag ──────────────────────────────────────────────────── */

export function HeroTag({ children }: { children: React.ReactNode }) {
  return <div className="hero-tag">{children}</div>;
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
  num: number | string;
  title: string;
  children: React.ReactNode;
  tagColor?: string;
}) {
  const idx = Number(num) - 1;
  const dotCls = dotColors[idx] ?? "dot-green";
  void tagColor;
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

export function PhaseTags({ num, children }: { num: number | string; children: React.ReactNode }) {
  const idx = Number(num) - 1;
  const tagCls = tagColors[idx] ?? "tag-green";

  // Collect the raw text regardless of whether MDX delivered it as a
  // plain string or wrapped it inside a <p> element.
  const raw = collectText(children);
  const tags = raw.split("|").map((t) => t.trim()).filter(Boolean);

  return (
    <div className="rm-tags">
      {tags.map((t) => (
        <span key={t} className={`rm-tag ${tagCls}`}>{t}</span>
      ))}
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
  pct: number | string;
  color?: "green" | "blue" | "amber" | "purple";
}) {
  const pctVal = Number(pct);
  return (
    <div className="skill-row">
      <div className="skill-label">{label}</div>
      <div className="skill-bar-wrap">
        <div className={`skill-bar ${barColors[color] ?? "bar-green"}`} style={{ width: `${pctVal}%` }} />
      </div>
      <div className="skill-pct">{pctVal}%</div>
    </div>
  );
}

/* ─── Do / Don't grid ────────────────────────────────────────────── */

export function UseGrid({ children }: { children: React.ReactNode }) {
  return <div className="decision-grid">{children}</div>;
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
  const colorCls = type === "yes" ? "dcard-green" : "dcard-red";
  return (
    <div className={`dcard ${colorCls}`}>
      <div className="dcard-title">{title}</div>
      <ul>{children}</ul>
    </div>
  );
}

/* ─── Two-column comparison card ────────────────────────────────── */

export function CardGrid({ children }: { children: React.ReactNode }) {
  return <div className="card-grid">{children}</div>;
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
  void color;
  return (
    <div className="card">
      <div className="card-title">{title}</div>
      <div className="card-body">{children}</div>
    </div>
  );
}

/* ─── One-liner dark quote ───────────────────────────────────────── */

export function Oneliner({
  children,
  label = "Memorise This",
}: {
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <div className="oneliner">
      <div className="oneliner-label">{label}</div>
      <div className="oneliner-text">{children}</div>
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
    <div className="iq-section">
      <div className="iq-title">{title}</div>
      {sub && <div className="iq-sub">{sub}</div>}
      <div className="iq-list">{children}</div>
    </div>
  );
}

export function IQItem({
  num,
  level,
  children,
}: {
  num: number | string;
  level: "core" | "senior" | "advanced";
  children: React.ReactNode;
}) {
  const cap = level.charAt(0).toUpperCase() + level.slice(1);
  return (
    <div className="iq-card">
      <div className="iq-num">{String(num)}</div>
      <div className="iq-q">
        {children}
        <span className={`badge badge-${level}`}>{cap}</span>
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
  SectionLabel,
  HeroPills,
  Pill,
  HeroTag,
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
