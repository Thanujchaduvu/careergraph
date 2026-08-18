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

## Why a Graph Database?

CareerGraph is based on relationships between careers, skills, prerequisites, courses, and companies. These connections are the core of the application, which makes a graph database a natural fit.

In a relational database, answering questions such as:

- What skills does a Backend Developer require?
- What prerequisites are needed before learning those skills?
- What other careers are related to this role?
- Which courses teach the skills required for a career?

would require multiple tables, JOINs, and recursive queries.

With CognoDB, these relationships are represented directly as graph edges:

Job → REQUIRES → Skill
Skill → PREREQUISITE_OF → Skill
Course → TEACHES → Skill
Job → OFFERED_BY → Company
Job → RELATED_TO → Job

This makes relationship traversal and multi-hop career-path discovery much more natural.

For example, CareerGraph can traverse:

HTML
↓
JavaScript
↓
Node.js
↓
Express.js

to identify prerequisite skills for a target career.

The graph model also makes it easier to extend the application with additional relationships such as related careers, learning resources, companies, and future career transitions without redesigning a large relational schema.


## Data Model

```text
                    ┌──────────────┐
                    │     Job      │
                    └──────┬───────┘
                           │
                     REQUIRES
                           │
                           ▼
                    ┌──────────────┐
                    │    Skill     │
                    └──────┬───────┘
                           │
                  PREREQUISITE_OF
                           │
                           ▼
                    ┌──────────────┐
                    │    Skill     │
                    └──────────────┘


┌──────────────┐
│    Course    │
└──────┬───────┘
       │
    TEACHES
       │
       ▼
┌──────────────┐
│    Skill     │
└──────────────┘


┌──────────────┐
│     Job      │
└──────┬───────┘
       │
   OFFERED_BY
       │
       ▼
┌──────────────┐
│   Company    │
└──────────────┘


┌──────────────┐
│     Job      │
└──────┬───────┘
       │
   RELATED_TO
       │
       ▼
┌──────────────┐
│     Job      │
└──────────────┘




This directly documents the graph model required by the assignment. :contentReference[oaicite:1]{index=1}

\\ Add the main queries section \\

Your README should also contain:

```markdown
## Main Graph Queries

### 1. Find skills required by a job

```cypher
MATCH (j:Job {id: $jobId})-[:REQUIRES]->(skill:Skill)
RETURN j, skill
ORDER BY skill.name


Seeded Data

The project includes realistic seed data and a database seed script.

Current graph:

Entity / Relationship	Count
Jobs	5
Skills	11
Companies	4
Courses	7
REQUIRES	23
PREREQUISITE_OF	11
TEACHES	8
OFFERED_BY	5
RELATED_TO	5

The seed script is located at:

scripts/seed.ts
🛠️ Technology Stack
Frontend
Next.js
React
TypeScript
Tailwind CSS
Backend
Next.js App Router
Next.js Route Handlers
TypeScript
Database
CognoDB
openCypher
Bolt protocol
Neo4j JavaScript Driver
Deployment
Vercel
GitHub
