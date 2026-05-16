# What Switch To Salesforce is for

This document describes the **intent of the website** (the public experience), not how to run or deploy the code. For technical layout, see the repository [README](../README.md) and the frontend overview in team notes or `switch-to-salesforce-frontend/README.md`.

---

## Mission

**Switch To Salesforce** is a **learning and reference site** for people who work with—or want to work with—the **Salesforce platform**. It is meant to feel closer to **clear product documentation** than to a noisy marketing blog: structured navigation, readable articles, and space for both **admins** and **developers**.

The name reflects the audience: **admins and developers adopting or deepening Salesforce skills**, and **people switching careers** into Salesforce roles.

---

## Who it is for

| Audience | What they get |
|----------|----------------|
| **New admins** | Fundamentals, configuration patterns, and “how things fit together” explanations. |
| **Developers** | Apex, Lightning Web Components (LWC), APIs, and implementation-oriented guides. |
| **Flow / automation builders** | Flow Builder and related platform automation topics. |
| **Interview & certification candidates** | Interview-style content, certification preparation, and career-oriented material. |
| **Career switchers** | Roadmaps and guidance for moving into Salesforce from other backgrounds. |

Anyone who benefits from **long-form, documentation-style tutorials** (rather than only release notes or vendor marketing) is in scope.

---

## What the public site delivers

1. **Documentation-style articles**  
   Blog posts and long-form content with consistent reading layout, code highlighting where needed, and optional rich CMS pages (including HTML uploads for special layouts).

2. **A structured “doc” sidebar**  
   Content is grouped into **sections (groups)** and **topics**, so readers can browse like a small product manual—not only a reverse-chronological blog feed.

3. **Topic landing pages**  
   Each topic can surface **CMS pages** and **blog posts** aligned to that topic, so readers land in one place and then open the article they need.

4. **Classic blog features**  
   Categories, listing pages, search, comments on posts, and a newsletter/contact path for staying in touch.

5. **Polished reading experience**  
   Light/dark theme, responsive layout, reading progress on articles, and layouts tuned for laptop and large screens.

---

## What the site is *not* primarily for

- **A replacement for Salesforce Help**, Trailhead, or official product documentation—it complements them with a single editorial voice and curated paths.
- **A community forum**—discussion is limited (e.g. comments on posts), not open-ended threads.
- **A SaaS product** for end users of a customer org—the focus is **platform learning**, not a packaged business application.

---

## Editorial tone and brand

- **Clear over clever** — sentences readers can skim; headings that carry meaning.  
- **Honest scope** — topics match what the author maintains (Apex, LWC, Flow, admin patterns, interviews, certifications, career).  
- **Inclusive of career paths** — “switch to” includes people **changing roles**, not only switching vendors.

---

## How this relates to the codebase

- The **public site** (`switch-to-salesforce-frontend/`) implements the reading experience, sidebar navigation, topic pages, articles, and forms.  
- The **admin area** (`switch-to-salesforce-frontend/admin/`) plus the **API** (`switch-to-salesforce-backend/`) power publishing, sidebar structure, media, and moderation.  
- Together they implement a **small publishing platform** optimized for this brand and content model—not a generic CMS theme.

---

## One-line summary

> **Switch To Salesforce** is a documentation-style learning site for Salesforce admins and developers—covering platform skills, interviews, certifications, and career growth—with a structured sidebar, articles, and a calm reading experience.

If you extend the site, use this page to check that new features still support that purpose.
