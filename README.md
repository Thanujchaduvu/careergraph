# CareerGraph

CareerGraph is a graph-based career exploration platform that helps users discover career paths, understand required skills and prerequisites, explore related roles, and find learning resources.

The application uses **Next.js** for the frontend and API layer and **CognoDB** as the graph database for storing and traversing relationships between jobs, skills, courses, and companies.

## 🚀 Live Demo

https://careergraph-one.vercel.app/

## 💻 GitHub Repository

https://github.com/Thanujchaduvu/careergraph

---

## 📌 Overview

CareerGraph represents career information as an interconnected graph.

Instead of displaying career information as isolated lists, the application uses relationships such as:

```text
Job
 │
 ├── REQUIRES ───────────────→ Skill
 │
 ├── OFFERED_BY ─────────────→ Company
 │
 └── RELATED_TO ─────────────→ Job

Skill
 │
 └── PREREQUISITE_OF ────────→ Skill

Course
 │
 └── TEACHES ────────────────→ Skill

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
