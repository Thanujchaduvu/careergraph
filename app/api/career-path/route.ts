import { NextRequest, NextResponse } from "next/server";
import driver from "@/lib/db";

interface GraphNode {
  id: string;
  type: "job" | "skill" | "prerequisite";
  label: string;
  category?: string;
  difficulty?: string;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: "requires" | "prerequisite";
  label: string;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  difficulty: string;
}

interface PathNode {
  id: string;
  name: string;
  category: string;
  difficulty: string;
}

interface PathRelationship {
  id: string;
  type: string;
  source: string;
  target: string;
}

export async function GET(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get("jobId");

  // Validate jobId
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
    /*
     * =========================================================
     * 1. GET JOB + DIRECTLY REQUIRED SKILLS
     * =========================================================
     *
     * Job
     *  ↓
     * REQUIRES
     *  ↓
     * Skill
     */
    const requiredResult = await session.run(
      `
      MATCH (j:Job {id: $jobId})
            -[:REQUIRES]->(skill:Skill)

      RETURN
        j.id AS jobId,
        j.title AS jobTitle,

        skill.id AS id,
        skill.name AS name,
        skill.category AS category,
        skill.difficulty AS difficulty

      ORDER BY skill.name
      `,
      {
        jobId,
      }
    );

    // Job does not exist or has no required skills
    if (requiredResult.records.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Job or required skills not found.",
        },
        { status: 404 }
      );
    }

    const jobTitle =
      requiredResult.records[0].get("jobTitle");

    /*
     * Convert required skills into normal JavaScript objects.
     */
    const requiredSkills: Skill[] =
      requiredResult.records.map((record) => ({
        id: record.get("id"),
        name: record.get("name"),
        category: record.get("category"),
        difficulty: record.get("difficulty"),
      }));

    /*
     * =========================================================
     * 2. CREATE INITIAL GRAPH
     * =========================================================
     */

    const graphNodes: GraphNode[] = [];

    const graphEdges: GraphEdge[] = [];

    /*
     * Job node
     */
    graphNodes.push({
      id: jobId,
      type: "job",
      label: jobTitle,
      category: "Job",
    });

    /*
     * =========================================================
     * 3. ADD REQUIRED SKILLS
     * =========================================================
     *
     * Job
     *  │
     *  ├── REQUIRES → JavaScript
     *  ├── REQUIRES → React
     *  ├── REQUIRES → Node.js
     *  ├── REQUIRES → SQL
     *  └── REQUIRES → Git
     */

    for (const skill of requiredSkills) {
      graphNodes.push({
        id: skill.id,
        type: "skill",
        label: skill.name,
        category: skill.category,
        difficulty: skill.difficulty,
      });

      graphEdges.push({
        id: `${jobId}-requires-${skill.id}`,
        source: jobId,
        target: skill.id,
        type: "requires",
        label: "REQUIRES",
      });
    }

    /*
     * =========================================================
     * 4. MULTI-HOP PREREQUISITE TRAVERSAL
     * =========================================================
     *
     * We traverse backwards because our relationship is:
     *
     * HTML
     *   │
     *   └── PREREQUISITE_OF → JavaScript
     *
     * Therefore:
     *
     * JavaScript
     *   <- PREREQUISITE_OF - HTML
     *
     * Maximum depth = 3 hops.
     */

    const pathResult = await session.run(
      `
      MATCH (j:Job {id: $jobId})
            -[:REQUIRES]->(required:Skill)

      MATCH p =
        (required)
        <-[:PREREQUISITE_OF*1..3]-(prerequisite:Skill)

      RETURN
        required.id AS requiredId,

        [node IN nodes(p) | {
          id: node.id,
          name: node.name,
          category: node.category,
          difficulty: node.difficulty
        }] AS pathNodes,

        [rel IN relationships(p) | {
          id: elementId(rel),
          type: type(rel),
          source: startNode(rel).id,
          target: endNode(rel).id
        }] AS pathRelationships
      `,
      {
        jobId,
      }
    );

    /*
     * Keep track of existing nodes and edges.
     * This prevents duplicate graph elements.
     */
    const nodeIds = new Set<string>(
      graphNodes.map((node) => node.id)
    );

    const edgeIds = new Set<string>(
      graphEdges.map((edge) => edge.id)
    );

    /*
     * Store prerequisite skills separately.
     */
    const prerequisiteSkillsMap =
      new Map<string, Skill>();

    /*
     * =========================================================
     * 5. ADD ACTUAL PREREQUISITE NODES + EDGES
     * =========================================================
     */

    for (const record of pathResult.records) {
      const pathNodes =
        record.get("pathNodes") as PathNode[];

      const pathRelationships =
        record.get(
          "pathRelationships"
        ) as PathRelationship[];

      /*
       * Add nodes
       */
      for (const node of pathNodes) {
        /*
         * If this node is already a required skill,
         * keep its existing "skill" type.
         */
        const isRequiredSkill = requiredSkills.some(
          (skill) => skill.id === node.id
        );

        if (!nodeIds.has(node.id)) {
          graphNodes.push({
            id: node.id,

            type: isRequiredSkill
              ? "skill"
              : "prerequisite",

            label: node.name,

            category: node.category,

            difficulty: node.difficulty,
          });

          nodeIds.add(node.id);
        }

        /*
         * Store prerequisite information.
         *
         * Don't store a required skill as a prerequisite.
         */
        if (!isRequiredSkill) {
          prerequisiteSkillsMap.set(node.id, {
            id: node.id,
            name: node.name,
            category: node.category,
            difficulty: node.difficulty,
          });
        }
      }

      /*
       * Add ACTUAL database relationships.
       */
      for (const relationship of pathRelationships) {
        /*
         * Use a stable edge ID.
         */
        const edgeId =
          relationship.id ||
          `${relationship.source}-${relationship.target}-${relationship.type}`;

        if (!edgeIds.has(edgeId)) {
          graphEdges.push({
            id: edgeId,

            source: relationship.source,

            target: relationship.target,

            type: "prerequisite",

            label: "PREREQUISITE_OF",
          });

          edgeIds.add(edgeId);
        }
      }
    }

    /*
     * =========================================================
     * 6. FINAL PREREQUISITE SKILL LIST
     * =========================================================
     */

    const prerequisiteSkills =
      Array.from(
        prerequisiteSkillsMap.values()
      ).sort((a, b) =>
        a.name.localeCompare(b.name)
      );

    /*
     * =========================================================
     * 7. RETURN COMPLETE GRAPH
     * =========================================================
     */

    return NextResponse.json({
      success: true,

      job: {
        id: jobId,
        title: jobTitle,
      },

      /*
       * Direct Job → Skill relationships
       */
      requiredSkills,

      /*
       * Skills discovered through:
       *
       * Job
       * ↓
       * REQUIRES
       * ↓
       * Skill
       * ↑
       * PREREQUISITE_OF
       * ↑
       * Prerequisite
       */
      prerequisiteSkills,

      /*
       * Exact graph representation from CognoDB.
       */
      graph: {
        nodes: graphNodes,
        edges: graphEdges,
      },
    });
  } catch (error) {
    console.error(
      "Career path API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to calculate career path.",
      },
      { status: 500 }
    );
  } finally {
    await session.close();
  }
}