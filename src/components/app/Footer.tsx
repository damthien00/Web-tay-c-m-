import Link from "next/link";
import {
    Facebook,
    Instagram,
    MapPin,
    Phone,
    Mail,
    Clock,
} from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-gray-950 text-gray-300">
            {/* Main Footer */}
            <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
                {/* Brand */}
                <div>
                    <Link
                                href="/"
                                aria-label="TAYCAMGIARE - Trang chủ"
                                className="flex shrink-0 items-center justify-center bg-white p-2 block"
                            >
                                <img
                                    src="/logo.png"
                                    alt="TAYCAMGIARE"
                                    className="block h-18 m-auto w-auto max-w-[110px] object-contain"
                                />
                            </Link>

                    <p className="mt-4 max-w-sm text-sm leading-6 text-gray-400">
                        Shop công nghệ chính hãng với hàng nghìn sản phẩm
                        chất lượng, giá tốt và dịch vụ hỗ trợ tận tâm.
                    </p>

                    {/* Social */}
                    <div className="mt-6 flex items-center gap-3">
                        <Link
                            href="#"
                            aria-label="Facebook"
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 transition hover:bg-blue-600 hover:text-white"
                        >
                            <Facebook size={17} />
                        </Link>

                        <Link
                            href="#"
                            aria-label="Instagram"
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 transition hover:bg-pink-600 hover:text-white"
                        >
                            <Instagram size={17} />
                        </Link>
                    </div>
                </div>

                {/* Mua hàng */}
                <div>
                    <h3 className="font-semibold text-white">
                        Mua hàng
                    </h3>

                    <ul className="mt-5 space-y-3 text-sm">
                        <li>
                            <Link
                                href="/products/phone"
                                className="transition hover:text-blue-500"
                            >
                                Điện thoại
                            </Link>
                        </li>

                        <li>
                            <Link
                                href="/products/laptop"
                                className="transition hover:text-blue-500"
                            >
                                Laptop
                            </Link>
                        </li>

                        <li>
                            <Link
                                href="/products/gaming"
                                className="transition hover:text-blue-500"
                            >
                                Gaming
                            </Link>
                        </li>

                        <li>
                            <Link
                                href="/products/accessories"
                                className="transition hover:text-blue-500"
                            >
                                Phụ kiện
                            </Link>
                        </li>

                        <li>
                            <Link
                                href="/promotions"
                                className="transition hover:text-blue-500"
                            >
                                Khuyến mãi
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Hỗ trợ */}
                <div>
                    <h3 className="font-semibold text-white">
                        Hỗ trợ
                    </h3>

                    <ul className="mt-5 space-y-3 text-sm">
                       <li>
                            <Link
                                href="https://zalo.me/0385244720"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="transition hover:text-blue-500"
                            >
                                Liên hệ
                            </Link>
                        </li>

                        <li>
                            <Link
                                href="/return-policy"
                                className="transition hover:text-blue-500"
                            >
                                Chính sách đổi trả
                            </Link>
                        </li>

                        <li>
                            <Link
                                href="/warranty"
                                className="transition hover:text-blue-500"
                            >
                                Chính sách bảo hành
                            </Link>
                        </li>

                        <li>
                            <Link
                                href="/faq"
                                className="transition hover:text-blue-500"
                            >
                                Câu hỏi thường gặp
                            </Link>
                        </li>

                        <li>
                            <Link
                                href="/shipping"
                                className="transition hover:text-blue-500"
                            >
                                Chính sách vận chuyển
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Liên hệ */}
                <div>
                    <h3 className="font-semibold text-white">
                        Liên hệ
                    </h3>

                    <ul className="mt-5 space-y-4 text-sm">
                        <li className="flex items-start gap-3">
                            <MapPin
                                size={18}
                                className="mt-0.5 shrink-0 text-blue-500"
                            />

                            <span>
                                Hưng Yên, Việt Nam
                            </span>
                        </li>

                        <li className="flex items-center gap-3">
                            <Phone
                                size={18}
                                className="shrink-0 text-blue-500"
                            />

                            <a
                                href="tel:0123456789"
                                className="transition hover:text-white"
                            >
                                0385244720
                            </a>
                        </li>

                        <li className="flex items-center gap-3">
                            <Mail
                                size={18}
                                className="shrink-0 text-blue-500"
                            />

                            <a
                                href="mailto:support@TAYCAMGIARE.vn"
                                className="transition hover:text-white"
                            >
                                damthien00@gmail.com
                            </a>
                        </li>

                        <li className="flex items-center gap-3">
                            <Clock
                                size={18}
                                className="shrink-0 text-blue-500"
                            />

                            <span>
                                08:00 - 22:00
                            </span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t border-gray-800">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-center text-sm text-gray-500 md:flex-row md:text-left">
                    <p>
                        © 2026 TAYCAMGIARE. All rights reserved.
                    </p>

                    <div className="flex items-center gap-5">
                        <Link
                            href="/privacy"
                            className="transition hover:text-gray-300"
                        >
                            Chính sách bảo mật
                        </Link>

                        <Link
                            href="/terms"
                            className="transition hover:text-gray-300"
                        >
                            Điều khoản sử dụng
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
