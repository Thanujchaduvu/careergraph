"use client";

import { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Position,
} from "reactflow";

import "reactflow/dist/style.css";

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

interface SkillGraphProps {
  jobTitle: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export default function SkillGraph({
  jobTitle,
  nodes: graphNodes,
  edges: graphEdges,
}: SkillGraphProps) {
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    /*
     * Separate nodes by type.
     */
    const jobNodes = graphNodes.filter(
      (node) => node.type === "job"
    );

    const requiredNodes = graphNodes.filter(
      (node) => node.type === "skill"
    );

    const prerequisiteNodes = graphNodes.filter(
      (node) => node.type === "prerequisite"
    );

    /*
     * Job node
     */
    jobNodes.forEach((node) => {
      nodes.push({
        id: node.id,
        position: {
          x: 500,
          y: 40,
        },
        data: {
          label: node.label || jobTitle,
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
        style: {
          background: "#111827",
          color: "#ffffff",
          border: "1px solid #374151",
          borderRadius: "14px",
          padding: "16px 24px",
          fontWeight: 700,
          minWidth: 200,
          textAlign: "center",
        },
      });
    });

    /*
     * Required skills
     */
    requiredNodes.forEach((node, index) => {
      const columns = Math.max(requiredNodes.length, 1);

      const spacing = 900 / columns;

      nodes.push({
        id: node.id,
        position: {
          x: 80 + index * spacing,
          y: 190,
        },
        data: {
          label: node.label,
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
        style: {
          background: "#eef2ff",
          color: "#3730a3",
          border: "1px solid #c7d2fe",
          borderRadius: "12px",
          padding: "12px 18px",
          fontWeight: 600,
          minWidth: 140,
          textAlign: "center",
        },
      });
    });

    /*
     * Prerequisite skills
     */
    prerequisiteNodes.forEach((node, index) => {
      nodes.push({
        id: node.id,
        position: {
          x: 100 + index * 200,
          y: 360,
        },
        data: {
          label: node.label,
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
        style: {
          background: "#f8fafc",
          color: "#334155",
          border: "1px solid #cbd5e1",
          borderRadius: "12px",
          padding: "10px 16px",
          fontWeight: 500,
          minWidth: 130,
          textAlign: "center",
        },
      });
    });

    /*
     * ACTUAL DATABASE EDGES
     */
    graphEdges.forEach((edge) => {
      edges.push({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,

        animated: edge.type === "requires",

        style:
          edge.type === "requires"
            ? {
                strokeWidth: 2,
              }
            : {
                strokeWidth: 1.5,
              },

        labelStyle: {
          fontSize: 10,
          fontWeight: 600,
        },

        labelBgStyle: {
          fill: "#ffffff",
          fillOpacity: 0.9,
        },
      });
    });

    return {
      nodes,
      edges,
    };
  }, [graphNodes, graphEdges, jobTitle]);

  return (
    <div className="h-[560px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{
          padding: 0.2,
        }}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}