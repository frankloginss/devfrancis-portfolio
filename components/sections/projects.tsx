"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ExternalLink, Search, Wrench, Bug, FileSearch, Globe } from "lucide-react";
import { GitHubIcon } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { projects } from "@/lib/data";

const categoryIcons: Record<string, React.ReactNode> = {
  "Security Tools": <Wrench className="h-4 w-4" />,
  "Bug Bounty": <Bug className="h-4 w-4" />,
  "Vulnerability Research": <FileSearch className="h-4 w-4" />,
  "Full-Stack": <Globe className="h-4 w-4" />,
};

const filterOptions = [
  { label: "All", value: "all" },
  { label: "Security Tools", value: "Security Tools" },
  { label: "Bug Bounty", value: "Bug Bounty" },
  { label: "Vulnerability Research", value: "Vulnerability Research" },
  { label: "Full-Stack", value: "Full-Stack" },
] as const;

export default function Projects() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = projects.filter((p) => {
    const matchCategory = filter === "all" || p.category === filter;
    const matchSearch =
      search === "" ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.tech.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchCategory && matchSearch;
  });

  return (
    <section id="projects" className="py-24 px-6 bg-muted/30 scroll-mt-20">
      <div ref={ref} className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
          <h2 className="text-3xl md:text-4xl font-bold mb-2 text-center">
            <span className="text-primary">Projects</span> & Research
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto mb-4 rounded-full" />
          <p className="text-muted-foreground text-center mb-8 max-w-xl mx-auto">
            Original security tools, vulnerability research, and bug bounty findings. No writeups, no forks.
          </p>
        </motion.div>

        {/* Filters and search */}
        <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.2 }} className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-mono transition-all duration-200 ${
                  filter === opt.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 font-mono text-sm"
            />
          </div>
        </motion.div>

        {/* Project cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group bg-card border border-border rounded-xl p-6 hover:border-primary/40 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {categoryIcons[project.category]}
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{project.title}</h3>
                </div>
                {project.featured && (
                  <Badge variant="secondary" className="text-xs">Featured</Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">{project.description}</p>
              {project.challenge && (
                <p className="text-xs text-muted-foreground/80 mb-4 italic border-l-2 border-primary/30 pl-3">
                  {project.challenge}
                </p>
              )}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {project.tech.map((t) => (
                  <Badge key={t} variant="outline" className="text-xs font-mono">{t}</Badge>
                ))}
              </div>
              <div className="flex items-center gap-3">
                {project.github && (
                  <a href={project.github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="GitHub">
                    <GitHubIcon className="h-4 w-4" />
                  </a>
                )}
                {project.demo && (
                  <a href={project.demo} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Live demo">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                <span className="text-xs text-muted-foreground font-mono ml-auto">{project.date}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12 font-mono">
            No projects match your search. Building original security tools and research — more coming soon.
          </p>
        )}

        <motion.p initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.5 }} className="text-center text-muted-foreground text-sm mt-8 font-mono">
          Building original security tools and research. More coming soon.
        </motion.p>
      </div>
    </section>
  );
}
