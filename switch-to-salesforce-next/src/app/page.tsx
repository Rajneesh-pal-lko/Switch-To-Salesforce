import { HomeHero } from "@/components/home-hero";
import { HomeLatestPosts } from "@/components/home-latest-posts";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <HomeHero />
        <HomeLatestPosts />
        <section className="border-t border-neutral-200 py-10 dark:border-neutral-800">
          <p className="mx-auto max-w-3xl px-4 text-center text-xs text-neutral-500 dark:text-neutral-500 sm:px-6">
            Source for this site:{" "}
            <code className="rounded bg-neutral-100 px-1 py-0.5 dark:bg-neutral-800">
              switch-to-salesforce-next/
            </code>
            . The legacy static UI remains in{" "}
            <code className="rounded bg-neutral-100 px-1 py-0.5 dark:bg-neutral-800">
              switch-to-salesforce-frontend/
            </code>
            .
          </p>
        </section>
      </main>
    </>
  );
}
