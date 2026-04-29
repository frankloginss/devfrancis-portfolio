"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { htbBoxes } from "@/lib/data";

const difficultyColor: Record<string, string> = {
  Easy: "bg-green-500/10 text-green-500",
  Medium: "bg-yellow-500/10 text-yellow-500",
  Hard: "bg-red-500/10 text-red-500",
  Insane: "bg-purple-500/10 text-purple-500",
};

export default function Learning() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="learning" className="py-24 px-6 scroll-mt-20">
      <div ref={ref} className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
          <h2 className="text-3xl md:text-4xl font-bold mb-2 text-center">
            Learning & <span className="text-primary">Experience</span>
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto mb-4 rounded-full" />
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            HackTheBox progress and training — methodology and problem-solving, not writeups.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.2 }} className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-primary">{htbBoxes.filter(b => !b.tags.includes("Active")).length}</p>
            <p className="text-xs text-muted-foreground mt-1">Machines Owned</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-primary">{htbBoxes.filter(b => b.difficulty === "Hard").length}</p>
            <p className="text-xs text-muted-foreground mt-1">Hard Machines</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-primary">1</p>
            <p className="text-xs text-muted-foreground mt-1">Academy Paths</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-primary">{htbBoxes.filter(b => b.tags.includes("Active")).length}</p>
            <p className="text-xs text-muted-foreground mt-1">In Progress</p>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {htbBoxes.map((box, i) => (
            <motion.div
              key={box.name}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.03 }}
              className="bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{box.name}</span>
                <span className={`text-xs font-mono px-2 py-0.5 rounded ${difficultyColor[box.difficulty]}`}>
                  {box.difficulty}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {box.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs font-mono">{tag}</Badge>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
