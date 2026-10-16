"use client";

import { Facebook, Phone } from "lucide-react";

export default function FixedContact() {
    const phone = "0987654321"; // Thay bằng số điện thoại của bạn
    const zalo = "0987654321"; // Thay bằng số điện thoại Zalo

    return (
        <div className="fixed bottom-24 right-4 z-[9999] flex flex-col gap-3    ">
            {/* Messenger */}
            <a
                href="https://m.me/yourpage"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Liên hệ Messenger"
                title="Chat Messenger"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0084FF] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
            >
                <Facebook size={25} />
            </a>

            {/* Zalo */}
            <a
                href={`https://zalo.me/0385244720`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Liên hệ Zalo"
                title="Chat Zalo"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0068FF] text-sm font-bold text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
            >
                Zalo
            </a>

            {/* Điện thoại */}
            <a
                href={`tel:0385244720`}
                aria-label="Gọi điện"
                title="Gọi điện ngay"
                className="flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
            >
                <Phone size={23} />
            </a>
        </div>
    );
}