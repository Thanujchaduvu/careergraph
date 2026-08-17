"use client";

import { useEffect, useState } from "react";
import JobCard, { Job } from "./JobCard";
import LoadingState from "./LoadingState";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";

export default function JobGrid() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadJobs() {
      try {
        setLoading(true);

        const response = await fetch("/api/jobs");

        if (!response.ok) {
          throw new Error("Failed to load jobs");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message);
        }

        setJobs(data.jobs);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadJobs();
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState />;
  }

  if (jobs.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}