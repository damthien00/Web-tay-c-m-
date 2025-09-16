import ProfileForm from "@/src/app/admin/profile/form";
import {me} from "@/actions/profile/me";

export default async () => {
	const user = await me()
	return (
		<div className={'mx-auto w-full max-w-2xl'}>
			<h1 className={'text-2xl font-semibold mb-6'}>Your Profile</h1>
			<ProfileForm user={user}/>
		</div>
	)
}
