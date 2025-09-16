import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient()

async function main() {
	// await prisma.postCategory.create({
	// 	data: {
	// 		name: "Technology",
	// 	},
	// })
	// await prisma.postCategory.createMany({
	// 	data: [
	// 		{
	// 			name: "Sports",
	// 		},
	// 		{
	// 			name: "Politics",
	// 		},
	// 	],
	// })
	// const categories = await prisma.postCategory.findMany({})

	// await prisma.post.create({
	// 	data: {
	// 		title: "Hello World 2",
	// 		content: "This is my second post!",
	// 		published: true,
	// 	},
	// })
	// await prisma.post.update({
	// 	where: {
	// 		id: "68bfc552c3217a7374cd9bc3"
	// 	},
	// 	data: {
	// 		categories: {
	// 			connect: categories.map((category) => ({
	// 				id: category.id,
	// 			}))
	// 		}
	// 	}
	// })
	const posts = await prisma.post.findMany({
		include: {
			categories: true,
		}
	})
	// console.log(categories, posts)
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
