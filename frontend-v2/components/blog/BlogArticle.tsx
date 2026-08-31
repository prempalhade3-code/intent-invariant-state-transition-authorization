import Link from "next/link";
import { BlogIcon } from "./BlogIcon";
import { categoryLabel, getPost } from "@/lib/blog";
import type { BlogBlock, BlogPost } from "@/lib/blog";

function Block({ block }: { block: BlogBlock }) {
  switch (block.type) {
    case "heading":
      return (
        <h2 className="mt-12 mb-4 text-[22px] font-medium leading-[1.25] tracking-[-0.04em] text-[#F4F5F7] first:mt-0 sm:text-[24px]">
          {block.text}
        </h2>
      );
    case "subheading":
      return (
        <h3 className="mt-8 mb-3 text-[17px] font-medium leading-[1.35] tracking-[-0.03em] text-[#F4F5F7]">
          {block.text}
        </h3>
      );
    case "paragraph":
      return (
        <p className="mb-5 text-[16px] leading-[1.75] tracking-[-0.01em] text-white/55">
          {block.text}
        </p>
      );
    case "list":
      return (
        <ul className="mb-5 space-y-3 pl-1">
          {block.items.map((item) => (
            <li
              key={item.slice(0, 40)}
              className="flex gap-3 text-[16px] leading-[1.75] text-white/55"
            >
              <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-[#10B981]/60" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "divider":
      return <hr className="my-10 border-white/[0.08]" />;
    default:
      return null;
  }
}

interface BlogArticleProps {
  post: BlogPost;
}

export function BlogArticle({ post }: BlogArticleProps) {
  const related = (post.related ?? [])
    .map((slug) => getPost(slug))
    .filter(Boolean) as BlogPost[];

  return (
    <article>
      <div className="mb-10 flex items-center justify-center rounded-2xl border border-white/[0.08] bg-[#12141a] py-16">
        <BlogIcon name={post.icon} size="lg" />
      </div>

      <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.12em] text-white/35">
        {categoryLabel(post.category)} ·{" "}
        <span className="text-[#10B981]/80">{post.mark}</span>
      </p>

      <h1 className="mb-6 text-[28px] font-medium leading-[1.15] tracking-[-0.045em] text-[#F4F5F7] sm:text-[36px]">
        {post.title}
      </h1>

      <p className="mb-8 text-[17px] leading-[1.65] text-white/50">
        {post.excerpt}
      </p>

      <hr className="mb-10 border-white/[0.08]" />

      <div className="max-w-none">
        {post.blocks.map((block, i) => (
          <Block key={`${block.type}-${i}`} block={block} />
        ))}
      </div>

      {related.length > 0 && (
        <div className="mt-16 border-t border-white/[0.08] pt-10">
          <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
            Continue reading
          </p>
          <div className="flex flex-col gap-3">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/blog/${r.slug}`}
                className="text-[15px] text-white/50 underline decoration-white/20 underline-offset-4 transition-colors hover:text-[#10B981] hover:decoration-[#10B981]/40"
              >
                {r.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-16 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/[0.08] pt-8">
        <Link
          href="/lab"
          className="text-[14px] text-white/45 underline decoration-white/15 underline-offset-4 transition-colors hover:text-white/70"
        >
          Incident Lab
        </Link>
        <Link
          href="/?try=1"
          className="text-[14px] text-white/45 underline decoration-white/15 underline-offset-4 transition-colors hover:text-white/70"
        >
          Try it
        </Link>
        <Link
          href="/blog"
          className="text-[14px] text-white/45 underline decoration-white/15 underline-offset-4 transition-colors hover:text-white/70"
        >
          All posts
        </Link>
      </div>
    </article>
  );
}
