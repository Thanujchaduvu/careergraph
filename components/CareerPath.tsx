"use client";

import { useEffect, useState } from "react";

import SkillBadge from "./SkillBadge";
import SkillGraph from "./SkillGraph";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";

interface Skill {
  id: string;
  name: string;
  category: string;
  difficulty: string;
}

interface GraphNode {
  id: string;
  type: "job" | "skill" | "prerequisite";
  label: string;
  category?: string;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: "requires" | "prerequisite";
  label: string;
}

interface CareerPathProps {
  jobId: string;
  jobTitle: string;
  requiredSkills: {
    id: string;
    name: string;
  }[];
}

export default function CareerPath({
  jobId,
  jobTitle,
  requiredSkills,
}: CareerPathProps) {
  const [skills, setSkills] = useState<Skill[]>([]);

  const [graphNodes, setGraphNodes] = useState<GraphNode[]>(
    []
  );

  const [graphEdges, setGraphEdges] = useState<GraphEdge[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCareerPath() {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch(
          `/api/career-path?jobId=${encodeURIComponent(jobId)}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Unable to load career path"
          );
        }

        if (cancelled) {
          return;
        }

        setSkills(data.prerequisiteSkills ?? []);

        setGraphNodes(data.graph?.nodes ?? []);

        setGraphEdges(data.graph?.edges ?? []);
      } catch (error) {
        console.error("Career path error:", error);

        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCareerPath();

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  /*
   * Loading
   */
  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Career graph
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            Exploring skill relationships
          </h2>
        </div>

        <LoadingState />
      </div>
    );
  }

  /*
   * Error
   */
  if (error) {
    return (
      <div>
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Career graph
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            Skill relationships
          </h2>
        </div>

        <ErrorState />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Career graph
        </p>

        <h2 className="mt-2 text-2xl font-bold text-slate-900">
          Explore the skill relationships
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Explore how{" "}
          <span className="font-semibold text-slate-700">
            {jobTitle}
          </span>{" "}
          connects to required skills and their prerequisites.
          Every relationship shown below comes directly from
          CognoDB.
        </p>
      </div>

      {/* Graph */}
      {graphNodes.length > 0 && (
        <SkillGraph
          jobTitle={jobTitle}
          nodes={graphNodes}
          edges={graphEdges}
        />
      )}

      {/* Legend */}
      <div className="mt-5 flex flex-wrap gap-5 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-slate-900" />
          Job
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-indigo-100 ring-1 ring-indigo-300" />
          Required skill
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-slate-100 ring-1 ring-slate-300" />
          Prerequisite skill
        </div>
      </div>

      {/* Prerequisite skills */}
      <div className="mt-10">
        <div className="mb-5">
          <h3 className="text-xl font-bold text-slate-900">
            Prerequisite skills
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Skills discovered through multi-hop traversal in
            the career graph.
          </p>
        </div>

        {skills.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-sm font-medium text-slate-600">
              No prerequisite skills found.
            </p>

            <p className="mt-1 text-xs text-slate-400">
              This career path does not currently have
              prerequisite relationships in CognoDB.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((skill) => (
              <SkillBadge
                key={skill.id}
                name={skill.name}
                category={skill.category}
                difficulty={skill.difficulty}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}