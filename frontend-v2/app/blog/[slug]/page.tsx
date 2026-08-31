import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LandingNav } from "@/components/landing/LandingNav";
import { BlogArticle } from "@/components/blog/BlogArticle";
import { getPost, getPostSlugs } from "@/lib/blog";

type PageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const post = getPost(params.slug);
  if (!post) return { title: "Notes from the enclave · Sworn" };
  return {
    title: `${post.title} · Sworn`,
    description: post.excerpt,
  };
}

export default function BlogPostPage({ params }: PageProps) {
  const post = getPost(params.slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-[#F4F5F7]">
      <LandingNav />

      <main className="mx-auto w-full max-w-[680px] px-4 pb-24 pt-[calc(3.5rem+env(safe-area-inset-top))] sm:px-8">
        <Link
          href="/blog"
          className="mb-10 inline-block font-mono text-[10px] uppercase tracking-[0.14em] text-white/35 transition-colors hover:text-white/60"
        >
          ← Notes from the enclave
        </Link>
        <BlogArticle post={post} />
      </main>
    </div>
  );
}
