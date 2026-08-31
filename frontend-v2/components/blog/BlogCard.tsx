import Link from "next/link";
import { BlogIcon } from "./BlogIcon";
import { categoryLabel } from "@/lib/blog";
import type { BlogPost } from "@/lib/blog";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#12141a] transition-colors duration-300 hover:border-[#10B981]/30 hover:bg-[#161820]"
    >
      <div className="flex flex-1 items-center justify-center border-b border-white/[0.06] bg-[#0A0B0D] px-6 py-10">
        <BlogIcon name={post.icon} size="md" />
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.12em] text-white/35">
          {categoryLabel(post.category)} ·{" "}
          <span className="text-[#10B981]/80">{post.mark}</span>
        </p>
        <h2 className="mb-3 text-[17px] font-medium leading-[1.35] tracking-[-0.03em] text-[#F4F5F7] transition-colors group-hover:text-white sm:text-[18px]">
          {post.title}
        </h2>
        <p className="line-clamp-3 text-[14px] leading-[1.65] text-white/45">
          {post.excerpt}
        </p>
      </div>
    </Link>
  );
}
