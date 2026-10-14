"use client";

import { useMemo, useState } from "react";
import { categories, platforms } from "@/lib/platforms";

export default function PlatformsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filteredPlatforms = useMemo(() => {
    const query = search.trim().toLowerCase();

    return platforms.filter((platform) => {
      const matchesCategory =
        category === "All" || platform.category === category;

      const matchesSearch =
        !query ||
        platform.name.toLowerCase().includes(query) ||
        platform.category.toLowerCase().includes(query) ||
        platform.description.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  return (
    <main className="min-h-screen bg-amber-50 px-4 py-10 text-stone-800 sm:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <header className="mb-10 rounded-3xl bg-[#A67B5B] p-8 text-white shadow-lg sm:p-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-amber-100">
            Career Compass
          </p>

          <h1 className="text-3xl font-bold sm:text-5xl">
            Your Career Platform Guide
          </h1>

          <p className="mt-4 max-w-3xl leading-7 text-amber-50">
            Discover internships, jobs, hackathons, government opportunities,
            open-source projects, and learning programs to develop your skills
            and achieve your career goals.
          </p>
        </header>

        {/* All Career Platforms */}
        <section>
          <p className="text-sm font-semibold uppercase tracking-widest text-[#896345]">
            Explore Opportunities
          </p>

          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
            All Career Platforms
          </h2>

          <p className="mb-6 mt-2 leading-7 text-stone-600">
            Browse opportunities across internships, jobs, hackathons,
            government recruitment, open source, and learning programs.
            Find platforms that match your interests and career goals.
          </p>

          {/* Search and Category Filter */}
          <div className="mb-6 grid gap-4 md:grid-cols-[1fr_300px]">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search platforms, internships, jobs..."
              aria-label="Search platforms"
              className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 outline-none transition focus:border-[#A67B5B] focus:ring-2 focus:ring-amber-100"
            />

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              aria-label="Filter platform category"
              className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 outline-none transition focus:border-[#A67B5B] focus:ring-2 focus:ring-amber-100"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Results Count and Clear Filters */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-stone-600">
              Showing {filteredPlatforms.length} of {platforms.length} platforms
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
              className="rounded-lg border border-amber-300 px-4 py-2 text-sm font-semibold text-[#896345] transition hover:bg-amber-100"
            >
              Clear Filters
            </button>
          </div>

          {/* Empty Search Results */}
          {filteredPlatforms.length === 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-sm">
              <h3 className="text-lg font-bold">
                No matching platforms found.
              </h3>

              <p className="mt-2 text-sm leading-6 text-stone-600">
                Try another search term or select a different category.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                }}
                className="mt-4 rounded-xl bg-[#A67B5B] px-5 py-3 font-semibold text-white transition hover:bg-[#896345]"
              >
                View All Platforms
              </button>
            </div>
          ) : (
            /* Platform Cards */
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPlatforms.map((platform) => (
                <article
                  key={platform.id}
                  className="flex flex-col rounded-2xl border border-amber-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
                >
                  <h3 className="text-lg font-bold text-stone-800">
                    {platform.name}
                  </h3>

                  <span className="mt-3 w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-stone-700">
                    {platform.category}
                  </span>

                  <p className="mt-4 flex-1 text-sm leading-6 text-stone-600">
                    {platform.description}
                  </p>

                  <a
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center justify-center rounded-xl border border-[#A67B5B] px-4 py-3 font-semibold text-[#896345] transition hover:bg-amber-50"
                  >
                    Visit Website ↗
                  </a>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-12 rounded-2xl bg-stone-100 p-5 text-sm leading-6 text-stone-600">
          Explore each platform&apos;s official website for current
          opportunities, application deadlines, eligibility requirements, and
          application details. Always verify the information on the official
          website before applying.
        </footer>
      </div>
    </main>
  );
}
