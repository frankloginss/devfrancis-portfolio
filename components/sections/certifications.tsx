"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Award, CheckCircle, Clock, Calendar } from "lucide-react";
import { certifications } from "@/lib/data";
import { Badge } from "@/components/ui/badge";

const statusConfig = {
  earned: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10", label: "Earned" },
  "in-progress": { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10", label: "In Progress" },
  planned: { icon: Calendar, color: "text-muted-foreground", bg: "bg-muted", label: "Planned" },
};

export default function Certifications() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="certifications" className="py-24 px-6 scroll-mt-20">
      <div ref={ref} className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
          <h2 className="text-3xl md:text-4xl font-bold mb-2 text-center">
            Certifi<span className="text-primary">cations</span>
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto mb-12 rounded-full" />
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {certifications.map((cert, i) => {
            const status = statusConfig[cert.status];
            return (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-card border border-border rounded-xl p-8 text-center hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-xl bg-muted border border-border flex items-center justify-center group-hover:border-primary/30 transition-colors">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{cert.fullName}</h3>
                <p className="text-muted-foreground text-sm mb-3">{cert.issuer}</p>
                <Badge className={`${status.bg} ${status.color} border-0 font-mono text-xs`}>
                  <status.icon className="h-3 w-3 mr-1" />
                  {status.label}
                </Badge>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
