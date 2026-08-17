"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import Navbar from "@/components/Navbar";
import SkillBadge from "@/components/SkillBadge";
import CourseCard from "@/components/CourseCard";
import CareerPath from "@/components/CareerPath";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";

interface Skill {
  id: string;
  name: string;
  category: string;
  difficulty: string;
}

interface Company {
  id: string;
  name: string;
  industry: string;
  location: string;
}

interface RelatedJob {
  id: string;
  title: string;
  level: string;
}

interface Job {
  id: string;
  title: string;
  description: string;
  level: string;
  skills: Skill[];
  companies: Company[];
  relatedJobs: RelatedJob[];
}

interface Course {
  id: string;
  title: string;
  platform: string;
  level: string;
  duration: string;
  skills: string[];
}

interface JobDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function JobDetailsPage({
  params,
}: JobDetailsPageProps) {
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);

  const [courses, setCourses] = useState<Course[]>([]);

  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);

  const [error, setError] = useState(false);
  const [coursesError, setCoursesError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      try {
        setLoading(true);
        setCoursesLoading(true);
        setError(false);
        setCoursesError(false);

        const resolvedParams = await params;

        if (cancelled) {
          return;
        }

        const currentJobId = resolvedParams.id;

        setJobId(currentJobId);

        /*
         * Load job details and course recommendations
         * at the same time.
         */
        const [jobResponse, coursesResponse] =
          await Promise.all([
            fetch(`/api/jobs/${currentJobId}`, {
              cache: "no-store",
            }),

            fetch(
              `/api/recommendations?jobId=${encodeURIComponent(
                currentJobId
              )}`,
              {
                cache: "no-store",
              }
            ),
          ]);

        /*
         * JOB RESPONSE
         */
        const jobData = await jobResponse.json();

        if (!jobResponse.ok || !jobData.success) {
          throw new Error(
            jobData.message || "Failed to load job"
          );
        }

        if (!cancelled) {
          setJob(jobData.job);
        }

        /*
         * COURSE RESPONSE
         */
        const coursesData = await coursesResponse.json();

        if (
          !coursesResponse.ok ||
          !coursesData.success
        ) {
          if (!cancelled) {
            setCoursesError(true);
          }
        } else if (!cancelled) {
          setCourses(
            coursesData.recommendations ?? []
          );
        }
      } catch (error) {
        console.error("Job details error:", error);

        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setCoursesLoading(false);
        }
      }
    }

    loadPage();

    return () => {
      cancelled = true;
    };
  }, [params]);

  /*
   * Loading state
   */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <main className="mx-auto max-w-7xl px-6 py-16">
          <LoadingState />
        </main>
      </div>
    );
  }

  /*
   * Error / Job not found
   */
  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <main className="mx-auto max-w-7xl px-6 py-16">
          <ErrorState />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Back navigation */}
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
        >
          ← Back to career paths
        </Link>

        {/* =========================================
            JOB HEADER
        ========================================== */}
        <section className="mt-6 overflow-hidden rounded-3xl bg-slate-950 shadow-xl">
          <div className="relative p-8 sm:p-10">
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl" />

            <div className="relative max-w-3xl">
              <span className="inline-flex rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
                {job.level}
              </span>

              <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                {job.title}
              </h1>

              <p className="mt-5 text-lg leading-8 text-slate-300">
                {job.description}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs text-slate-400">
                    Required skills
                  </p>

                  <p className="mt-1 text-lg font-semibold text-white">
                    {job.skills.length}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs text-slate-400">
                    Related roles
                  </p>

                  <p className="mt-1 text-lg font-semibold text-white">
                    {job.relatedJobs.length}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs text-slate-400">
                    Learning resources
                  </p>

                  <p className="mt-1 text-lg font-semibold text-white">
                    {courses.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            REQUIRED SKILLS
        ========================================== */}
        <section className="mt-12">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              Direct relationships
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Required skills
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Skills directly connected to this job through{" "}
              <span className="font-medium">
                REQUIRES
              </span>{" "}
              relationships.
            </p>
          </div>

          {job.skills.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="text-sm text-slate-500">
                No required skills found.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {job.skills.map((skill) => (
                <SkillBadge
                  key={skill.id}
                  name={skill.name}
                  category={skill.category}
                  difficulty={skill.difficulty}
                />
              ))}
            </div>
          )}
        </section>

        {/* =========================================
            COMPANY
        ========================================== */}
        {job.companies.length > 0 && (
          <section className="mt-12">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                Connected company
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                Opportunities
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {job.companies.map((company) => (
                <div
                  key={company.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">
                        {company.name}
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        {company.industry}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {company.location}
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 font-bold text-indigo-600">
                      C
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* =========================================
            CAREER GRAPH
        ========================================== */}
        {jobId && (
          <section className="mt-16 rounded-3xl border border-indigo-100 bg-indigo-50/50 p-6 sm:p-8">
            <CareerPath
              jobId={jobId}
              jobTitle={job.title}
              requiredSkills={job.skills}
            />
          </section>
        )}

        {/* =========================================
            RECOMMENDED COURSES
        ========================================== */}
        <section className="mt-16">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              Connected learning
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Recommended courses
            </h2>

            <p className="mt-2 max-w-2xl text-slate-500">
              Learning resources discovered by traversing the
              job, skill, prerequisite, and course relationships
              in the graph.
            </p>
          </div>

          {coursesLoading ? (
            <LoadingState />
          ) : coursesError ? (
            <ErrorState />
          ) : courses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                ?
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                No learning resources found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                There are currently no courses connected to
                this career path.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                />
              ))}
            </div>
          )}
        </section>

        {/* =========================================
            RELATED JOBS
        ========================================== */}
        {job.relatedJobs.length > 0 && (
          <section className="mt-16 pb-16">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                Connected roles
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                Related career paths
              </h2>

              <p className="mt-2 text-slate-500">
                Explore other jobs connected to this role.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {job.relatedJobs.map((relatedJob) => (
                <Link
                  key={relatedJob.id}
                  href={`/jobs/${relatedJob.id}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                        {relatedJob.level}
                      </span>

                      <h3 className="mt-2 font-semibold text-slate-900">
                        {relatedJob.title}
                      </h3>
                    </div>

                    <span className="text-lg text-slate-400 transition group-hover:translate-x-1 group-hover:text-indigo-600">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* =========================================
            GRAPH EXPLANATION
        ========================================== */}
        <section className="border-t border-slate-200 py-12">
          <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              How CareerGraph works
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Explore connected career data
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
              CareerGraph uses relationships between jobs, skills,
              prerequisites, companies, and courses to help you
              understand what you need to learn for a particular
              career path.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2 text-sm font-medium">
              <span className="rounded-lg bg-slate-100 px-3 py-2 text-slate-700">
                Job
              </span>

              <span className="text-slate-400">→</span>

              <span className="rounded-lg bg-indigo-50 px-3 py-2 text-indigo-700">
                Skills
              </span>

              <span className="text-slate-400">→</span>

              <span className="rounded-lg bg-slate-100 px-3 py-2 text-slate-700">
                Prerequisites
              </span>

              <span className="text-slate-400">→</span>

              <span className="rounded-lg bg-indigo-50 px-3 py-2 text-indigo-700">
                Courses
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}