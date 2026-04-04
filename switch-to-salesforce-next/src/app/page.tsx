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
      </main>
    </>
  );
}
