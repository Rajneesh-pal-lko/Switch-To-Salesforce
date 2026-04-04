import { Cloud } from "lucide-react";
import Link from "next/link";
import { IconGithub, IconLinkedin } from "@/components/social-icons";
import { cn } from "@/lib/utils";

export type AuthorBoxProps = {
  name: string;
  bio: string;
  githubUrl?: string;
  linkedinUrl?: string;
  trailheadUrl?: string;
  className?: string;
};

export function AuthorBox({
  name,
  bio,
  githubUrl,
  linkedinUrl,
  trailheadUrl,
  className,
}: AuthorBoxProps) {
  const hasSocial = githubUrl || linkedinUrl || trailheadUrl;

  return (
    <aside
      className={cn(
        "mt-12 rounded-2xl border border-neutral-200 bg-neutral-50/80 p-6 dark:border-neutral-800 dark:bg-neutral-900/50",
        className
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div
          className="mx-auto h-16 w-16 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 ring-2 ring-white dark:ring-neutral-950 sm:mx-0"
          role="img"
          aria-label=""
        />
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            {name}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            {bio}
          </p>
          {hasSocial && (
            <ul className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              {githubUrl && (
                <li>
                  <Link
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-indigo-500 dark:hover:text-indigo-300"
                    aria-label={`${name} on GitHub`}
                  >
                    <IconGithub />
                  </Link>
                </li>
              )}
              {linkedinUrl && (
                <li>
                  <Link
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-indigo-500 dark:hover:text-indigo-300"
                    aria-label={`${name} on LinkedIn`}
                  >
                    <IconLinkedin />
                  </Link>
                </li>
              )}
              {trailheadUrl && (
                <li>
                  <Link
                    href={trailheadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-[#032d60] transition hover:border-sky-400 hover:text-sky-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-sky-300 dark:hover:border-sky-500"
                    aria-label={`${name} on Trailhead`}
                  >
                    <Cloud className="h-5 w-5" strokeWidth={1.75} />
                  </Link>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </aside>
  );
}
