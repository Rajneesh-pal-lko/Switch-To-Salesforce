import { HomeHero } from "@/components/home-hero";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <HomeHero />
        <section className="py-12">
          <p className="mx-auto max-w-3xl px-4 text-center text-sm text-neutral-500 dark:text-neutral-400 sm:px-6">
            Next.js app lives in{" "}
            <code className="rounded bg-neutral-100 px-1.5 py-0.5 dark:bg-neutral-800">
              switch-to-salesforce-next/
            </code>
            . The original static site in{" "}
            <code className="rounded bg-neutral-100 px-1.5 py-0.5 dark:bg-neutral-800">
              switch-to-salesforce-frontend/
            </code>{" "}
            is unchanged.
          </p>
        </section>
      </main>
    </>
  );
}
