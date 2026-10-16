"use client";

import Link from "next/link";
import { ChevronUp } from "lucide-react";

export default function CategoryMegaMenu() {
    return (
        <div className="group relative h-full">
            {/* =====================================================
                BUTTON DANH MỤC
            ====================================================== */}
            <span
                className="
                    flex
                    h-full
                    items-center
                    gap-2
                    px-5
                    text-sm
                    font-semibold
                    transition
                    hover:bg-white/10
                "
            >
                <span>Danh mục</span>
            </span>
            <div
                className="
                    invisible
                    absolute
                    left-[579px]
                    top-full
                    z-50
                    w-[calc(100vw-60px)]
                    max-w-[1410px]
                    -translate-x-1/2
                    translate-y-2
                    rounded-b-2xl
                    bg-white
                    p-5
                    opacity-0
                    shadow-2xl
                    transition-all
                    duration-200

                    group-hover:visible
                    group-hover:translate-y-0
                    group-hover:opacity-100
                "
            >
                <div className="grid grid-cols-[1fr_1fr_1fr_340px]">

                    {/* =================================================
                        COLUMN 1
                    ================================================== */}
                    <div className="border-r border-gray-200 px-5">

                        <CategoryTitle>
                            FLYDIGI
                        </CategoryTitle>

                        <CategoryItem href="/products/dune-fox">
                            Dune Fox
                        </CategoryItem>

                        <CategoryTitle>
                            FLYDIGI APEX SERIES
                        </CategoryTitle>

                        <CategoryItem href="/products/apex-3">
                            Apex 3
                        </CategoryItem>

                        <CategoryItem href="/products/apex-4">
                            Apex 4
                        </CategoryItem>

                        <CategoryItem href="/products/apex-5">
                            Apex 5
                        </CategoryItem>

                        <CategoryTitle>
                            VADER SERIES
                        </CategoryTitle>

                        <CategoryItem href="/products/vader-3-pro">
                            Vader 3 Pro
                        </CategoryItem>

                        <CategoryItem href="/products/vader-4-pro">
                            Vader 4 Pro
                        </CategoryItem>

                        <CategoryItem href="/products/vader-5-pro">
                            Vader 5 Pro
                        </CategoryItem>

                        <CategoryTitle>
                            DIREWOLF SERIES
                        </CategoryTitle>

                        <CategoryItem href="/products/direwolf-3">
                            Direwolf 3
                        </CategoryItem>

                        <CategoryItem href="/products/direwolf-4">
                            Direwolf 4
                        </CategoryItem>
                    </div>

                    {/* =================================================
                        COLUMN 2
                    ================================================== */}
                    <div className="border-r border-gray-200 px-5">

                        <CategoryTitle>
                            BIGBIGWON
                        </CategoryTitle>

                        <CategoryTitle>
                            GAMESIR
                        </CategoryTitle>

                        <CategoryItem href="/products/gamesir-g8">
                            G8 Series
                        </CategoryItem>

                        <CategoryTitle>
                            GAMESIR T7 SERIES
                        </CategoryTitle>

                        <CategoryItem href="/products/gamesir-t7-wired">
                            T7 Wired
                        </CategoryItem>

                        <CategoryItem href="/products/gamesir-t7-pro">
                            T7 Pro
                        </CategoryItem>

                        <CategoryTitle>
                            GAMESIR CYCLONE SERIES
                        </CategoryTitle>

                        <CategoryItem href="/products/gamesir-t4-cyclone">
                            T4 Cyclone
                        </CategoryItem>

                        <CategoryItem href="/products/gamesir-t4-cyclone-pro">
                            T4 Cyclone Pro
                        </CategoryItem>
                    </div>

                    {/* =================================================
                        COLUMN 3
                    ================================================== */}
                    <div className="border-r border-gray-200 px-5">

                        <CategoryTitle>
                            GAMESIR G7 SERIES
                        </CategoryTitle>

                        <CategoryItem href="/products/g7-se">
                            G7 SE
                        </CategoryItem>

                        <CategoryItem href="/products/g7-he">
                            G7 HE
                        </CategoryItem>

                        <CategoryItem href="/products/g7-pro">
                            G7 Pro
                        </CategoryItem>

                        <CategoryTitle>
                            GAMESIR KALEID SERIES
                        </CategoryTitle>

                        <CategoryItem href="/products/cyclone-2">
                            Cyclone 2
                        </CategoryItem>

                        <CategoryItem href="/products/cyclone-3">
                            Cyclone 3
                        </CategoryItem>

                        <CategoryItem href="/products/t4-kaleid">
                            T4 Kaleid
                        </CategoryItem>

                        <CategoryItem href="/products/kaleid">
                            Kaleid
                        </CategoryItem>

                        <CategoryItem href="/products/kaleid-flux">
                            Kaleid Flux
                        </CategoryItem>

                        <CategoryTitle>
                            Phụ Kiện
                        </CategoryTitle>
                    </div>

                    {/* =================================================
                        COLUMN 4 - IMAGES
                    ================================================== */}
                    <div className="space-y-5 pl-5">

                        {/* Image 1 */}
                        <Link
                            href="/categories/gamesir"
                            className="group/image block overflow-hidden rounded-2xl"
                        >
                            <img
                                src="/images/menu-gamesir-1.jpg"
                                alt="GameSir G7 Series"
                                className="
                                    h-[168px]
                                    w-full
                                    object-cover
                                    transition-transform
                                    duration-300
                                    group-hover/image:scale-105
                                "
                            />
                        </Link>

                        {/* Image 2 */}
                        <Link
                            href="/categories/controllers"
                            className="group/image block overflow-hidden rounded-2xl"
                        >
                            <img
                                src="/images/menu-controller.jpg"
                                alt="Gaming Controller"
                                className="
                                    h-[168px]
                                    w-full
                                    object-cover
                                    transition-transform
                                    duration-300
                                    group-hover/image:scale-105
                                "
                            />
                        </Link>
                    </div>
                </div>
            </div>

            {/* =====================================================
                MEGA MENU
            ====================================================== */}
        </div>
    );
}


/* ============================================================
   CATEGORY TITLE
============================================================ */

function CategoryTitle({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <h3
            className="
                mb-2
                mt-1
                text-[20px]
                font-bold
                leading-tight
                text-[#123663]
            "
        >
            {children}
        </h3>
    );
}


/* ============================================================
   CATEGORY ITEM
============================================================ */

function CategoryItem({
    children,
    href,
}: {
    children: React.ReactNode;
    href: string;
}) {
    return (
        <Link
            href={href}
            className="
                group/item
                flex
                items-center
                py-1.5
                text-[15px]
                text-gray-600
                transition
                hover:text-[#123663]
            "
        >
            <span className="mr-2 text-[13px] text-gray-500">
                •
            </span>

            <span className="transition-transform duration-150 group-hover/item:translate-x-1">
                {children}
            </span>
        </Link>
    );
}