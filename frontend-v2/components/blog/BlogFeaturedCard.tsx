import Link from "next/link";
import { BlogIcon } from "./BlogIcon";
import { categoryLabel } from "@/lib/blog";
import type { BlogPost } from "@/lib/blog";

interface BlogFeaturedCardProps {
  post: BlogPost;
}

export function BlogFeaturedCard({ post }: BlogFeaturedCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid overflow-hidden rounded-2xl border border-white/[0.08] bg-[#12141a] transition-colors duration-300 hover:border-[#10B981]/30 md:grid-cols-2"
    >
      <div className="flex items-center justify-center border-b border-white/[0.06] bg-[#0A0B0D] px-8 py-14 md:border-b-0 md:border-r">
        <BlogIcon name={post.icon} size="lg" />
      </div>
      <div className="flex flex-col justify-center p-6 sm:p-8 md:p-10">
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.12em] text-white/35">
          {categoryLabel(post.category)} ·{" "}
          <span className="text-[#10B981]/80">{post.mark}</span>
        </p>
        <h2 className="mb-4 text-[22px] font-medium leading-[1.25] tracking-[-0.04em] text-[#F4F5F7] transition-colors group-hover:text-white sm:text-[26px]">
          {post.title}
        </h2>
        <p className="text-[15px] leading-[1.65] text-white/45">
          {post.excerpt}
        </p>
      </div>
    </Link>
  );
}
