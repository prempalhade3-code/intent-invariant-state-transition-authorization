export type BlogCategory = "explainer" | "architecture" | "thesis" | "reference";

export type BlogIconName =
  | "seal"
  | "gap"
  | "flow"
  | "verify"
  | "chain"
  | "shield";

export type BlogBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "subheading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "divider" };

export type BlogPost = {
  slug: string;
  category: BlogCategory;
  mark: string;
  title: string;
  excerpt: string;
  icon: BlogIconName;
  featured?: boolean;
  blocks: BlogBlock[];
  related?: string[];
};
