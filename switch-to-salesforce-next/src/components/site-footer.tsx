import { Mail, MessageCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const externalProps = {
  target: "_blank" as const,
  rel: "noopener noreferrer",
};

export function SiteFooter() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
  const waRaw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim();
  const whatsappDigits = waRaw ? waRaw.replace(/\D/g, "") : "";
  const showContact = Boolean(
    (contactEmail && contactEmail.includes("@")) || whatsappDigits.length >= 10
  );

  return (
    <footer className="border-t border-neutral-200 bg-neutral-50/80 dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div
          className={cn(
            "grid gap-10 sm:grid-cols-2 lg:gap-12",
            showContact ? "lg:grid-cols-4" : "lg:grid-cols-3"
          )}
        >
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
          {showContact ? (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-500">
                Contact
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-500">
                No account on this site—opens your email app or WhatsApp.
              </p>
              <ul className="mt-4 space-y-3 text-sm">
                {contactEmail && contactEmail.includes("@") ? (
                  <li>
                    <a
                      href={`mailto:${contactEmail}?subject=${encodeURIComponent("Switch to Salesforce")}`}
                      className="inline-flex items-center gap-2 text-neutral-700 transition hover:text-indigo-600 dark:text-neutral-300 dark:hover:text-indigo-400"
                    >
                      <Mail className="h-4 w-4 shrink-0 opacity-80" strokeWidth={2} />
                      Email
                    </a>
                  </li>
                ) : null}
                {whatsappDigits.length >= 10 ? (
                  <li>
                    <a
                      href={`https://wa.me/${whatsappDigits}`}
                      {...externalProps}
                      className="inline-flex items-center gap-2 text-neutral-700 transition hover:text-indigo-600 dark:text-neutral-300 dark:hover:text-indigo-400"
                    >
                      <MessageCircle className="h-4 w-4 shrink-0 opacity-80" strokeWidth={2} />
                      WhatsApp
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}
        </div>
        <p className="mt-12 border-t border-neutral-200 pt-8 text-center text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-500">
          © 2026 Switch to Salesforce
        </p>
      </div>
    </footer>
  );
}
