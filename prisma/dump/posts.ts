import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient()

async function main() {
	// Clear existing data
	await prisma.postCategory.deleteMany({})
	await prisma.post.deleteMany({})

	// 1) Create Post Categories
	const categoryData = [
		{ name: "Technology" },
		{ name: "Sports" },
		{ name: "Politics" },
		{ name: "Health" },
		{ name: "Travel" },
		{ name: "Entertainment" },
	];

	await prisma.postCategory.createMany({
		data: categoryData,
	});

	// 2) Fetch categories and map by name
	const categories = await prisma.postCategory.findMany({});
	const byName = new Map(categories.map(c => [c.name, c.id]));

	// 3) Posts to create, each with category names
	const postsToCreate = [
		{
			title: "The State of Web Frameworks in 2025",
			content: "A deep dive into React 19, Server Components, and beyond.",
			published: true,
			categoryNames: ["Technology"],
		},
		{
			title: "Premier League Opening Weekend Recap",
			content: "Top moments, surprising results, and standout players.",
			published: true,
			categoryNames: ["Sports"],
		},
		{
			title: "Global Elections: What to Watch",
			content: "Key races, polling trends, and geopolitical implications.",
			published: false,
			categoryNames: ["Politics"],
		},
		{
			title: "10 Habits for Better Sleep",
			content: "Simple, science-backed tips to improve your rest.",
			published: true,
			categoryNames: ["Health"],
		},
		{
			title: "Backpacking Through Patagonia",
			content: "Routes, gear, and safety tips for an unforgettable trip.",
			published: true,
			categoryNames: ["Travel"],
		},
		{
			title: "AI in Movies: Fact vs. Fiction",
			content: "How films portray artificial intelligence compared to reality.",
			published: true,
			categoryNames: ["Entertainment", "Technology"],
		},
		{
			title: "The Politics of Healthcare",
			content: "Policy debates, costs, and paths to reform.",
			published: false,
			categoryNames: ["Politics", "Health"],
		},
	];

	for (const post of postsToCreate) {
		const connectCategories = post.categoryNames
		.map((name) => byName.get(name))
		.filter((id): id is string => Boolean(id))
		.map((id) => ({ id }));

		const mainCategoryId = connectCategories[0]?.id || null;

		await prisma.post.create({
			data: {
				title: post.title,
				content: post.content,
				published: post.published,
				mainCategoryId: mainCategoryId,
				categories: {
					connect: connectCategories,
				},
			},
		});
	}

	// 4) Print result with categories
	const posts = await prisma.post.findMany({
		include: {
			categories: true,
		}
	})
	console.log(JSON.stringify(posts, null, 2))
}

main()
.then(async () => {
	await prisma.$disconnect()
})
.catch(async (e) => {
	console.error(e)
	await prisma.$disconnect()
	process.exit(1)
})
