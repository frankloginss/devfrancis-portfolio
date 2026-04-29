"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ExternalLink, GitFork, BookOpen, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { resources } from "@/lib/data";

const categoryConfig = {
  fork: { icon: GitFork, label: "Useful Forks" },
  reference: { icon: BookOpen, label: "References" },
  learning: { icon: Lightbulb, label: "Learning" },
};

export default function Resources() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const grouped = Object.entries(categoryConfig).map(([key, config]) => ({
    ...config,
    items: resources.filter((r) => r.category === key),
  }));

  return (
    <section className="py-24 px-6 bg-muted/30">
      <div ref={ref} className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
          <h2 className="text-3xl md:text-4xl font-bold mb-2 text-center">
            Resources & <span className="text-primary">References</span>
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto mb-12 rounded-full" />
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {grouped.map((group, i) => (
            <motion.div
              key={group.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-card border border-border rounded-xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <group.icon className="h-5 w-5 text-primary" />
                <h3 className="text-primary font-mono text-sm uppercase tracking-wider">{group.label}</h3>
              </div>
              <div className="space-y-3">
                {group.items.map((item) => (
                  <a
                    key={item.title}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group/item p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium group-hover/item:text-primary transition-colors">{item.title}</span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground group-hover/item:text-primary transition-colors" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                  </a>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
