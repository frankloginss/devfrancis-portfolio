"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Shield, Code, Bug, Target } from "lucide-react";
import { bio } from "@/lib/data";

const highlights = [
  { icon: Shield, label: "Penetration Testing", value: "3+ yrs" },
  { icon: Bug, label: "Bug Bounty Hunting", value: "Active" },
  { icon: Code, label: "Security Tools Built", value: "5+" },
  { icon: Target, label: "HTB Machines Owned", value: "10+" },
];

export default function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="py-24 px-6 scroll-mt-20">
      <div ref={ref} className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
          <h2 className="text-3xl md:text-4xl font-bold mb-2 text-center">
            About <span className="text-primary">Me</span>
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto mb-12 rounded-full" />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: 0.2 }}>
            <div className="relative">
              <div className="w-64 h-64 rounded-2xl overflow-hidden border border-border">
                <img src={`${process.env.NODE_ENV === "production" ? "/devfrancis-portfolio" : ""}/profile.jpg`} alt="Francis Onyido" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/20 to-chart-1/20 blur-lg -z-10" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: 0.3 }}>
            <p className="text-muted-foreground leading-relaxed mb-4">{bio.summary}</p>
            <div className="grid grid-cols-2 gap-4 mt-6">
              {highlights.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                  className="bg-card border border-border rounded-xl p-4 text-center hover:border-primary/30 transition-colors"
                >
                  <item.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                  <p className="text-xl font-bold text-primary">{item.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
