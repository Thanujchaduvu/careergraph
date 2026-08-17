import { NextRequest, NextResponse } from "next/server";
import driver from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      {
        success: false,
        message: "Job ID is required.",
      },
      { status: 400 }
    );
  }

  const session = driver.session();

  try {
    const jobResult = await session.run(
      `
      MATCH (j:Job {id: $jobId})
      RETURN
        j.id AS id,
        j.title AS title,
        j.description AS description,
        j.level AS level
      `,
      { jobId: id }
    );

    if (jobResult.records.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Job not found.",
        },
        { status: 404 }
      );
    }

    const jobRecord = jobResult.records[0];

    // Required skills
    const skillsResult = await session.run(
      `
      MATCH (j:Job {id: $jobId})-[:REQUIRES]->(s:Skill)
      RETURN
        s.id AS id,
        s.name AS name,
        s.category AS category,
        s.difficulty AS difficulty
      ORDER BY s.name
      `,
      { jobId: id }
    );

    // Companies
    const companiesResult = await session.run(
      `
      MATCH (j:Job {id: $jobId})-[:OFFERED_BY]->(c:Company)
      RETURN
        c.id AS id,
        c.name AS name,
        c.industry AS industry,
        c.location AS location
      `,
      { jobId: id }
    );

    // Related jobs
    const relatedJobsResult = await session.run(
      `
      MATCH (j:Job {id: $jobId})-[:RELATED_TO]->(related:Job)
      RETURN
        related.id AS id,
        related.title AS title,
        related.level AS level
      ORDER BY related.title
      `,
      { jobId: id }
    );

    const job = {
      id: jobRecord.get("id"),
      title: jobRecord.get("title"),
      description: jobRecord.get("description"),
      level: jobRecord.get("level"),

      skills: skillsResult.records.map((record) => ({
        id: record.get("id"),
        name: record.get("name"),
        category: record.get("category"),
        difficulty: record.get("difficulty"),
      })),

      companies: companiesResult.records.map((record) => ({
        id: record.get("id"),
        name: record.get("name"),
        industry: record.get("industry"),
        location: record.get("location"),
      })),

      relatedJobs: relatedJobsResult.records.map((record) => ({
        id: record.get("id"),
        title: record.get("title"),
        level: record.get("level"),
      })),
    };

    return NextResponse.json({
      success: true,
      job,
    });
  } catch (error) {
    console.error("Job details API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve job details.",
      },
      { status: 500 }
    );
  } finally {
    await session.close();
  }
}