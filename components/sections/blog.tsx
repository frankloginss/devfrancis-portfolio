"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Calendar, Clock, ArrowRight, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { blogPosts } from "@/lib/data";

const categoryColors: Record<string, string> = {
  Writeup: "bg-green-500/10 text-green-500",
  Research: "bg-blue-500/10 text-blue-500",
  Tools: "bg-purple-500/10 text-purple-500",
  Methodology: "bg-yellow-500/10 text-yellow-500",
};

const filterOptions = [
  { label: "All", value: "all" },
  { label: "Writeups", value: "Writeup" },
  { label: "Research", value: "Research" },
  { label: "Tools", value: "Tools" },
  { label: "Methodology", value: "Methodology" },
] as const;

export default function Blog() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = blogPosts.filter((post) => {
    const matchCategory = filter === "all" || post.category === filter;
    const matchSearch =
      search === "" ||
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchCategory && matchSearch;
  });

  return (
    <section id="blog" className="py-24 px-6 bg-muted/30 scroll-mt-20">
      <div ref={ref} className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
          <h2 className="text-3xl md:text-4xl font-bold mb-2 text-center">
            <span className="text-primary">Blog</span> & Writeups
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto mb-4 rounded-full" />
          <p className="text-muted-foreground text-center mb-8 max-w-xl mx-auto">
            Security research, methodology deep-dives, and lessons learned from the field.
          </p>
        </motion.div>

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
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 font-mono text-sm"
            />
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group bg-card border border-border rounded-xl p-6 hover:border-primary/40 transition-all duration-300 flex flex-col"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-mono px-2 py-0.5 rounded ${categoryColors[post.category]}`}>
                  {post.category}
                </span>
                <span className="text-xs text-muted-foreground font-mono ml-auto flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {post.readTime}
                </span>
              </div>
              <h3 className="font-bold text-lg group-hover:text-primary transition-colors mb-2">{post.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1">{post.excerpt}</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs font-mono">{tag}</Badge>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {post.date}
                </span>
                {post.url && (
                  <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 font-mono">
                    Read more <ArrowRight className="h-3 w-3" />
                  </a>
                )}
              </div>
            </motion.article>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12 font-mono">
            No posts match your search. Writing new content — check back soon.
          </p>
        )}

        <motion.p initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.5 }} className="text-center text-muted-foreground text-sm mt-8 font-mono">
          New posts coming soon. Stay tuned for security research and writeups.
        </motion.p>
      </div>
    </section>
  );
}
