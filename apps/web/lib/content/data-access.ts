import { createClient } from "@/lib/supabase/server";

export interface ContentPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  quote: string;
  image_path: string | null;
  published: boolean;
  created_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface GalleryItem {
  id: string;
  title: string | null;
  description: string | null;
  storage_path: string;
  alt_text: string | null;
  published: boolean;
  created_at: string;
}

export interface PublicContent {
  pages: ContentPage[];
  blogPosts: BlogPost[];
  testimonials: Testimonial[];
  faqs: FAQ[];
  galleryItems: GalleryItem[];
}

export async function getPublishedContent(): Promise<PublicContent> {
  const supabase = await createClient();

  const [
    pagesResult,
    blogResult,
    testimonialsResult,
    faqsResult,
    galleryResult,
  ] = await Promise.all([
    supabase
      .from("pages")
      .select("id, slug, title, content, published, created_at, updated_at")
      .eq("published", true)
      .order("created_at", { ascending: true }),

    supabase
      .from("blog_posts")
      .select(
        "id, title, slug, excerpt, content, published, published_at, created_at, updated_at",
      )
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(3),

    supabase
      .from("testimonials")
      .select("id, name, role, quote, image_path, published, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(6),

    supabase
      .from("faqs")
      .select(
        "id, question, answer, display_order, published, created_at, updated_at",
      )
      .eq("published", true)
      .order("display_order", { ascending: true }),

    supabase
      .from("gallery_items")
      .select(
        "id, title, description, storage_path, alt_text, published, created_at",
      )
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  const error =
    pagesResult.error ??
    blogResult.error ??
    testimonialsResult.error ??
    faqsResult.error ??
    galleryResult.error;

  if (error) {
    throw new Error(`Failed to load published content: ${error.message}`);
  }

  return {
    pages: (pagesResult.data ?? []) as ContentPage[],
    blogPosts: (blogResult.data ?? []) as BlogPost[],
    testimonials: (testimonialsResult.data ?? []) as Testimonial[],
    faqs: (faqsResult.data ?? []) as FAQ[],
    galleryItems: (galleryResult.data ?? []) as GalleryItem[],
  };
}
