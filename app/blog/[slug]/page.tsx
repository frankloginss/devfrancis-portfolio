import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { marked } from "marked";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

export async function generateStaticParams() {
  const blogDir = join(process.cwd(), "public", "blog");
  try {
    const files = readdirSync(blogDir);
    return files.filter((f) => f.endsWith(".md")).map((f) => ({ slug: f.replace(".md", "") }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug.replace(/-/g, " ")} — Francis Onyido`,
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const filePath = join(process.cwd(), "public", "blog", `${slug}.md`);

  let content: string;
  try {
    content = readFileSync(filePath, "utf-8");
  } catch {
    notFound();
  }

  const html = await marked(content);

  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-24 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-mono text-sm mb-12"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to portfolio
          </Link>

          <article
            className="
              prose prose-lg prose-neutral dark:prose-invert
              prose-headings:font-bold prose-headings:tracking-tight
              prose-h1:text-3xl prose-h1:md:text-4xl prose-h1:mb-6
              prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:pb-3 prose-h2:border-b prose-h2:border-border
              prose-h3:text-xl prose-h3:mt-10 prose-h3:mb-4
              prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6
              prose-strong:text-foreground prose-strong:font-semibold
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-card prose-pre:border prose-pre:border-border prose-pre:rounded-xl prose-pre:shadow-sm prose-pre:my-8
              prose-ol:text-muted-foreground prose-ol:pl-6 prose-ol:my-4 prose-ol:space-y-2
              prose-ul:text-muted-foreground prose-ul:pl-6 prose-ul:my-4 prose-ul:space-y-2
              prose-li:marker:text-primary
              prose-blockquote:border-primary prose-blockquote:bg-muted/50 prose-blockquote:rounded-r-lg prose-blockquote:py-2 prose-blockquote:px-4
              prose-hr:border-border prose-hr:my-12
              prose-img:rounded-xl prose-img:border prose-img:border-border
              prose-table:border prose-table:border-border
              prose-th:bg-muted prose-th:px-4 prose-th:py-2
              prose-td:px-4 prose-td:py-2 prose-td:border-t prose-td:border-border
            "
            dangerouslySetInnerHTML={{ __html: html }}
          />

          <div className="mt-16 pt-8 border-t border-border flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-primary hover:underline font-mono text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to portfolio
            </Link>
            <span className="text-xs text-muted-foreground/50 font-mono flex items-center gap-1.5">
              <FileText className="h-3 w-3" />
              Francis Onyido
            </span>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
