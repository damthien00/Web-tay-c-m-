"use client";

import Link from "next/link";
import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    ChevronRight,
    Clock,
    Facebook,
    Link as LinkIcon,
    Share2,
    Tag,
    User,
} from "lucide-react";
import { Public } from "@prisma/client/runtime/library";
import PublicLayout from "../../public-layout";

type BlogPost = {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    category: string;
    author: string;
    date: string;
    readTime: string;
    image: string;
};


/* ============================================================
   BLOG DATA
============================================================ */

const blogPosts: BlogPost[] = [
    {
        id: 1,
        title: "Top 10 tay cầm chơi game đáng mua nhất năm 2026",
        slug: "top-10-tay-cam-choi-game-dang-mua-2026",
        excerpt:
            "Tổng hợp những mẫu tay cầm chơi game nổi bật với thiết kế đẹp, độ trễ thấp và khả năng tương thích tốt.",
        category: "Gaming",
        author: "TAYCAMGIARE",
        date: "04/10/2026",
        readTime: "8 phút đọc",
        image:
            "https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=1600",
    },
    {
        id: 2,
        title: "GameSir G7 SE có thực sự đáng mua?",
        slug: "gamesir-g7-se-co-dang-mua",
        excerpt:
            "Đánh giá chi tiết GameSir G7 SE về thiết kế, cảm giác cầm, nút bấm và trải nghiệm chơi game.",
        category: "Review",
        author: "TAYCAMGIARE",
        date: "03/10/2026",
        readTime: "6 phút đọc",
        image:
            "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=1200",
    },
    {
        id: 3,
        title: "Cách chọn tay cầm gaming phù hợp với nhu cầu",
        slug: "cach-chon-tay-cam-gaming",
        excerpt:
            "Bạn đang phân vân giữa nhiều mẫu tay cầm? Đây là những tiêu chí quan trọng cần biết trước khi mua.",
        category: "Hướng dẫn",
        author: "TAYCAMGIARE",
        date: "02/10/2026",
        readTime: "7 phút đọc",
        image:
            "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=1200",
    },
    {
        id: 4,
        title: "Flydigi Vader 4 Pro: Có gì đặc biệt?",
        slug: "flydigi-vader-4-pro-co-gi-dac-biet",
        excerpt:
            "Khám phá những tính năng nổi bật giúp Flydigi Vader 4 Pro trở thành một trong những tay cầm được quan tâm nhất.",
        category: "Review",
        author: "TAYCAMGIARE",
        date: "01/10/2026",
        readTime: "5 phút đọc",
        image:
            "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=1200",
    },
];


/* ============================================================
   FIND POST
============================================================ */

function getPost(slug: string) {
    return blogPosts.find(
        (post) => post.slug === slug
    );
}


/* ============================================================
   PAGE
============================================================ */

export default async function BlogDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const post = getPost(slug);

    /* ========================================================
       NOT FOUND
    ======================================================== */

    if (!post) {
        return (
            <main className="min-h-screen bg-gray-50">

                <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-32 text-center">

                    <h1 className="text-6xl font-black text-gray-200">
                        404
                    </h1>

                    <h2 className="mt-4 text-2xl font-bold text-gray-900">
                        Không tìm thấy bài viết
                    </h2>

                    <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                        Bài viết bạn đang tìm kiếm không tồn tại
                        hoặc đã được thay đổi.
                    </p>

                    <Link
                        href="/blog"
                        className="mt-7 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                    >
                        <ArrowLeft size={17} />

                        Quay lại Blog
                    </Link>

                </div>

            </main>
        );
    }


    /* ========================================================
       RELATED POSTS
    ======================================================== */

    const relatedPosts = blogPosts
        .filter(
            (item) =>
                item.id !== post.id &&
                item.category === post.category
        )
        .slice(0, 3);


    return (
        <PublicLayout>
            <main className="min-h-screen bg-gray-50">

                {/* =====================================================
                                BREADCRUMB
                            ====================================================== */}
        
            <div>

                <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-4 text-sm">

                    <a
                        href="/"
                        className="text-gray-500 transition hover:text-blue-600"
                    >
                        Trang chủ
                    </a>
                    
                    <ChevronRight
                        size={15}
                        className="text-gray-400"
                    />

                    <span className="truncate font-medium text-gray-900">
                        Blog
                        </span>

                </div>

            </div>


                {/* =================================================
                    ARTICLE HEADER
                ================================================= */}

                <section className="bg-white">

                    <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">

                        {/* CATEGORY */}

                        <div className="flex items-center gap-3">

                            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600">
                                {post.category}
                            </span>

                            <span className="text-xs text-gray-400">
                                •
                            </span>

                            <span className="flex items-center gap-1.5 text-xs text-gray-500">

                                <Clock size={14} />

                                {post.readTime}

                            </span>

                        </div>


                        {/* TITLE */}

                        <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight text-gray-900 md:text-5xl md:leading-[1.15]">
                            {post.title}
                        </h1>


                        {/* EXCERPT */}

                        <p className="mt-5 max-w-3xl text-base leading-7 text-gray-500 md:text-lg">
                            {post.excerpt}
                        </p>


                        {/* META */}

                        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 border-t pt-5">

                            <div className="flex items-center gap-2">

                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                    <User size={17} />
                                </div>

                                <div>

                                    <p className="text-xs text-gray-400">
                                        Tác giả
                                    </p>

                                    <p className="text-sm font-semibold text-gray-900">
                                        {post.author}
                                    </p>

                                </div>

                            </div>


                            <div className="flex items-center gap-2 text-sm text-gray-500">

                                <CalendarDays size={17} />

                                {post.date}

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    COVER IMAGE
                ================================================= */}

                <section className="mx-auto max-w-6xl px-4">

                    <div className="overflow-hidden rounded-2xl">

                        <img
                            src={post.image}
                            alt={post.title}
                            className="h-[280px] w-full object-cover md:h-[500px]"
                        />

                    </div>

                </section>


                {/* =================================================
                    ARTICLE BODY
                ================================================= */}

                <section className="mx-auto max-w-7xl px-4 py-10 md:py-14">

                    <div className="grid gap-10 lg:grid-cols-[minmax(0,760px)_280px]">

                        {/* =================================================
                            ARTICLE
                        ================================================= */}

                        <article className="min-w-0 rounded-2xl bg-white p-6 shadow-sm md:p-10">

                            {/* INTRO */}

                            <p className="text-lg font-medium leading-8 text-gray-700">
                                Tay cầm gaming ngày càng trở thành một
                                phụ kiện không thể thiếu đối với những
                                người yêu thích game trên PC và console.
                                Không chỉ mang lại cảm giác điều khiển
                                thoải mái, những mẫu tay cầm hiện đại còn
                                được trang bị rất nhiều công nghệ mới.
                            </p>


                            {/* HEADING */}

                            <h2
                                id="tieu-chi"
                                className="mt-10 text-2xl font-black text-gray-900 md:text-3xl"
                            >
                                Những tiêu chí quan trọng khi chọn tay cầm
                            </h2>


                            <p className="mt-5 text-base leading-8 text-gray-600">
                                Trước khi lựa chọn một mẫu tay cầm, bạn
                                nên xác định rõ nhu cầu sử dụng. Nếu bạn
                                thường xuyên chơi các game FPS, độ chính
                                xác của analog và trigger sẽ rất quan
                                trọng.
                            </p>


                            {/* LIST */}

                            <ul className="mt-5 space-y-3 pl-5 text-base leading-7 text-gray-600">

                                <li className="list-disc">
                                    Độ chính xác của cần analog.
                                </li>

                                <li className="list-disc">
                                    Công nghệ Hall Effect chống drift.
                                </li>

                                <li className="list-disc">
                                    Độ trễ khi kết nối.
                                </li>

                                <li className="list-disc">
                                    Thời lượng pin đối với tay cầm không dây.
                                </li>

                                <li className="list-disc">
                                    Khả năng tương thích với PC và console.
                                </li>

                            </ul>


                            {/* IMAGE INSIDE */}

                            <div className="my-8 overflow-hidden rounded-xl">

                                <img
                                    src="https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=1200"
                                    alt="Gaming setup"
                                    className="w-full object-cover"
                                />

                            </div>


                            {/* HEADING */}

                            <h2
                                id="hall-effect"
                                className="mt-10 text-2xl font-black text-gray-900 md:text-3xl"
                            >
                                Hall Effect là gì?
                            </h2>


                            <p className="mt-5 text-base leading-8 text-gray-600">
                                Hall Effect là công nghệ sử dụng cảm biến
                                từ trường để xác định vị trí của cần analog
                                hoặc trigger. So với joystick truyền thống,
                                công nghệ này giúp giảm nguy cơ xảy ra hiện
                                tượng drift sau thời gian dài sử dụng.
                            </p>


                            <div className="my-7 rounded-xl border-l-4 border-blue-600 bg-blue-50 p-5">

                                <p className="text-sm font-medium leading-7 text-blue-900">
                                    💡 <strong>Mẹo:</strong> Nếu bạn chơi
                                    game thường xuyên và muốn sử dụng tay
                                    cầm lâu dài, hãy ưu tiên những sản phẩm
                                    có Hall Effect.
                                </p>

                            </div>


                            {/* HEADING */}

                            <h2
                                id="top-10"
                                className="mt-10 text-2xl font-black text-gray-900 md:text-3xl"
                            >
                                Top những mẫu tay cầm đáng chú ý
                            </h2>


                            <h3 className="mt-7 text-xl font-bold text-gray-900">
                                1. GameSir G7 SE
                            </h3>

                            <p className="mt-3 text-base leading-8 text-gray-600">
                                GameSir G7 SE là một trong những lựa chọn
                                đáng cân nhắc cho người dùng PC và Xbox.
                                Sản phẩm sở hữu thiết kế công thái học,
                                cảm giác cầm chắc tay và sử dụng công nghệ
                                Hall Effect.
                            </p>


                            <h3 className="mt-7 text-xl font-bold text-gray-900">
                                2. Flydigi Vader 4 Pro
                            </h3>

                            <p className="mt-3 text-base leading-8 text-gray-600">
                                Flydigi Vader 4 Pro hướng tới người dùng
                                gaming chuyên nghiệp với nhiều nút phụ,
                                khả năng tùy chỉnh cao và thiết kế phù hợp
                                cho những phiên chơi game kéo dài.
                            </p>


                            <h3 className="mt-7 text-xl font-bold text-gray-900">
                                3. GameSir Cyclone 2
                            </h3>

                            <p className="mt-3 text-base leading-8 text-gray-600">
                                Đây là lựa chọn phù hợp cho người muốn có
                                một mẫu tay cầm hiện đại, dễ sử dụng và có
                                mức giá hợp lý.
                            </p>


                            {/* CONCLUSION */}

                            <h2
                                id="ket-luan"
                                className="mt-10 text-2xl font-black text-gray-900 md:text-3xl"
                            >
                                Kết luận
                            </h2>


                            <p className="mt-5 text-base leading-8 text-gray-600">
                                Việc lựa chọn tay cầm phụ thuộc khá nhiều
                                vào nhu cầu và ngân sách của từng người.
                                Nếu bạn ưu tiên độ bền và độ chính xác,
                                những sản phẩm sử dụng Hall Effect sẽ là
                                lựa chọn rất đáng cân nhắc.
                            </p>


                            {/* TAGS */}

                            <div className="mt-10 border-t pt-6">

                                <div className="flex flex-wrap items-center gap-2">

                                    <Tag
                                        size={17}
                                        className="text-gray-400"
                                    />

                                    <span className="text-sm font-semibold text-gray-500">
                                        Tags:
                                    </span>

                                    <Link
                                        href="/blog?category=Gaming"
                                        className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-600"
                                    >
                                        Gaming
                                    </Link>

                                    <Link
                                        href="/blog?category=Review"
                                        className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-600"
                                    >
                                        Review
                                    </Link>

                                    <Link
                                        href="/blog?category=Công nghệ"
                                        className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-600"
                                    >
                                        Công nghệ
                                    </Link>

                                </div>

                            </div>


                            {/* SHARE */}

                            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t pt-6">

                                <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">

                                    <Share2 size={17} />

                                    Chia sẻ bài viết

                                </span>


                                <div className="flex items-center gap-2">

                                    <button
                                        type="button"
                                        className="flex h-9 w-9 items-center justify-center rounded-full border text-gray-500 transition hover:border-blue-600 hover:text-blue-600"
                                    >
                                        <Facebook size={17} />
                                    </button>


                                    <button
                                        type="button"
                                        className="flex h-9 w-9 items-center justify-center rounded-full border text-gray-500 transition hover:border-blue-600 hover:text-blue-600"
                                    >
                                        <LinkIcon size={17} />
                                    </button>

                                </div>

                            </div>

                        </article>


                        {/* =================================================
                            SIDEBAR
                        ================================================= */}

                        <aside className="hidden lg:block">

                            <div className="sticky top-24 space-y-6">

                                {/* TABLE OF CONTENTS */}

                                <div className="rounded-xl border bg-white p-5">

                                    <h3 className="font-bold text-gray-900">
                                        Nội dung bài viết
                                    </h3>


                                    <nav className="mt-4 space-y-1">

                                        <a
                                            href="#tieu-chi"
                                            className="block rounded-lg px-3 py-2 text-sm text-gray-600 transition hover:bg-blue-50 hover:text-blue-600"
                                        >
                                            Tiêu chí chọn tay cầm
                                        </a>

                                        <a
                                            href="#hall-effect"
                                            className="block rounded-lg px-3 py-2 text-sm text-gray-600 transition hover:bg-blue-50 hover:text-blue-600"
                                        >
                                            Hall Effect là gì?
                                        </a>

                                        <a
                                            href="#top-10"
                                            className="block rounded-lg px-3 py-2 text-sm text-gray-600 transition hover:bg-blue-50 hover:text-blue-600"
                                        >
                                            Những mẫu tay cầm đáng chú ý
                                        </a>

                                        <a
                                            href="#ket-luan"
                                            className="block rounded-lg px-3 py-2 text-sm text-gray-600 transition hover:bg-blue-50 hover:text-blue-600"
                                        >
                                            Kết luận
                                        </a>

                                    </nav>

                                </div>


                                {/* BACK BLOG */}

                                <Link
                                    href="/blog"
                                    className="flex items-center justify-center gap-2 rounded-xl border bg-white px-5 py-3 text-sm font-bold text-gray-700 transition hover:border-blue-500 hover:text-blue-600"
                                >
                                    <ArrowLeft size={17} />

                                    Xem tất cả bài viết

                                </Link>

                            </div>

                        </aside>

                    </div>

                </section>


                {/* =================================================
                    RELATED POSTS
                ================================================= */}

                {relatedPosts.length > 0 && (

                    <section className="border-t bg-white">

                        <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">

                            <div className="flex items-end justify-between gap-4">

                                <div>

                                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                                        Có thể bạn quan tâm
                                    </span>

                                    <h2 className="mt-2 text-2xl font-black text-gray-900 md:text-3xl">
                                        Bài viết liên quan
                                    </h2>

                                </div>


                                <Link
                                    href="/blog"
                                    className="hidden items-center gap-2 text-sm font-bold text-blue-600 sm:flex"
                                >
                                    Xem tất cả

                                    <ArrowRight size={16} />

                                </Link>

                            </div>


                            <div className="mt-7 grid gap-6 md:grid-cols-3">

                                {relatedPosts.map(
                                    (item) => (
                                        <Link
                                            key={item.id}
                                            href={`/blog/${item.slug}`}
                                            className="group overflow-hidden rounded-xl border bg-white transition hover:-translate-y-1 hover:shadow-lg"
                                        >

                                            <div className="aspect-[16/9] overflow-hidden">

                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="
                                                        h-full
                                                        w-full
                                                        object-cover
                                                        transition
                                                        duration-500
                                                        group-hover:scale-105
                                                    "
                                                />

                                            </div>


                                            <div className="p-5">

                                                <div className="text-xs font-bold text-blue-600">
                                                    {item.category}
                                                </div>

                                                <h3 className="mt-2 line-clamp-2 text-lg font-bold leading-6 text-gray-900 transition group-hover:text-blue-600">
                                                    {item.title}
                                                </h3>

                                                <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-500">
                                                    {item.excerpt}
                                                </p>


                                                <div className="mt-4 flex items-center justify-between text-xs text-gray-400">

                                                    <span>
                                                        {item.date}
                                                    </span>

                                                    <span className="flex items-center gap-1">
                                                        Đọc thêm
                                                        <ArrowRight
                                                            size={13}
                                                        />
                                                    </span>

                                                </div>

                                            </div>

                                        </Link>
                                    )
                                )}

                            </div>

                        </div>

                    </section>

                )}

            </main>
        </PublicLayout>
    );
}
