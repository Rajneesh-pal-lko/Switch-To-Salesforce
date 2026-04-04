import type { Metadata } from "next";
import { ReadingContainer } from "@/components/reading-container";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Projects",
  description: "Salesforce-related projects and repos (coming in Phase 3).",
};

export default function ProjectsPage() {
  return (
    <>
      <SiteHeader />
      <div className="pb-16 pt-10">
        <ReadingContainer>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Projects
          </h1>
          <p className="mt-4 leading-relaxed text-neutral-600 dark:text-neutral-400">
            This page is a placeholder for Phase 3. You’ll showcase Salesforce
            projects with GitHub links here. The static HTML site at the repo root
            remains unchanged until you switch the deploy root on Vercel.
          </p>
        </ReadingContainer>
      </div>
    </>
  );
}
