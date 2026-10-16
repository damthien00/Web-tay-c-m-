"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
    Search,
    CalendarDays,
    User,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Clock,
    Tag,
    X,
} from "lucide-react";
import PublicLayout from "../public-layout";

/* ============================================================
   TYPE
============================================================ */

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
    featured?: boolean;
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
            "https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=1200",
        featured: true,
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
            "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=1000",
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
            "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=1000",
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
            "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=1000",
    },
    {
        id: 5,
        title: "Hall Effect là gì? Tại sao tay cầm gaming nên có?",
        slug: "hall-effect-la-gi",
        excerpt:
            "Tìm hiểu công nghệ Hall Effect và lý do nó đang trở thành xu hướng trên các mẫu tay cầm gaming hiện nay.",
        category: "Công nghệ",
        author: "TAYCAMGIARE",
        date: "29/09/2026",
        readTime: "6 phút đọc",
        image:
            "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000",
    },
    {
        id: 6,
        title: "5 mẫu bàn phím gaming đáng chú ý",
        slug: "5-mau-ban-phim-gaming-dang-chu-y",
        excerpt:
            "Danh sách những mẫu bàn phím gaming có thiết kế đẹp, switch tốt và phù hợp cho cả chơi game lẫn làm việc.",
        category: "Gaming",
        author: "TAYCAMGIARE",
        date: "28/09/2026",
        readTime: "5 phút đọc",
        image:
            "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1000",
    },
    {
        id: 7,
        title: "Chuột gaming có dây hay không dây tốt hơn?",
        slug: "chuot-gaming-co-day-hay-khong-day",
        excerpt:
            "So sánh ưu nhược điểm của chuột gaming có dây và không dây để giúp bạn lựa chọn dễ dàng hơn.",
        category: "Hướng dẫn",
        author: "TAYCAMGIARE",
        date: "26/09/2026",
        readTime: "5 phút đọc",
        image:
            "https://images.unsplash.com/photo-1527814050087-3793815479db?w=1000",
    },
    {
        id: 8,
        title: "Gaming setup cần những thiết bị gì?",
        slug: "gaming-setup-can-nhung-gi",
        excerpt:
            "Một gaming setup hoàn chỉnh cần những thiết bị nào? Cùng TAYCAMGIARE tìm hiểu từ cơ bản đến nâng cao.",
        category: "Setup",
        author: "TAYCAMGIARE",
        date: "24/09/2026",
        readTime: "8 phút đọc",
        image:
            "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=1000",
    },
    {
        id: 9,
        title: "Cách vệ sinh tay cầm gaming đúng cách",
        slug: "cach-ve-sinh-tay-cam-gaming",
        excerpt:
            "Một số cách vệ sinh và bảo quản tay cầm để thiết bị luôn sạch sẽ và hoạt động ổn định.",
        category: "Hướng dẫn",
        author: "TAYCAMGIARE",
        date: "22/09/2026",
        readTime: "4 phút đọc",
        image:
            "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=1000",
    },
    {
        id: 10,
        title: "Những phụ kiện gaming không nên bỏ qua",
        slug: "phu-kien-gaming-khong-nen-bo-qua",
        excerpt:
            "Các phụ kiện nhỏ nhưng có thể giúp trải nghiệm chơi game của bạn thoải mái và hiệu quả hơn.",
        category: "Phụ kiện",
        author: "TAYCAMGIARE",
        date: "20/09/2026",
        readTime: "5 phút đọc",
        image:
            "https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=1000",
    },
    {
        id: 11,
        title: "GameSir và Flydigi: Nên chọn thương hiệu nào?",
        slug: "gamesir-va-flydigi",
        excerpt:
            "So sánh hai thương hiệu tay cầm gaming phổ biến để tìm ra lựa chọn phù hợp với nhu cầu của bạn.",
        category: "So sánh",
        author: "TAYCAMGIARE",
        date: "18/09/2026",
        readTime: "7 phút đọc",
        image:
            "https://images.unsplash.com/photo-1593118247619-e2d6f056869e?w=1000",
    },
    {
        id: 12,
        title: "Gaming gear: Những xu hướng đáng chú ý",
        slug: "gaming-gear-xu-huong",
        excerpt:
            "Những xu hướng thiết bị gaming đang được nhiều người chơi quan tâm trong thời gian gần đây.",
        category: "Công nghệ",
        author: "TAYCAMGIARE",
        date: "15/09/2026",
        readTime: "6 phút đọc",
        image:
            "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1000",
    },
];


/* ============================================================
   CATEGORIES
============================================================ */

const categories = [
    "Tất cả",
    "Gaming",
    "Review",
    "Hướng dẫn",
    "Công nghệ",
    "Setup",
    "Phụ kiện",
    "So sánh",
];


/* ============================================================
   BLOG PAGE
============================================================ */

export default function BlogPage() {
    const [search, setSearch] = useState("");

    const [category, setCategory] =
        useState("Tất cả");

    const [currentPage, setCurrentPage] =
        useState(1);

    const postsPerPage = 6;


    /* ========================================================
       FILTER
    ======================================================== */

    const filteredPosts = useMemo(() => {

        return blogPosts.filter((post) => {

            const matchSearch =
                post.title
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                post.excerpt
                    .toLowerCase()
                    .includes(search.toLowerCase());

            const matchCategory =
                category === "Tất cả" ||
                post.category === category;

            return matchSearch && matchCategory;
        });

    }, [search, category]);


    /* ========================================================
       PAGINATION
    ======================================================== */

    const totalPages = Math.ceil(
        filteredPosts.length / postsPerPage
    );

    const startIndex =
        (currentPage - 1) * postsPerPage;

    const currentPosts =
        filteredPosts.slice(
            startIndex,
            startIndex + postsPerPage
        );


    /* ========================================================
       CHANGE CATEGORY
    ======================================================== */

    const changeCategory = (value: string) => {
        setCategory(value);
        setCurrentPage(1);
    };


    /* ========================================================
       SEARCH
    ======================================================== */

    const handleSearch = (
        value: string
    ) => {
        setSearch(value);
        setCurrentPage(1);
    };


    /* ========================================================
       RESET
    ======================================================== */

    const resetFilter = () => {
        setSearch("");
        setCategory("Tất cả");
        setCurrentPage(1);
    };


    return (
        <PublicLayout>
        <main className="min-h-screen bg-gray-50">

            {/* =================================================
                HERO / PAGE HEADER
            ================================================= */}



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
                FEATURED POST
            ================================================= */}

            <section className="mx-auto max-w-7xl px-4 pb-8">

                <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

                    <div className="grid md:grid-cols-2">

                        {/* IMAGE */}

                        <Link
                            href={`/blog/${blogPosts[0].slug}`}
                            className="group relative block min-h-[280px] overflow-hidden md:min-h-[390px]"
                        >

                            <img
                                src={blogPosts[0].image}
                                alt={blogPosts[0].title}
                                className="
                                    absolute
                                    inset-0
                                    h-full
                                    w-full
                                    object-cover
                                    transition
                                    duration-700
                                    group-hover:scale-105
                                "
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                            <span className="absolute bottom-5 left-5 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-bold text-white">
                                BÀI VIẾT NỔI BẬT
                            </span>

                        </Link>


                        {/* CONTENT */}

                        <div className="flex flex-col justify-center p-7 md:p-10">

                            <div className="flex items-center gap-3 text-xs font-semibold text-blue-600">

                                <span>
                                    {blogPosts[0].category}
                                </span>

                                <span className="h-1 w-1 rounded-full bg-gray-300" />

                                <span>
                                    {blogPosts[0].readTime}
                                </span>

                            </div>


                            <Link
                                href={`/blog/${blogPosts[0].slug}`}
                                className="mt-3 block text-2xl font-black leading-tight text-gray-900 transition hover:text-blue-600 md:text-3xl"
                            >
                                {blogPosts[0].title}
                            </Link>


                            <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-500">
                                {blogPosts[0].excerpt}
                            </p>


                            <div className="mt-6 flex items-center gap-5 text-xs text-gray-500">

                                <div className="flex items-center gap-2">
                                    <User size={15} />
                                    {blogPosts[0].author}
                                </div>

                                <div className="flex items-center gap-2">
                                    <CalendarDays size={15} />
                                    {blogPosts[0].date}
                                </div>

                            </div>


                            <Link
                                href={`/blog/${blogPosts[0].slug}`}
                                className="mt-7 inline-flex w-fit items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                            >
                                Đọc bài viết

                                <ArrowRight size={16} />

                            </Link>

                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
                BLOG CONTENT
            ================================================= */}

            <section className="mx-auto max-w-7xl px-4 py-10">

                <div className="grid gap-8 lg:grid-cols-[1fr_280px]">

                    {/* =================================================
                        MAIN
                    ================================================= */}

                    <div>

                        {/* TOOLBAR */}

                        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                            <div>

                                <h2 className="text-2xl font-bold text-gray-900">
                                    Bài viết mới nhất
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    {filteredPosts.length} bài viết
                                </p>

                            </div>


                            {/* SEARCH */}

                            <div className="flex h-11 w-full items-center rounded-lg border bg-white px-3 shadow-sm sm:max-w-xs">

                                <Search
                                    size={18}
                                    className="shrink-0 text-gray-400"
                                />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) =>
                                        handleSearch(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Tìm bài viết..."
                                    className="ml-3 w-full bg-transparent text-sm outline-none"
                                />

                                {search && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleSearch("")
                                        }
                                        className="text-gray-400 hover:text-gray-700"
                                    >
                                        <X size={16} />
                                    </button>
                                )}

                            </div>

                        </div>


                        {/* CATEGORY */}

                        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">

                            {categories.map(
                                (item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() =>
                                            changeCategory(
                                                item
                                            )
                                        }
                                        className={`
                                            shrink-0
                                            rounded-full
                                            px-4
                                            py-2
                                            text-sm
                                            font-semibold
                                            transition
                                            ${
                                                category ===
                                                item
                                                    ? "bg-blue-600 text-white"
                                                    : "border bg-white text-gray-600 hover:border-blue-500 hover:text-blue-600"
                                            }
                                        `}
                                    >
                                        {item}
                                    </button>
                                )
                            )}

                        </div>


                        {/* POSTS */}

                        {currentPosts.length > 0 ? (

                            <div className="grid gap-6 sm:grid-cols-2">

                                {currentPosts.map(
                                    (post) => (
                                        <BlogCard
                                            key={post.id}
                                            post={post}
                                        />
                                    )
                                )}

                            </div>

                        ) : (

                            /* EMPTY */

                            <div className="rounded-xl border bg-white px-5 py-20 text-center">

                                <Search
                                    size={35}
                                    className="mx-auto text-gray-300"
                                />

                                <h3 className="mt-4 text-lg font-bold text-gray-900">
                                    Không tìm thấy bài viết
                                </h3>

                                <p className="mt-2 text-sm text-gray-500">
                                    Hãy thử tìm kiếm với từ khóa
                                    khác.
                                </p>

                                <button
                                    type="button"
                                    onClick={resetFilter}
                                    className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                                >
                                    Xóa bộ lọc
                                </button>

                            </div>

                        )}


                        {/* =================================================
                            PAGINATION
                        ================================================== */}

                        {totalPages > 1 && (

                            <div className="mt-10 flex items-center justify-center gap-2">

                                <button
                                    type="button"
                                    disabled={
                                        currentPage === 1
                                    }
                                    onClick={() =>
                                        setCurrentPage(
                                            (page) =>
                                                page - 1
                                        )
                                    }
                                    className="
                                        flex
                                        h-10
                                        w-10
                                        items-center
                                        justify-center
                                        rounded-lg
                                        border
                                        bg-white
                                        text-gray-600
                                        transition
                                        hover:border-blue-500
                                        hover:text-blue-600
                                        disabled:cursor-not-allowed
                                        disabled:opacity-40
                                    "
                                >
                                    <ChevronLeft
                                        size={18}
                                    />
                                </button>


                                {Array.from(
                                    {
                                        length: totalPages,
                                    },
                                    (_, index) =>
                                        index + 1
                                ).map((page) => (

                                    <button
                                        key={page}
                                        type="button"
                                        onClick={() =>
                                            setCurrentPage(
                                                page
                                            )
                                        }
                                        className={`
                                            flex
                                            h-10
                                            min-w-10
                                            items-center
                                            justify-center
                                            rounded-lg
                                            border
                                            px-3
                                            text-sm
                                            font-semibold
                                            ${
                                                currentPage ===
                                                page
                                                    ? "border-blue-600 bg-blue-600 text-white"
                                                    : "bg-white text-gray-600 hover:border-blue-500 hover:text-blue-600"
                                            }
                                        `}
                                    >
                                        {page}
                                    </button>

                                ))}


                                <button
                                    type="button"
                                    disabled={
                                        currentPage ===
                                        totalPages
                                    }
                                    onClick={() =>
                                        setCurrentPage(
                                            (page) =>
                                                page + 1
                                        )
                                    }
                                    className="
                                        flex
                                        h-10
                                        w-10
                                        items-center
                                        justify-center
                                        rounded-lg
                                        border
                                        bg-white
                                        text-gray-600
                                        transition
                                        hover:border-blue-500
                                        hover:text-blue-600
                                        disabled:cursor-not-allowed
                                        disabled:opacity-40
                                    "
                                >
                                    <ChevronRight
                                        size={18}
                                    />
                                </button>

                            </div>

                        )}

                    </div>


                    {/* =================================================
                        SIDEBAR
                    ================================================= */}

                    <aside className="space-y-6">

                        {/* CATEGORY BOX */}

                        <div className="rounded-xl border bg-white p-5">

                            <h3 className="flex items-center gap-2 font-bold text-gray-900">

                                <Tag
                                    size={18}
                                    className="text-blue-600"
                                />

                                Chuyên mục

                            </h3>


                            <div className="mt-4 space-y-1">

                                {categories
                                    .filter(
                                        (item) =>
                                            item !==
                                            "Tất cả"
                                    )
                                    .map(
                                        (item) => (
                                            <button
                                                key={item}
                                                type="button"
                                                onClick={() =>
                                                    changeCategory(
                                                        item
                                                    )
                                                }
                                                className="
                                                    flex
                                                    w-full
                                                    items-center
                                                    justify-between
                                                    rounded-lg
                                                    px-3
                                                    py-2.5
                                                    text-left
                                                    text-sm
                                                    text-gray-600
                                                    transition
                                                    hover:bg-blue-50
                                                    hover:text-blue-600
                                                "
                                            >
                                                <span>
                                                    {item}
                                                </span>

                                                <ArrowRight
                                                    size={14}
                                                />
                                            </button>
                                        )
                                    )}

                            </div>

                        </div>


                        {/* LATEST POSTS */}

                        <div className="rounded-xl border bg-white p-5">

                            <h3 className="font-bold text-gray-900">
                                Bài viết nổi bật
                            </h3>


                            <div className="mt-5 space-y-5">

                                {blogPosts
                                    .slice(0, 4)
                                    .map((post) => (

                                        <Link
                                            key={post.id}
                                            href={`/blog/${post.slug}`}
                                            className="group flex gap-3"
                                        >

                                            <img
                                                src={post.image}
                                                alt={post.title}
                                                className="
                                                    h-20
                                                    w-20
                                                    shrink-0
                                                    rounded-lg
                                                    object-cover
                                                "
                                            />

                                            <div>

                                                <h4 className="line-clamp-2 text-sm font-semibold leading-5 text-gray-900 transition group-hover:text-blue-600">
                                                    {post.title}
                                                </h4>

                                                <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                                                    <Clock
                                                        size={12}
                                                    />

                                                    {post.readTime}
                                                </div>

                                            </div>

                                        </Link>

                                    ))}

                            </div>

                        </div>


                        {/* NEWSLETTER */}

                        <div className="rounded-xl bg-blue-600 p-6 text-white">

                            <h3 className="text-lg font-bold">
                                Nhận tin mới
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-blue-100">
                                Đăng ký để nhận những bài viết
                                và thông tin sản phẩm mới nhất
                                từ TAYCAMGIARE.
                            </p>


                            <div className="mt-5">

                                <input
                                    type="email"
                                    placeholder="Email của bạn"
                                    className="
                                        h-11
                                        w-full
                                        rounded-lg
                                        border-0
                                        bg-white
                                        px-3
                                        text-sm
                                        text-gray-900
                                        outline-none
                                        placeholder:text-gray-400
                                    "
                                />

                                <button
                                    type="button"
                                    className="
                                        mt-2
                                        h-11
                                        w-full
                                        rounded-lg
                                        bg-gray-950
                                        text-sm
                                        font-bold
                                        text-white
                                        transition
                                        hover:bg-gray-900
                                    "
                                >
                                    Đăng ký
                                </button>

                            </div>

                        </div>

                    </aside>

                </div>

            </section>

        </main>
        </PublicLayout>
    );
}


/* ============================================================
   BLOG CARD
============================================================ */

function BlogCard({
    post,
}: {
    post: BlogPost;
}) {
    return (
        <article className="group overflow-hidden rounded-xl border bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl">

            {/* IMAGE */}

            <Link
                href={`/blog/${post.slug}`}
                className="relative block aspect-[16/9] overflow-hidden"
            >

                <img
                    src={post.image}
                    alt={post.title}
                    className="
                        h-full
                        w-full
                        object-cover
                        transition
                        duration-500
                        group-hover:scale-105
                    "
                />

                <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-blue-600 shadow-sm">
                    {post.category}
                </span>

            </Link>


            {/* CONTENT */}

            <div className="p-5">

                {/* META */}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-400">

                    <span className="flex items-center gap-1.5">
                        <CalendarDays size={13} />
                        {post.date}
                    </span>

                    <span className="flex items-center gap-1.5">
                        <Clock size={13} />
                        {post.readTime}
                    </span>

                </div>


                {/* TITLE */}

                <Link
                    href={`/blog/${post.slug}`}
                    className="
                        mt-3
                        block
                        line-clamp-2
                        text-lg
                        font-bold
                        leading-6
                        text-gray-900
                        transition
                        hover:text-blue-600
                    "
                >
                    {post.title}
                </Link>


                {/* EXCERPT */}

                <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-500">
                    {post.excerpt}
                </p>


                {/* FOOTER */}

                <div className="mt-5 flex items-center justify-between border-t pt-4">

                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">

                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                            <User size={13} />
                        </div>

                        {post.author}

                    </div>


                    <Link
                        href={`/blog/${post.slug}`}
                        className="flex items-center gap-1 text-xs font-bold text-blue-600"
                    >
                        Đọc thêm
                        <ArrowRight size={14} />
                    </Link>

                </div>

            </div>

        </article>
    );
}