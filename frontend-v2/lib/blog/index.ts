import { BLOG_POSTS } from "./posts";
import type { BlogPost } from "./types";

export type { BlogPost, BlogBlock, BlogCategory, BlogIconName } from "./types";

export function getAllPosts(): BlogPost[] {
  return BLOG_POSTS.filter((p) => !p.featured);
}

export function getFeaturedPost(): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.featured) ?? BLOG_POSTS[0];
}

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getPostSlugs(): string[] {
  return BLOG_POSTS.map((p) => p.slug);
}

export function categoryLabel(category: BlogPost["category"]): string {
  return category;
}
