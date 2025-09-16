import prisma from "@/src/lib/prisma";
import Link from "next/link";
import {notFound} from "next/navigation";
import type {Metadata} from "next";
import {isMongoId} from "validator";

type PageProps = {
  params: { slug: string }
}

async function getPostOrCategory(slug: string) {
  // Try post by id first if looks like an ObjectId
  if (isMongoId(slug)) {
    const post = await prisma.post.findUnique({
      where: { id: slug },
      include: { categories: true }
    })
    if (post && post.published) return { type: "post" as const, data: post }

    // If not a published post, try category by id
    const categoryById = await prisma.postCategory.findUnique({
      where: { id: slug },
      include: { posts: true },
    })
    if (categoryById) return { type: "category" as const, data: categoryById }
  }

  // Try category by unique name
  const categoryByName = await prisma.postCategory.findUnique({
    where: { name: slug },
    include: { posts: true },
  })
  if (categoryByName) return { type: "category" as const, data: categoryByName }

  // Finally, as a fallback (non-ObjectId) there is no post lookup by slug/title; consider notFound
  return null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const slug = decodeURIComponent(params.slug)
  const res = await getPostOrCategory(slug)
  if (!res) return { title: "Not found" }
  if (res.type === "post") {
    return {
      title: res.data.title,
      description: res.data.content ? res.data.content.replace(/<[^>]*>/g, "").slice(0, 140) : undefined,
    }
  }
  return {
    title: `${res.data.name} – Category`,
    description: `Posts filed under ${res.data.name}`,
  }
}

export default async function Page({ params }: PageProps) {
  const slug = decodeURIComponent(params.slug)
  const res = await getPostOrCategory(slug)
  if (!res) return notFound()

  if (res.type === "post") {
    const post = res.data
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          {post.categories.map((cat) => (
            <Link key={cat.id} href={`/${encodeURIComponent(cat.name)}`} className="rounded bg-secondary px-2 py-0.5 hover:underline">
              {cat.name}
            </Link>
          ))}
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
        <div className="mt-1 text-sm text-muted-foreground">{new Date(post.createdAt).toLocaleString()}</div>
        {post.content ? (
          <article className="prose prose-neutral dark:prose-invert mt-6 max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
        ) : (
          <p className="mt-6 text-muted-foreground">No content.</p>
        )}
        <div className="mt-10">
          <Link href="/" className="text-sm text-primary hover:underline">← Back to home</Link>
        </div>
      </main>
    )
  }

  const category = res.data
  const posts = (category.posts || []).filter(p => p.published)
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{category.name}</h1>
        <p className="text-sm text-muted-foreground">{posts.length} published post{posts.length === 1 ? "" : "s"}</p>
      </div>
      {posts.length === 0 ? (
        <p className="text-muted-foreground">No posts found in this category.</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {posts.map((post) => (
            <li key={post.id} className="rounded-md border p-4 hover:bg-accent/40 transition">
              <Link href={`/${post.id}`} className="font-medium hover:underline">
                {post.title}
              </Link>
              <div className="mt-1 text-xs text-muted-foreground">
                {new Date(post.createdAt).toLocaleDateString()}
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-10">
        <Link href="/" className="text-sm text-primary hover:underline">← Back to home</Link>
      </div>
    </main>
  )
}

export async function generateStaticParams() {
  // Pre-render post IDs and category names (preferred slugs)
  const [posts, categories] = await Promise.all([
    prisma.post.findMany({ select: { id: true, published: true } }),
    prisma.postCategory.findMany({ select: { name: true } }),
  ])

  const postParams = posts.filter(p => p.published).map((p) => ({ slug: p.id }))
  const categoryParams = categories.map((c) => ({ slug: c.name }))

  return [...postParams, ...categoryParams]
}
