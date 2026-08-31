"use client";

import { motion } from "framer-motion";
import { LandingNav } from "@/components/landing/LandingNav";
import { BlogCard } from "@/components/blog/BlogCard";
import { BlogFeaturedCard } from "@/components/blog/BlogFeaturedCard";
import { getAllPosts, getFeaturedPost } from "@/lib/blog";

const reveal = { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const };

export default function BlogPage() {
  const featured = getFeaturedPost();
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-[#F4F5F7]">
      <LandingNav />

      <main className="mx-auto w-full max-w-[960px] px-4 pb-24 pt-[calc(3.5rem+env(safe-area-inset-top))] sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reveal}
        >
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
            Blog
          </p>
          <h1 className="text-[32px] font-medium leading-[1.1] tracking-[-0.045em] text-[#F4F5F7] sm:text-[40px]">
            Notes from the enclave.
          </h1>
          <p className="mt-4 max-w-[560px] text-[16px] leading-[1.65] tracking-[-0.01em] text-white/50">
            Sealed intent, commit-time verification, and the occasional attack surface, written the way we ship authorization: technical, checkable, no hype.
          </p>
        </motion.div>

        {featured && (
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...reveal, delay: 0.08 }}
          >
            <BlogFeaturedCard post={featured} />
          </motion.div>
        )}

        <motion.div
          className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...reveal, delay: 0.14 }}
        >
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </motion.div>
      </main>
    </div>
  );
}
