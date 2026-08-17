import dotenv from "dotenv";
import neo4j from "neo4j-driver";

import { jobs } from "../data/jobs.js";
import { skills } from "../data/skills.js";
import { companies } from "../data/companies.js";
import { courses } from "../data/courses.js";

/*
 * =========================================================
 * LOAD ENVIRONMENT VARIABLES
 * =========================================================
 *
 * The Next.js application automatically loads .env.local,
 * but this standalone tsx seed script does not.
 *
 * Therefore we explicitly load .env.local here.
 */
dotenv.config({
  path: ".env.local",
});

const uri = process.env.COGNODB_URI;
const username = process.env.COGNODB_USERNAME;
const password = process.env.COGNODB_PASSWORD;

if (!uri || !username || !password) {
  throw new Error(
    "Missing COGNODB_URI, COGNODB_USERNAME, or COGNODB_PASSWORD"
  );
}

/*
 * =========================================================
 * CREATE NEO4J / COGNODB DRIVER
 * =========================================================
 */

const driver = neo4j.driver(
  uri,
  neo4j.auth.basic(username, password)
);

const session = driver.session();

/*
 * =========================================================
 * SEED DATABASE
 * =========================================================
 */

async function seedDatabase() {
  try {
    console.log("");
    console.log("=================================");
    console.log("Starting CareerGraph seed...");
    console.log("=================================");
    console.log("");

    // =======================================================
    // 1. CLEAR EXISTING GRAPH
    // =======================================================

    console.log("1. Clearing existing graph...");

    await session.run(`
      MATCH (n)
      DETACH DELETE n
    `);

    console.log("   ✓ Existing graph cleared");
    console.log("");

    // =======================================================
    // 2. CREATE CONSTRAINTS
    // =======================================================

    console.log("2. Creating constraints...");

    await session.run(`
      CREATE CONSTRAINT job_id IF NOT EXISTS
      FOR (j:Job)
      REQUIRE j.id IS UNIQUE
    `);

    await session.run(`
      CREATE CONSTRAINT skill_id IF NOT EXISTS
      FOR (s:Skill)
      REQUIRE s.id IS UNIQUE
    `);

    await session.run(`
      CREATE CONSTRAINT company_id IF NOT EXISTS
      FOR (c:Company)
      REQUIRE c.id IS UNIQUE
    `);

    await session.run(`
      CREATE CONSTRAINT course_id IF NOT EXISTS
      FOR (c:Course)
      REQUIRE c.id IS UNIQUE
    `);

    console.log("   ✓ Job constraint");
    console.log("   ✓ Skill constraint");
    console.log("   ✓ Company constraint");
    console.log("   ✓ Course constraint");
    console.log("");

    // =======================================================
    // 3. CREATE SKILLS
    // =======================================================

    console.log(`3. Creating ${skills.length} skills...`);

    await session.run(
      `
      UNWIND $skills AS skill

      MERGE (s:Skill {id: skill.id})

      SET
        s.name = skill.name,
        s.category = skill.category,
        s.difficulty = skill.difficulty
      `,
      {
        skills,
      }
    );

    console.log("   ✓ Skills created");
    console.log("");

    // =======================================================
    // 4. CREATE JOBS
    // =======================================================

    console.log(`4. Creating ${jobs.length} jobs...`);

    await session.run(
      `
      UNWIND $jobs AS job

      MERGE (j:Job {id: job.id})

      SET
        j.title = job.title,
        j.description = job.description,
        j.level = job.level
      `,
      {
        jobs,
      }
    );

    console.log("   ✓ Jobs created");
    console.log("");

    // =======================================================
    // 5. CREATE COMPANIES
    // =======================================================

    console.log(
      `5. Creating ${companies.length} companies...`
    );

    await session.run(
      `
      UNWIND $companies AS company

      MERGE (c:Company {id: company.id})

      SET
        c.name = company.name,
        c.industry = company.industry,
        c.location = company.location
      `,
      {
        companies,
      }
    );

    console.log("   ✓ Companies created");
    console.log("");

    // =======================================================
    // 6. CREATE COURSES
    // =======================================================

    console.log(`6. Creating ${courses.length} courses...`);

    await session.run(
      `
      UNWIND $courses AS course

      MERGE (c:Course {id: course.id})

      SET
        c.title = course.title,
        c.platform = course.platform,
        c.level = course.level,
        c.duration = course.duration
      `,
      {
        courses,
      }
    );

    console.log("   ✓ Courses created");
    console.log("");

    // =======================================================
    // 7. JOB → SKILL RELATIONSHIPS
    // =======================================================

    console.log(
      "7. Creating Job → REQUIRES → Skill relationships..."
    );

    await session.run(`
      MATCH
        (fullstack:Job {id: "job-fullstack"}),
        (frontend:Job {id: "job-frontend"}),
        (backend:Job {id: "job-backend"}),
        (software:Job {id: "job-software"}),
        (reactJob:Job {id: "job-react"}),

        (html:Skill {id: "skill-html"}),
        (css:Skill {id: "skill-css"}),
        (javascript:Skill {id: "skill-javascript"}),
        (react:Skill {id: "skill-react"}),
        (nextjs:Skill {id: "skill-nextjs"}),
        (nodejs:Skill {id: "skill-nodejs"}),
        (express:Skill {id: "skill-express"}),
        (rest:Skill {id: "skill-rest"}),
        (sql:Skill {id: "skill-sql"}),
        (git:Skill {id: "skill-git"}),
        (typescript:Skill {id: "skill-typescript"})

      CREATE
        // Full Stack Developer
        (fullstack)-[:REQUIRES]->(javascript),
        (fullstack)-[:REQUIRES]->(react),
        (fullstack)-[:REQUIRES]->(nodejs),
        (fullstack)-[:REQUIRES]->(sql),
        (fullstack)-[:REQUIRES]->(git),

        // Frontend Developer
        (frontend)-[:REQUIRES]->(html),
        (frontend)-[:REQUIRES]->(css),
        (frontend)-[:REQUIRES]->(javascript),
        (frontend)-[:REQUIRES]->(react),
        (frontend)-[:REQUIRES]->(git),

        // Backend Developer
        (backend)-[:REQUIRES]->(javascript),
        (backend)-[:REQUIRES]->(nodejs),
        (backend)-[:REQUIRES]->(express),
        (backend)-[:REQUIRES]->(rest),
        (backend)-[:REQUIRES]->(sql),

        // Software Engineer
        (software)-[:REQUIRES]->(javascript),
        (software)-[:REQUIRES]->(sql),
        (software)-[:REQUIRES]->(git),
        (software)-[:REQUIRES]->(rest),

        // React Developer
        (reactJob)-[:REQUIRES]->(javascript),
        (reactJob)-[:REQUIRES]->(react),
        (reactJob)-[:REQUIRES]->(typescript),
        (reactJob)-[:REQUIRES]->(git)
    `);

    console.log("   ✓ Job → Skill relationships created");
    console.log("");

    // =======================================================
    // 8. SKILL PREREQUISITE RELATIONSHIPS
    // =======================================================

    console.log(
      "8. Creating Skill → PREREQUISITE_OF → Skill relationships..."
    );

    /*
     * These relationships create useful multi-hop paths.
     *
     * Backend:
     *
     * HTML
     *   ↓
     * JavaScript
     *   ↓
     * Node.js
     *   ↓
     * Express.js
     *
     * Frontend / React:
     *
     * HTML ─────┐
     *            ↓
     * JavaScript → React → Next.js
     *            ↑
     * CSS ───────┘
     *
     * TypeScript:
     *
     * JavaScript → TypeScript
     */

    await session.run(`
      MATCH
        (html:Skill {id: "skill-html"}),
        (css:Skill {id: "skill-css"}),
        (javascript:Skill {id: "skill-javascript"}),
        (react:Skill {id: "skill-react"}),
        (nextjs:Skill {id: "skill-nextjs"}),
        (nodejs:Skill {id: "skill-nodejs"}),
        (express:Skill {id: "skill-express"}),
        (typescript:Skill {id: "skill-typescript"})

      CREATE

        // HTML / CSS → JavaScript
        (html)-[:PREREQUISITE_OF]->(javascript),
        (css)-[:PREREQUISITE_OF]->(javascript),

        // JavaScript → Node.js
        (javascript)-[:PREREQUISITE_OF]->(nodejs),

        // Node.js → Express.js
        (nodejs)-[:PREREQUISITE_OF]->(express),

        // JavaScript → Express.js
        (javascript)-[:PREREQUISITE_OF]->(express),

        // JavaScript → React
        (javascript)-[:PREREQUISITE_OF]->(react),

        // HTML / CSS → React
        (html)-[:PREREQUISITE_OF]->(react),
        (css)-[:PREREQUISITE_OF]->(react),

        // React → Next.js
        (react)-[:PREREQUISITE_OF]->(nextjs),

        // JavaScript → Next.js
        (javascript)-[:PREREQUISITE_OF]->(nextjs),

        // JavaScript → TypeScript
        (javascript)-[:PREREQUISITE_OF]->(typescript)
    `);

    console.log(
      "   ✓ Prerequisite relationships created"
    );
    console.log("");

    // =======================================================
    // 9. COURSE → SKILL RELATIONSHIPS
    // =======================================================

    console.log(
      "9. Creating Course → TEACHES → Skill relationships..."
    );

    await session.run(`
      MATCH
        (web:Course {id: "course-web"}),
        (javascriptCourse:Course {id: "course-javascript"}),
        (reactCourse:Course {id: "course-react"}),
        (nextCourse:Course {id: "course-nextjs"}),
        (nodeCourse:Course {id: "course-node"}),
        (sqlCourse:Course {id: "course-sql"}),
        (typescriptCourse:Course {id: "course-typescript"}),

        (html:Skill {id: "skill-html"}),
        (css:Skill {id: "skill-css"}),
        (javascript:Skill {id: "skill-javascript"}),
        (react:Skill {id: "skill-react"}),
        (nextjs:Skill {id: "skill-nextjs"}),
        (nodejs:Skill {id: "skill-nodejs"}),
        (sql:Skill {id: "skill-sql"}),
        (typescript:Skill {id: "skill-typescript"})

      CREATE

        // Web fundamentals
        (web)-[:TEACHES]->(html),
        (web)-[:TEACHES]->(css),

        // JavaScript
        (javascriptCourse)-[:TEACHES]->(javascript),

        // React
        (reactCourse)-[:TEACHES]->(react),

        // Next.js
        (nextCourse)-[:TEACHES]->(nextjs),

        // Node.js
        (nodeCourse)-[:TEACHES]->(nodejs),

        // SQL
        (sqlCourse)-[:TEACHES]->(sql),

        // TypeScript
        (typescriptCourse)-[:TEACHES]->(typescript)
    `);

    console.log(
      "   ✓ Course → Skill relationships created"
    );
    console.log("");

    // =======================================================
    // 10. JOB → COMPANY RELATIONSHIPS
    // =======================================================

    console.log(
      "10. Creating Job → OFFERED_BY → Company relationships..."
    );

    await session.run(`
      MATCH
        (fullstack:Job {id: "job-fullstack"}),
        (frontend:Job {id: "job-frontend"}),
        (backend:Job {id: "job-backend"}),
        (software:Job {id: "job-software"}),
        (reactJob:Job {id: "job-react"}),

        (techNova:Company {id: "company-technova"}),
        (cloudSphere:Company {id: "company-cloudsphere"}),
        (dataWorks:Company {id: "company-dataworks"}),
        (innovateLabs:Company {id: "company-innovatelabs"})

      CREATE
        (fullstack)-[:OFFERED_BY]->(techNova),
        (frontend)-[:OFFERED_BY]->(cloudSphere),
        (backend)-[:OFFERED_BY]->(dataWorks),
        (software)-[:OFFERED_BY]->(techNova),
        (reactJob)-[:OFFERED_BY]->(innovateLabs)
    `);

    console.log(
      "   ✓ Job → Company relationships created"
    );
    console.log("");

    // =======================================================
    // 11. RELATED JOB RELATIONSHIPS
    // =======================================================

    console.log(
      "11. Creating Job → RELATED_TO → Job relationships..."
    );

    await session.run(`
      MATCH
        (fullstack:Job {id: "job-fullstack"}),
        (frontend:Job {id: "job-frontend"}),
        (backend:Job {id: "job-backend"}),
        (software:Job {id: "job-software"}),
        (reactJob:Job {id: "job-react"})

      CREATE
        (fullstack)-[:RELATED_TO]->(frontend),
        (fullstack)-[:RELATED_TO]->(backend),

        (frontend)-[:RELATED_TO]->(reactJob),

        (backend)-[:RELATED_TO]->(software),

        (software)-[:RELATED_TO]->(fullstack)
    `);

    console.log(
      "   ✓ Related job relationships created"
    );
    console.log("");

    // =======================================================
    // 12. VERIFY GRAPH
    // =======================================================

    console.log("12. Verifying graph...");
    console.log("");

    const jobCountResult = await session.run(`
      MATCH (j:Job)
      RETURN count(j) AS count
    `);

    const skillCountResult = await session.run(`
      MATCH (s:Skill)
      RETURN count(s) AS count
    `);

    const companyCountResult = await session.run(`
      MATCH (c:Company)
      RETURN count(c) AS count
    `);

    const courseCountResult = await session.run(`
      MATCH (c:Course)
      RETURN count(c) AS count
    `);

    const prerequisiteCountResult =
      await session.run(`
        MATCH ()-[r:PREREQUISITE_OF]->()
        RETURN count(r) AS count
      `);

    const requiresCountResult =
      await session.run(`
        MATCH ()-[r:REQUIRES]->()
        RETURN count(r) AS count
      `);

    const teachesCountResult =
      await session.run(`
        MATCH ()-[r:TEACHES]->()
        RETURN count(r) AS count
      `);

    const offeredByCountResult =
      await session.run(`
        MATCH ()-[r:OFFERED_BY]->()
        RETURN count(r) AS count
      `);

    const relatedToCountResult =
      await session.run(`
        MATCH ()-[r:RELATED_TO]->()
        RETURN count(r) AS count
      `);

    const jobCount =
      jobCountResult.records[0]
        .get("count")
        .toNumber();

    const skillCount =
      skillCountResult.records[0]
        .get("count")
        .toNumber();

    const companyCount =
      companyCountResult.records[0]
        .get("count")
        .toNumber();

    const courseCount =
      courseCountResult.records[0]
        .get("count")
        .toNumber();

    const prerequisiteCount =
      prerequisiteCountResult.records[0]
        .get("count")
        .toNumber();

    const requiresCount =
      requiresCountResult.records[0]
        .get("count")
        .toNumber();

    const teachesCount =
      teachesCountResult.records[0]
        .get("count")
        .toNumber();

    const offeredByCount =
      offeredByCountResult.records[0]
        .get("count")
        .toNumber();

    const relatedToCount =
      relatedToCountResult.records[0]
        .get("count")
        .toNumber();

    console.log("=================================");
    console.log("CareerGraph seed completed!");
    console.log("=================================");
    console.log("");

    console.log(`Jobs: ${jobCount}`);
    console.log(`Skills: ${skillCount}`);
    console.log(`Companies: ${companyCount}`);
    console.log(`Courses: ${courseCount}`);
    console.log("");

    console.log("Relationships:");
    console.log(
      `REQUIRES: ${requiresCount}`
    );
    console.log(
      `PREREQUISITE_OF: ${prerequisiteCount}`
    );
    console.log(
      `TEACHES: ${teachesCount}`
    );
    console.log(
      `OFFERED_BY: ${offeredByCount}`
    );
    console.log(
      `RELATED_TO: ${relatedToCount}`
    );

    console.log("");
    console.log("Graph model:");
    console.log(
      "Job → REQUIRES → Skill"
    );
    console.log(
      "Skill → PREREQUISITE_OF → Skill"
    );
    console.log(
      "Course → TEACHES → Skill"
    );
    console.log(
      "Job → OFFERED_BY → Company"
    );
    console.log(
      "Job → RELATED_TO → Job"
    );

    console.log("");
    console.log(
      "Multi-hop career traversal is ready."
    );
    console.log("");
  } catch (error) {
    console.error("");
    console.error("=================================");
    console.error("CareerGraph seed FAILED");
    console.error("=================================");
    console.error("");
    console.error(error);
    console.error("");

    process.exitCode = 1;
  } finally {
    await session.close();
    await driver.close();
  }
}

/*
 * =========================================================
 * RUN SEED
 * =========================================================
 */

seedDatabase();