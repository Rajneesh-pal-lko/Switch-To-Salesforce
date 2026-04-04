import Link from "next/link";
import { ReadingContainer } from "@/components/reading-container";

export function HomeHero() {
  return (
    <section className="border-b border-neutral-200 bg-gradient-to-b from-indigo-50/80 to-transparent py-16 dark:border-neutral-800 dark:from-indigo-950/40 dark:to-transparent sm:py-24">
      <ReadingContainer className="text-center sm:text-left">
        <p className="text-sm font-medium uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Salesforce learning
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-5xl">
          Mastering the Switch to Salesforce
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-neutral-600 dark:text-neutral-300 sm:mx-0">
          Practical tutorials, career notes, and patterns for developers and admins
          moving into the Salesforce ecosystem — from Apex and LWC to Flow,
          certifications, and interviews.
        </p>
        <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:justify-start">
          <Link
            href="/blog"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Start Learning
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-neutral-900 shadow-sm transition hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
          >
            View Projects
          </Link>
        </div>
      </ReadingContainer>
    </section>
  );
}
