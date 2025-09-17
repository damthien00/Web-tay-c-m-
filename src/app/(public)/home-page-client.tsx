"use client"
import PublicLayout from "@/app/(public)/public-layout";
import HomePage from "@/app/(public)/home-page";

export default function HomePageClient() {
	return (
		<>
			<PublicLayout>
				<HomePage/>
			</PublicLayout>
		</>
	)
}
