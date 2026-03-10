import { ProductCategory } from "../hooks/useQueries";

/** Encode uniformSize and bookClass into the description field */
export function buildDescription(
  description: string,
  uniformSize: string,
  bookClass: string,
): string {
  const parts: string[] = [];
  if (uniformSize.trim()) parts.push(`[SIZE:${uniformSize.trim()}]`);
  if (bookClass.trim()) parts.push(`[CLASS:${bookClass.trim()}]`);
  const meta = parts.join("");
  return meta ? `${meta} ${description}`.trim() : description;
}

/** Parse uniformSize, bookClass, and plain description from encoded description */
export function parseProductMeta(description: string): {
  uniformSize: string;
  bookClass: string;
  description: string;
} {
  let remaining = description;
  let uniformSize = "";
  let bookClass = "";

  const sizeMatch = remaining.match(/\[SIZE:([^\]]+)\]/);
  if (sizeMatch) {
    uniformSize = sizeMatch[1];
    remaining = remaining.replace(sizeMatch[0], "").trim();
  }

  const classMatch = remaining.match(/\[CLASS:([^\]]+)\]/);
  if (classMatch) {
    bookClass = classMatch[1];
    remaining = remaining.replace(classMatch[0], "").trim();
  }

  return { uniformSize, bookClass, description: remaining };
}

export function getCategoryLabel(category: string): string {
  if (category === ProductCategory.books || category === "books")
    return "Books";
  if (
    category === ProductCategory.schoolUniforms ||
    category === "schoolUniforms"
  )
    return "School Uniforms";
  return "Private Books";
}
