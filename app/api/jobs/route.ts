import { NextResponse } from "next/server";
import driver from "@/lib/db";

export async function GET() {
  const session = driver.session();

  try {
    const result = await session.run(`
      MATCH (j:Job)
      RETURN
        j.id AS id,
        j.title AS title,
        j.description AS description,
        j.level AS level
      ORDER BY j.title
    `);

    const jobs = result.records.map((record) => ({
      id: record.get("id"),
      title: record.get("title"),
      description: record.get("description"),
      level: record.get("level"),
    }));

    return NextResponse.json({
      success: true,
      jobs,
    });
  } catch (error) {
    console.error("Jobs API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve jobs from CognoDB.",
      },
      { status: 500 }
    );
  } finally {
    await session.close();
  }
}