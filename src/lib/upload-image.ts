export function uploadFile(file: any) {
	if(!file || !process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_URL || !process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) return

	const formData = new FormData();
	formData.append("file", file);
	formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

	return fetch(process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_URL, {
		method: 'POST',
		body: formData,
		redirect: 'follow'
	})
}
