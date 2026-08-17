import { NextRequest, NextResponse } from "next/server";
import driver from "@/lib/db";

export async function GET(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json(
      {
        success: false,
        message: "jobId is required.",
      },
      { status: 400 }
    );
  }

  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (j:Job {id: $jobId})
            -[:REQUIRES]->(required:Skill)

      OPTIONAL MATCH
            (required)
            <-[:PREREQUISITE_OF*0..3]-(skill:Skill)

      MATCH (course:Course)-[:TEACHES]->(skill)

      RETURN DISTINCT
        course.id AS id,
        course.title AS title,
        course.platform AS platform,
        course.level AS level,
        course.duration AS duration,
        collect(DISTINCT skill.name) AS skills

      ORDER BY course.title
      `,
      { jobId }
    );

    const recommendations = result.records.map((record) => ({
      id: record.get("id"),
      title: record.get("title"),
      platform: record.get("platform"),
      level: record.get("level"),
      duration: record.get("duration"),
      skills: record.get("skills"),
    }));

    return NextResponse.json({
      success: true,
      recommendations,
    });
  } catch (error) {
    console.error("Recommendation error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate course recommendations.",
      },
      { status: 500 }
    );
  } finally {
    await session.close();
  }
}