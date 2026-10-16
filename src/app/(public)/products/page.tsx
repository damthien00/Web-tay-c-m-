"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
    Search,
    SlidersHorizontal,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ShoppingCart,
    Heart,
    Star,
    X,
    RotateCcw,
} from "lucide-react";
import { Public } from "@prisma/client/runtime/library";
import PublicLayout from "../public-layout";

/* ============================================================
   TYPE
============================================================ */

type Product = {
    id: number;
    name: string;
    slug: string;
    category: string;
    brand: string;
    price: number;
    oldPrice?: number;
    rating: number;
    reviews: number;
    image: string;
    isNew?: boolean;
    isBestSeller?: boolean;
    stock: number;
};


/* ============================================================
   MOCK PRODUCTS
============================================================ */

const products: Product[] = [
    {
        id: 1,
        name: "Flydigi Vader 4 Pro",
        slug: "flydigi-vader-4-pro",
        category: "Tay cầm",
        brand: "Flydigi",
        price: 1490000,
        oldPrice: 1690000,
        rating: 4.9,
        reviews: 128,
        image: "https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=800",
        isBestSeller: true,
        stock: 20,
    },
    {
        id: 2,
        name: "GameSir G7 SE",
        slug: "gamesir-g7-se",
        category: "Tay cầm",
        brand: "GameSir",
        price: 1190000,
        oldPrice: 1390000,
        rating: 4.8,
        reviews: 96,
        image: "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=800",
        isBestSeller: true,
        stock: 15,
    },
    {
        id: 3,
        name: "GameSir T7 Wired",
        slug: "gamesir-t7-wired",
        category: "Tay cầm",
        brand: "GameSir",
        price: 690000,
        rating: 4.7,
        reviews: 65,
        image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800",
        stock: 32,
    },
    {
        id: 4,
        name: "Flydigi Apex 4",
        slug: "flydigi-apex-4",
        category: "Tay cầm",
        brand: "Flydigi",
        price: 1990000,
        oldPrice: 2190000,
        rating: 4.9,
        reviews: 84,
        image: "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800",
        isNew: true,
        stock: 8,
    },
    {
        id: 5,
        name: "GameSir Cyclone 2",
        slug: "gamesir-cyclone-2",
        category: "Tay cầm",
        brand: "GameSir",
        price: 890000,
        rating: 4.6,
        reviews: 42,
        image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800",
        stock: 25,
    },
    {
        id: 6,
        name: "Flydigi Direwolf 3",
        slug: "flydigi-direwolf-3",
        category: "Tay cầm",
        brand: "Flydigi",
        price: 790000,
        oldPrice: 890000,
        rating: 4.6,
        reviews: 37,
        image: "https://images.unsplash.com/photo-1593118247619-e2d6f056869e?w=800",
        stock: 18,
    },
    {
        id: 7,
        name: "Keychron K2 Wireless",
        slug: "keychron-k2-wireless",
        category: "Bàn phím",
        brand: "Keychron",
        price: 1590000,
        oldPrice: 1790000,
        rating: 4.8,
        reviews: 153,
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800",
        isBestSeller: true,
        stock: 12,
    },
    {
        id: 8,
        name: "Logitech G Pro X Superlight",
        slug: "logitech-g-pro-x-superlight",
        category: "Chuột",
        brand: "Logitech",
        price: 2390000,
        oldPrice: 2690000,
        rating: 4.9,
        reviews: 214,
        image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=800",
        isBestSeller: true,
        stock: 10,
    },
    {
        id: 9,
        name: "Razer DeathAdder V3",
        slug: "razer-deathadder-v3",
        category: "Chuột",
        brand: "Razer",
        price: 1890000,
        rating: 4.8,
        reviews: 112,
        image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800",
        isNew: true,
        stock: 16,
    },
    {
        id: 10,
        name: "HyperX Cloud III",
        slug: "hyperx-cloud-iii",
        category: "Tai nghe",
        brand: "HyperX",
        price: 1990000,
        oldPrice: 2290000,
        rating: 4.8,
        reviews: 87,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
        stock: 14,
    },
    {
        id: 11,
        name: "Sony INZONE H5",
        slug: "sony-inzone-h5",
        category: "Tai nghe",
        brand: "Sony",
        price: 2490000,
        rating: 4.7,
        reviews: 54,
        image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800",
        isNew: true,
        stock: 0,
    },
    {
        id: 12,
        name: "LG UltraGear 27GS60F",
        slug: "lg-ultragear-27gs60f",
        category: "Màn hình",
        brand: "LG",
        price: 4290000,
        oldPrice: 4690000,
        rating: 4.8,
        reviews: 76,
        image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800",
        stock: 7,
    },
];


/* ============================================================
   CONSTANTS
============================================================ */

const categories = [
    "Tất cả",
    "Tay cầm",
    "Bàn phím",
    "Chuột",
    "Tai nghe",
    "Màn hình",
];

const brands = [
    "Flydigi",
    "GameSir",
    "Keychron",
    "Logitech",
    "Razer",
    "HyperX",
    "Sony",
    "LG",
];

const priceRanges = [
    {
        label: "Tất cả mức giá",
        min: 0,
        max: Infinity,
    },
    {
        label: "Dưới 1 triệu",
        min: 0,
        max: 1000000,
    },
    {
        label: "1 - 2 triệu",
        min: 1000000,
        max: 2000000,
    },
    {
        label: "2 - 5 triệu",
        min: 2000000,
        max: 5000000,
    },
    {
        label: "Trên 5 triệu",
        min: 5000000,
        max: Infinity,
    },
];


/* ============================================================
   FORMAT PRICE
============================================================ */

function formatPrice(price: number) {
    return new Intl.NumberFormat("vi-VN").format(price) + "₫";
}


/* ============================================================
   PRODUCT PAGE
============================================================ */

export default function ProductsPage() {

    /* ---------------------------------------------------------
       FILTER STATE
    --------------------------------------------------------- */

    const [search, setSearch] = useState("");

    const [category, setCategory] =
        useState("Tất cả");

    const [selectedBrands, setSelectedBrands] =
        useState<string[]>([]);

    const [priceRange, setPriceRange] =
        useState(priceRanges[0]);

    const [sort, setSort] =
        useState("default");

    const [currentPage, setCurrentPage] =
        useState(1);

    const [showMobileFilter, setShowMobileFilter] =
        useState(false);

    const productsPerPage = 8;


    /* ---------------------------------------------------------
       BRAND FILTER
    --------------------------------------------------------- */

    const toggleBrand = (brand: string) => {
        setCurrentPage(1);

        setSelectedBrands((prev) => {
            if (prev.includes(brand)) {
                return prev.filter(
                    (item) => item !== brand
                );
            }

            return [...prev, brand];
        });
    };


    /* ---------------------------------------------------------
       RESET
    --------------------------------------------------------- */

    const resetFilters = () => {
        setSearch("");
        setCategory("Tất cả");
        setSelectedBrands([]);
        setPriceRange(priceRanges[0]);
        setSort("default");
        setCurrentPage(1);
    };


    /* ---------------------------------------------------------
       FILTER PRODUCTS
    --------------------------------------------------------- */

    const filteredProducts = useMemo(() => {

        let result = products.filter((product) => {

            /* Search */
            const matchSearch =
                product.name
                    .toLowerCase()
                    .includes(search.toLowerCase());

            /* Category */
            const matchCategory =
                category === "Tất cả" ||
                product.category === category;

            /* Brand */
            const matchBrand =
                selectedBrands.length === 0 ||
                selectedBrands.includes(product.brand);

            /* Price */
            const matchPrice =
                product.price >= priceRange.min &&
                product.price <= priceRange.max;

            return (
                matchSearch &&
                matchCategory &&
                matchBrand &&
                matchPrice
            );
        });


        /* -----------------------------------------------------
           SORT
        ----------------------------------------------------- */

        if (sort === "price-asc") {
            result.sort(
                (a, b) => a.price - b.price
            );
        }

        if (sort === "price-desc") {
            result.sort(
                (a, b) => b.price - a.price
            );
        }

        if (sort === "rating") {
            result.sort(
                (a, b) => b.rating - a.rating
            );
        }

        if (sort === "newest") {
            result.sort(
                (a, b) => b.id - a.id
            );
        }

        return result;

    }, [
        search,
        category,
        selectedBrands,
        priceRange,
        sort,
    ]);


    /* ---------------------------------------------------------
       PAGINATION
    --------------------------------------------------------- */

    const totalPages =
        Math.ceil(
            filteredProducts.length /
                productsPerPage
        );

    const startIndex =
        (currentPage - 1) *
        productsPerPage;

    const currentProducts =
        filteredProducts.slice(
            startIndex,
            startIndex + productsPerPage
        );


    /* ---------------------------------------------------------
       CHANGE PAGE
    --------------------------------------------------------- */

    const changePage = (page: number) => {

        if (
            page < 1 ||
            page > totalPages
        ) {
            return;
        }

        setCurrentPage(page);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };


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
                
                                            <a
                                                href="/products"
                                                className="text-gray-500 transition hover:text-blue-600"
                                            >
                                                Sản phẩm
                                            </a>
                                            <span className="truncate font-medium text-gray-900">
                                            </span>
                
                                        </div>
                
                                    </div>
                
                


                {/* =================================================
                    CONTENT
                ================================================== */}

                <div className="mx-auto max-w-7xl px-4 pb-8">

                    {/* Mobile filter button */}
                    <button
                        type="button"
                        onClick={() =>
                            setShowMobileFilter(true)
                        }
                        className="
                            mb-5
                            flex
                            w-full
                            items-center
                            justify-center
                            gap-2
                            rounded-lg
                            border
                            bg-white
                            px-4
                            py-3
                            text-sm
                            font-semibold
                            text-gray-700
                            md:hidden
                        "
                    >
                        <SlidersHorizontal size={18} />
                        Bộ lọc sản phẩm
                    </button>


                    <div className="grid grid-cols-1 gap-8 md:grid-cols-[250px_1fr]">

                        {/* =================================================
                            SIDEBAR
                        ================================================== */}

                        <aside
                            className={`
                                ${
                                    showMobileFilter
                                        ? "fixed inset-0 z-[100] block"
                                        : "hidden"
                                }
                                md:static
                                md:block
                            `}
                        >

                            {/* Mobile overlay */}
                            <div
                                className="
                                    absolute
                                    inset-0
                                    bg-black/40
                                    md:hidden
                                "
                                onClick={() =>
                                    setShowMobileFilter(false)
                                }
                            />

                            <div
                                className="
                                    relative
                                    ml-auto
                                    h-full
                                    w-[310px]
                                    overflow-y-auto
                                    bg-white
                                    p-5
                                    md:h-auto
                                    md:w-auto
                                    md:bg-transparent
                                    md:p-0
                                "
                            >

                                {/* Mobile header */}
                                <div className="mb-5 flex items-center justify-between md:hidden">
                                    <h2 className="font-bold">
                                        Bộ lọc
                                    </h2>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowMobileFilter(false)
                                        }
                                    >
                                        <X size={22} />
                                    </button>
                                </div>


                                {/* FILTER CARD */}
                                <div className="rounded-xl border bg-white">

                                    {/* Filter header */}
                                    <div className="flex items-center justify-between border-b p-5">
                                        <h2 className="font-bold text-gray-900">
                                            Bộ lọc
                                        </h2>

                                        <button
                                            type="button"
                                            onClick={resetFilters}
                                            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                                        >
                                            <RotateCcw size={13} />
                                            Xóa lọc
                                        </button>
                                    </div>


                                    <div className="p-5">

                                        {/* CATEGORY */}
                                        <FilterSection title="Danh mục">

                                            <div className="space-y-2">

                                                {categories.map(
                                                    (item) => (
                                                        <button
                                                            key={item}
                                                            type="button"
                                                            onClick={() => {
                                                                setCategory(item);
                                                                setCurrentPage(1);
                                                            }}
                                                            className={`
                                                                flex
                                                                w-full
                                                                items-center
                                                                justify-between
                                                                rounded-md
                                                                px-3
                                                                py-2
                                                                text-left
                                                                text-sm
                                                                transition
                                                                ${
                                                                    category === item
                                                                        ? "bg-blue-50 font-semibold text-blue-600"
                                                                        : "text-gray-600 hover:bg-gray-50"
                                                                }
                                                            `}
                                                        >
                                                            <span>
                                                                {item}
                                                            </span>

                                                            {category === item && (
                                                                <span>
                                                                    ✓
                                                                </span>
                                                            )}
                                                        </button>
                                                    )
                                                )}

                                            </div>

                                        </FilterSection>


                                        {/* BRAND */}
                                        <FilterSection title="Thương hiệu">

                                            <div className="space-y-3">

                                                {brands.map(
                                                    (brand) => (
                                                        <label
                                                            key={brand}
                                                            className="flex cursor-pointer items-center gap-3 text-sm text-gray-600"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedBrands.includes(
                                                                    brand
                                                                )}
                                                                onChange={() =>
                                                                    toggleBrand(
                                                                        brand
                                                                    )
                                                                }
                                                                className="
                                                                    h-4
                                                                    w-4
                                                                    rounded
                                                                    border-gray-300
                                                                    text-blue-600
                                                                    focus:ring-blue-500
                                                                "
                                                            />

                                                            {brand}
                                                        </label>
                                                    )
                                                )}

                                            </div>

                                        </FilterSection>


                                        {/* PRICE */}
                                        <FilterSection title="Khoảng giá">

                                            <div className="space-y-2">

                                                {priceRanges.map(
                                                    (range) => (
                                                        <label
                                                            key={range.label}
                                                            className="flex cursor-pointer items-center gap-3 text-sm text-gray-600"
                                                        >
                                                            <input
                                                                type="radio"
                                                                name="price"
                                                                checked={
                                                                    priceRange.label ===
                                                                    range.label
                                                                }
                                                                onChange={() => {
                                                                    setPriceRange(
                                                                        range
                                                                    );
                                                                    setCurrentPage(
                                                                        1
                                                                    );
                                                                }}
                                                                className="
                                                                    h-4
                                                                    w-4
                                                                    border-gray-300
                                                                    text-blue-600
                                                                    focus:ring-blue-500
                                                                "
                                                            />

                                                            {range.label}
                                                        </label>
                                                    )
                                                )}

                                            </div>

                                        </FilterSection>

                                    </div>
                                </div>

                            </div>
                        </aside>


                        {/* =================================================
                            PRODUCTS
                        ================================================== */}

                        <section>

                            {/* TOP TOOLBAR */}
                            <div className="mb-5 flex flex-col gap-4 rounded-xl border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Tìm thấy{" "}
                                        <span className="font-semibold text-gray-900">
                                            {filteredProducts.length}
                                        </span>{" "}
                                        sản phẩm
                                    </p>
                                </div>


                                {/* Search */}
                                <div className="flex flex-1 sm:max-w-md">

                                    <div className="flex w-full items-center rounded-lg border bg-gray-50 px-3 focus-within:border-blue-500 focus-within:bg-white">

                                        <Search
                                            size={17}
                                            className="text-gray-400"
                                        />

                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) => {
                                                setSearch(
                                                    e.target.value
                                                );
                                                setCurrentPage(1);
                                            }}
                                            placeholder="Tìm kiếm sản phẩm..."
                                            className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
                                        />

                                    </div>

                                </div>


                                {/* Sort */}
                                <div className="relative shrink-0">

                                    <select
                                        value={sort}
                                        onChange={(e) => {
                                            setSort(
                                                e.target.value
                                            );
                                            setCurrentPage(1);
                                        }}
                                        className="
                                            h-10
                                            appearance-none
                                            rounded-lg
                                            border
                                            bg-white
                                            pl-3
                                            pr-9
                                            text-sm
                                            outline-none
                                            focus:border-blue-500
                                        "
                                    >
                                        <option value="default">
                                            Sắp xếp
                                        </option>

                                        <option value="newest">
                                            Mới nhất
                                        </option>

                                        <option value="price-asc">
                                            Giá thấp → cao
                                        </option>

                                        <option value="price-desc">
                                            Giá cao → thấp
                                        </option>

                                        <option value="rating">
                                            Đánh giá cao
                                        </option>
                                    </select>

                                    <ChevronDown
                                        size={15}
                                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                    />

                                </div>

                            </div>


                            {/* ACTIVE FILTERS */}
                            {(category !== "Tất cả" ||
                                selectedBrands.length > 0 ||
                                priceRange.label !==
                                    "Tất cả mức giá" ||
                                search) && (

                                <div className="mb-5 flex flex-wrap items-center gap-2">

                                    <span className="text-xs font-medium text-gray-500">
                                        Đang lọc:
                                    </span>

                                    {category !== "Tất cả" && (
                                        <FilterTag
                                            label={category}
                                            onRemove={() =>
                                                setCategory(
                                                    "Tất cả"
                                                )
                                            }
                                        />
                                    )}

                                    {selectedBrands.map(
                                        (brand) => (
                                            <FilterTag
                                                key={brand}
                                                label={brand}
                                                onRemove={() =>
                                                    toggleBrand(
                                                        brand
                                                    )
                                                }
                                            />
                                        )
                                    )}

                                    {priceRange.label !==
                                        "Tất cả mức giá" && (
                                        <FilterTag
                                            label={
                                                priceRange.label
                                            }
                                            onRemove={() =>
                                                setPriceRange(
                                                    priceRanges[0]
                                                )
                                            }
                                        />
                                    )}

                                    {search && (
                                        <FilterTag
                                            label={`"${search}"`}
                                            onRemove={() =>
                                                setSearch("")
                                            }
                                        />
                                    )}

                                </div>
                            )}


                            {/* PRODUCT GRID */}

                            {currentProducts.length > 0 ? (

                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                                    {currentProducts.map(
                                        (product) => (
                                            <ProductCard
                                                key={product.id}
                                                product={product}
                                            />
                                        )
                                    )}

                                </div>

                            ) : (

                                /* EMPTY */
                                <div className="rounded-xl border bg-white py-20 text-center">

                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                        <Search
                                            size={28}
                                            className="text-gray-400"
                                        />
                                    </div>

                                    <h3 className="mt-5 text-lg font-bold text-gray-900">
                                        Không tìm thấy sản phẩm
                                    </h3>

                                    <p className="mt-2 text-sm text-gray-500">
                                        Hãy thử thay đổi bộ lọc hoặc
                                        từ khóa tìm kiếm.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={resetFilters}
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

                                    {/* Previous */}
                                    <button
                                        type="button"
                                        disabled={
                                            currentPage === 1
                                        }
                                        onClick={() =>
                                            changePage(
                                                currentPage - 1
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


                                    {/* Pages */}
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
                                                changePage(
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
                                                font-medium
                                                transition
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


                                    {/* Next */}
                                    <button
                                        type="button"
                                        disabled={
                                            currentPage ===
                                            totalPages
                                        }
                                        onClick={() =>
                                            changePage(
                                                currentPage + 1
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

                        </section>

                    </div>
                </div>
            </main>
        </PublicLayout>
    );
}


/* ============================================================
   FILTER SECTION
============================================================ */

function FilterSection({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="border-b py-5 first:pt-0 last:border-b-0">

            <h3 className="mb-4 text-sm font-bold text-gray-900">
                {title}
            </h3>

            {children}

        </div>
    );
}


/* ============================================================
   FILTER TAG
============================================================ */

function FilterTag({
    label,
    onRemove,
}: {
    label: string;
    onRemove: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onRemove}
            className="
                flex
                items-center
                gap-1.5
                rounded-full
                bg-blue-50
                px-3
                py-1.5
                text-xs
                font-medium
                text-blue-600
                transition
                hover:bg-blue-100
            "
        >
            {label}

            <X size={13} />
        </button>
    );
}


/* ============================================================
   PRODUCT CARD
============================================================ */

function ProductCard({
    product,
}: {
    product: Product;
}) {
    const discount =
        product.oldPrice
            ? Math.round(
                  ((product.oldPrice -
                      product.price) /
                      product.oldPrice) *
                      100
              )
            : 0;

    return (
        <article className="group relative overflow-hidden rounded-xl border bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl">

            {/* Image */}
            <div className="relative aspect-square overflow-hidden bg-gray-100">

                <Link
                    href={`/products/${product.slug}`}
                    className="block h-full"
                >
                    <img
                        src={product.image}
                        alt={product.name}
                        className="
                            h-full
                            w-full
                            object-cover
                            transition
                            duration-500
                            group-hover:scale-105
                        "
                    />
                </Link>


                {/* Discount */}
                {discount > 0 && (
                    <span className="absolute left-3 top-3 rounded-md bg-red-500 px-2 py-1 text-xs font-bold text-white">
                        -{discount}%
                    </span>
                )}


                {/* New */}
                {product.isNew && (
                    <span className="absolute left-3 top-3 rounded-md bg-blue-600 px-2 py-1 text-xs font-bold text-white">
                        Mới
                    </span>
                )}


                {/* Best seller */}
                {product.isBestSeller &&
                    !product.isNew && (
                        <span className="absolute left-3 top-3 rounded-md bg-orange-500 px-2 py-1 text-xs font-bold text-white">
                            Bán chạy
                        </span>
                    )}
                {/* Wishlist */}
                <button
                    type="button"
                    aria-label="Thêm vào yêu thích"
                    className="
                        absolute
                        right-3
                        top-3
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-full
                        bg-white/90
                        text-gray-500
                        opacity-0
                        shadow-sm
                        backdrop-blur
                        transition
                        hover:text-red-500
                        group-hover:opacity-100
                    "
                >
                    <Heart size={17} />
                </button>


                {/* Out of stock */}
                {product.stock === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/45">
                        <span className="rounded-md bg-white px-3 py-2 text-sm font-bold text-gray-900">
                            Hết hàng
                        </span>
                    </div>
                )}

            </div>


            {/* Info */}
            <div className="p-4">

                {/* Category */}
                <p className="text-xs text-gray-400">
                    {product.brand} ·{" "}
                    {product.category}
                </p>


                {/* Name */}
                <Link
                    href={`/products/${product.slug}`}
                    className="mt-1 block min-h-[44px] text-sm font-semibold leading-5 text-gray-900 transition hover:text-blue-600"
                >
                    {product.name}
                </Link>


                {/* Rating */}
                <div className="mt-2 flex items-center gap-1">

                    <Star
                        size={14}
                        className="fill-yellow-400 text-yellow-400"
                    />

                    <span className="text-xs font-semibold text-gray-700">
                        {product.rating}
                    </span>

                    <span className="text-xs text-gray-400">
                        ({product.reviews})
                    </span>

                </div>


                {/* Price */}
                <div className="mt-3">

                    <span className="text-lg font-bold text-red-600">
                        {formatPrice(
                            product.price
                        )}
                    </span>

                    {product.oldPrice && (
                        <span className="ml-2 text-xs text-gray-400 line-through">
                            {formatPrice(
                                product.oldPrice
                            )}
                        </span>
                    )}

                </div>


                {/* Cart */}
                <button
                    type="button"
                    disabled={product.stock === 0}
                    className="
                        mt-4
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-lg
                        border
                        border-blue-600
                        px-3
                        py-2.5
                        text-sm
                        font-semibold
                        text-blue-600
                        transition
                        hover:bg-blue-600
                        hover:text-white
                        disabled:cursor-not-allowed
                        disabled:border-gray-200
                        disabled:bg-gray-100
                        disabled:text-gray-400
                    "
                >
                    <ShoppingCart size={16} />

                    {product.stock === 0
                        ? "Hết hàng"
                        : "Thêm vào giỏ"}
                </button>

            </div>

        </article>
    );
}