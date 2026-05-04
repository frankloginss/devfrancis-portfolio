"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect, type FormEvent } from "react";
import { Mail, Send } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type FormState = "idle" | "submitting" | "success" | "error";

export default function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [formState, setFormState] = useState<FormState>("idle");

  useEffect(() => {
    if (formState !== "success" && formState !== "error") return;
    const timer = setTimeout(() => setFormState("idle"), 4000);
    return () => clearTimeout(timer);
  }, [formState]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState("submitting");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fd.get("name"), email: fd.get("email"), message: fd.get("message") }),
      });
      if (!res.ok) throw new Error();
      setFormState("success");
      (e.target as HTMLFormElement).reset();
    } catch {
      setFormState("error");
    }
  }

  return (
    <section id="contact" className="py-24 px-6 scroll-mt-20">
      <div ref={ref} className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
          <h2 className="text-3xl md:text-4xl font-bold mb-2 text-center">
            Get In <span className="text-primary">Touch</span>
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto mb-6 rounded-full" />
          <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">
            Interested in working together or have a security question? Feel free to reach out.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10">
          <motion.form initial={{ opacity: 0, x: -20 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.2 }} className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-mono text-muted-foreground mb-1">Name</label>
              <Input id="name" name="name" required disabled={formState === "submitting"} placeholder="Your name" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-mono text-muted-foreground mb-1">Email</label>
              <Input id="email" name="email" type="email" required disabled={formState === "submitting"} placeholder="your@email.com" />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-mono text-muted-foreground mb-1">Message</label>
              <Textarea id="message" name="message" rows={4} required disabled={formState === "submitting"} placeholder="Your message..." />
            </div>
            <Button type="submit" disabled={formState === "submitting"} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              {formState === "submitting" ? "Sending..." : "Send Message"}
            </Button>
            {formState === "success" && <p className="text-green-500 text-sm font-mono text-center">Message sent successfully!</p>}
            {formState === "error" && <p className="text-red-500 text-sm font-mono text-center">Something went wrong. Please try again.</p>}
          </motion.form>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.3 }}>
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <a href="mailto:devfrancis04@gmail.com" className="flex items-center gap-4 group" aria-label="Email">
                <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center group-hover:border-primary/30 transition-colors">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-mono">Email</p>
                  <p className="text-sm group-hover:text-primary transition-colors">devfrancis04@gmail.com</p>
                </div>
              </a>
              <a href="https://github.com/frankloginss" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group" aria-label="GitHub">
                <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center group-hover:border-primary/30 transition-colors">
                  <GitHubIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-mono">GitHub</p>
                  <p className="text-sm group-hover:text-primary transition-colors">github.com/frankloginss</p>
                </div>
              </a>
              <a href="https://linkedin.com/in/francisuonyido392b27192" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group" aria-label="LinkedIn">
                <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center group-hover:border-primary/30 transition-colors">
                  <LinkedInIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-mono">LinkedIn</p>
                  <p className="text-sm group-hover:text-primary transition-colors">linkedin.com/in/francisuonyido392b27192</p>
                </div>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
