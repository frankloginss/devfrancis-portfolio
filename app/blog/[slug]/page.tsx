import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { marked } from "marked";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
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
      <main className="min-h-screen pt-24 pb-16 px-6">
        <article
          className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-code:text-primary prose-code:before:content-none prose-code:after:content-none prose-pre:bg-card prose-pre:border prose-pre:border-border"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <div className="max-w-3xl mx-auto mt-12 pt-6 border-t border-border">
          <a
            href="/"
            className="text-primary font-mono text-sm hover:underline"
          >
            &larr; Back to portfolio
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
