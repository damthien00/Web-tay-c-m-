import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";

const MAX_FILES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB mỗi ảnh

const ALLOWED_TYPES: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
};

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const files = formData.getAll("files");

        if (files.length === 0) {
            return NextResponse.json(
                { error: "Vui lòng chọn ít nhất một ảnh." },
                { status: 400 }
            );
        }

        if (files.length > MAX_FILES) {
            return NextResponse.json(
                { error: `Chỉ được upload tối đa ${MAX_FILES} ảnh mỗi lần.` },
                { status: 400 }
            );
        }

        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });

        const uploadedImages: string[] = [];

        for (const item of files) {
            if (!(item instanceof File)) {
                return NextResponse.json(
                    { error: "Dữ liệu upload không hợp lệ." },
                    { status: 400 }
                );
            }

            const extension = ALLOWED_TYPES[item.type];

            if (!extension) {
                return NextResponse.json(
                    { error: `${item.name}: chỉ chấp nhận JPG, PNG, WEBP hoặc GIF.` },
                    { status: 400 }
                );
            }

            if (item.size <= 0 || item.size > MAX_FILE_SIZE) {
                return NextResponse.json(
                    { error: `${item.name}: ảnh phải có dung lượng dưới 5 MB.` },
                    { status: 400 }
                );
            }

            const bytes = await item.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Kiểm tra chữ ký file thay vì chỉ tin MIME type từ trình duyệt.
            const isValidImage =
                (extension === ".jpg" &&
                    buffer.length >= 3 &&
                    buffer[0] === 0xff &&
                    buffer[1] === 0xd8 &&
                    buffer[2] === 0xff) ||
                (extension === ".png" &&
                    buffer.subarray(0, 8).equals(
                        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
                    )) ||
                (extension === ".webp" &&
                    buffer.toString("ascii", 0, 4) === "RIFF" &&
                    buffer.toString("ascii", 8, 12) === "WEBP") ||
                (extension === ".gif" &&
                    ["GIF87a", "GIF89a"].includes(
                        buffer.toString("ascii", 0, 6)
                    ));

            if (!isValidImage) {
                return NextResponse.json(
                    { error: `${item.name}: nội dung file không phải ảnh hợp lệ.` },
                    { status: 400 }
                );
            }

            const filename = `${randomUUID()}${extension}`;
            const filePath = path.join(uploadDir, filename);

            await writeFile(filePath, buffer);

            uploadedImages.push(`/uploads/${filename}`);
        }

        return NextResponse.json({
            data: uploadedImages,
            error: null,
        });
    } catch (error) {
        console.error("Upload images error:", error);

        return NextResponse.json(
            { error: "Không thể upload ảnh." },
            { status: 500 }
        );
    }
}