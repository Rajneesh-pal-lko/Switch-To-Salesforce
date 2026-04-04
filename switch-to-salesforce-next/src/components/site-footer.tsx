import Link from "next/link";

const externalProps = {
  target: "_blank" as const,
  rel: "noopener noreferrer",
};

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50/80 dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          <div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
              Switch to Salesforce
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              Helping developers and admins transition into the Salesforce ecosystem
              through practical learning, tutorials, and career notes.
            </p>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-500">
              Resources
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link
                  href="/blog"
                  className="text-neutral-700 transition hover:text-indigo-600 dark:text-neutral-300 dark:hover:text-indigo-400"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className="text-neutral-700 transition hover:text-indigo-600 dark:text-neutral-300 dark:hover:text-indigo-400"
                >
                  Projects
                </Link>
              </li>
              <li>
                <a
                  href="https://switch-to-salesforce.vercel.app/"
                  {...externalProps}
                  className="text-neutral-700 transition hover:text-indigo-600 dark:text-neutral-300 dark:hover:text-indigo-400"
                >
                  Learning Platform
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-500">
              Community
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a
                  href="https://www.youtube.com/@SwitchtoSalesforce"
                  {...externalProps}
                  className="text-neutral-700 transition hover:text-indigo-600 dark:text-neutral-300 dark:hover:text-indigo-400"
                >
                  YouTube
                </a>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-12 border-t border-neutral-200 pt-8 text-center text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-500">
          © 2026 Switch to Salesforce
        </p>
      </div>
    </footer>
  );
}
