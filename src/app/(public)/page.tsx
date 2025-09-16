"use client"
import HomePage from "@/src/app/(public)/home-page";
import PublicLayout from "@/src/app/(public)/public-layout";

export default () => {
	return (
		<>
			<PublicLayout>
				<HomePage/>
			</PublicLayout>
		</>
	)
}
