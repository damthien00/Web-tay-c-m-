
"use client";

import { useState } from "react";
import {
  CircleHelp,
  Plus,
  Minus,
  Monitor,
  Gamepad2,
  Smartphone,
  Wrench,
  Download,
  Apple,
  Play,
  ChevronRight,
} from "lucide-react";
import PublicLayout from "../public-layout";

const faqs = [
  {
    question: "Tay cầm không kết nối được với PC / Console là vì sao?",
    answer:
      "Hãy kiểm tra pin tay cầm, cáp USB và chế độ kết nối phù hợp. Nếu sử dụng Bluetooth, hãy bật Bluetooth trên thiết bị và ghép nối lại tay cầm. Bạn cũng có thể thử khởi động lại tay cầm và máy tính.",
  },
  {
    question: "Tay cầm kết nối rồi nhưng game không nhận?",
    answer:
      "Hãy kiểm tra chế độ XInput hoặc DInput của tay cầm. Với game trên Steam, bạn có thể vào Settings > Controller để bật hỗ trợ tay cầm. Nếu vẫn không hoạt động, hãy thử kết nối bằng cáp USB hoặc cập nhật firmware.",
  },
  {
    question: "Nút bấm bị liệt hoặc bấm không ăn?",
    answer:
      "Bạn hãy kiểm tra trong phần mềm cấu hình tay cầm để xác định nút bấm có nhận tín hiệu hay không. Nếu nút vẫn không hoạt động sau khi khởi động lại và cập nhật firmware, hãy liên hệ bộ phận hỗ trợ để được kiểm tra.",
  },
  {
    question: "L2 / R2 không nhận đủ lực hoặc bị kẹt?",
    answer:
      "Hãy kiểm tra cài đặt trigger, vùng nhận lực và hiệu chỉnh trong phần mềm tương ứng. Nếu cò bị kẹt cơ học hoặc tín hiệu không thay đổi khi bóp, bạn nên liên hệ trung tâm bảo hành.",
  },
  {
    question: "Tay cầm sạc không vào pin?",
    answer:
      "Hãy thử sử dụng cáp USB và nguồn sạc khác tương thích, đồng thời kiểm tra cổng sạc. Nếu tay cầm nóng bất thường, có mùi lạ hoặc pin phồng, hãy ngừng sử dụng và liên hệ bộ phận hỗ trợ.",
  },
  {
    question: "Update firmware bị treo thì làm sao?",
    answer:
      "Không rút cáp hoặc tắt thiết bị khi quá trình cập nhật đang diễn ra. Nếu quá trình bị treo lâu, hãy tham khảo hướng dẫn khôi phục firmware chính thức của hãng hoặc liên hệ hỗ trợ trước khi thử cập nhật lại.",
  },
  {
    question: "Lỗi nào được bảo hành?",
    answer:
      "Các lỗi kỹ thuật do nhà sản xuất có thể được xem xét bảo hành theo chính sách của hãng và nơi bán. Hư hỏng do va đập, vào nước, tự ý tháo sửa hoặc sử dụng sai hướng dẫn có thể không thuộc phạm vi bảo hành.",
  },
];

const softwareGroups = [
  {
    title: "Phần Mềm Flydigi",
    description:
      "Flydigi Game Center cho phép người chơi chinh phục các trò chơi với thiết bị ngoại vi. Hãy cùng thống trị trò chơi!",
    theme: "blue",
    buttons: [
      {
        label: "App Store",
        icon: Apple,
        href: "https://www.flydigi.com/",
      },
      {
        label: "Google Play",
        icon: Play,
        href: "https://www.flydigi.com/",
      },
      {
        label: "Flydigi Space",
        icon: Monitor,
        href: "https://www.flydigi.com/",
      },
    ],
  },
  {
    title: "Phần Mềm BIGBIGWON",
    description:
      "BIGBIGWON hỗ trợ người chơi tùy chỉnh tay cầm và tối ưu trải nghiệm chơi game trên các thiết bị tương thích.",
    theme: "orange",
    buttons: [
      {
        label: "PC Tool",
        icon: Monitor,
        href: "https://www.bigbigwon.com/",
      },
      {
        label: "Google Play",
        icon: Play,
        href: "https://www.bigbigwon.com/",
      },
      {
        label: "App Store",
        icon: Apple,
        href: "https://www.bigbigwon.com/",
      },
      {
        label: "Hỗ Trợ",
        icon: Wrench,
        href: "https://www.bigbigwon.com/",
      },
    ],
  },
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  return (
       <PublicLayout>
            <main className="min-h-screen bg-white text-[#092b59]">
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
                        Hỗ trợ
                    </span>

                </div>
            </div>

            <div className="mx-auto max-w-7xl px-5 pb-10 m:px-8 lg:pxs-10 lg:pb-16">
               <div className="rounded-3xl bg-white border border-gray-100 bg-white px-5 py-16 text-center sm:py-24">
                {/* Nội dung chính */}
                <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-14">
                {/* Cột câu hỏi thường gặp */}
                <section>
                    <h1 className="mb-6 text-lg font-bold">
                    Câu Hỏi Thường Gặp Về HỖ TRỢ
                    </h1>

                    <div className="divide-y divide-[#e0e6ef]">
                    {faqs.map((faq, index) => {
                        const isOpen = openFaq === index;

                        return (
                        <div key={faq.question} className="group">
                            <button
                            type="button"
                            onClick={() =>
                                setOpenFaq(isOpen ? null : index)
                            }
                            aria-expanded={isOpen}
                            className="flex w-full items-center gap-3 py-4 text-left transition-colors hover:text-blue-600"
                            >
                            {/* Icon dấu hỏi */}
                            <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-[#edf0f5] text-[#092b59]">
                                <CircleHelp size={15} strokeWidth={2.5} />
                            </span>

                            {/* Nội dung câu hỏi */}
                            <span className="flex-1 text-sm font-medium leading-6">
                                {faq.question}
                            </span>

                            {/* Nút đóng / mở */}
                            <span className="flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full border border-[#cbd5e1] transition-colors group-hover:border-blue-500">
                                {isOpen ? (
                                <Minus size={15} />
                                ) : (
                                <Plus size={15} />
                                )}
                            </span>
                            </button>

                            {/* Câu trả lời */}
                            {isOpen && (
                            <div className="pb-5 pl-[39px] pr-3">
                                <p className="text-sm leading-7 text-gray-600">
                                {faq.answer}
                                </p>
                            </div>
                            )}
                        </div>
                        );
                    })}
                    </div>

                    {/* Liên hệ hỗ trợ */}
                    <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-5">
                    <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
                        <Gamepad2 size={22} />
                        </div>

                        <div>
                        <h2 className="font-semibold">
                            Bạn vẫn cần trợ giúp?
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-gray-600">
                            Liên hệ với chúng tôi để được hỗ trợ kiểm tra và
                            xử lý các vấn đề liên quan đến tay cầm.
                        </p>

                        <a
                            href="/contact"
                            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800"
                        >
                            Liên hệ hỗ trợ
                            <span aria-hidden="true">→</span>
                        </a>
                        </div>
                    </div>
                    </div>
                </section>

                {/* Cột phần mềm */}
                <section className="space-y-10 lg:pt-9">
                    {softwareGroups.map((group) => {
                    const isBlue = group.theme === "blue";

                    return (
                        <div key={group.title} className="text-center">
                        <h2 className="text-[28px] font-bold leading-tight tracking-tight text-[#092b59] sm:text-[30px]">
                            {group.title}
                        </h2>

                        <p className="mx-auto mt-1 max-w-[470px] text-sm leading-6 text-gray-800 sm:text-base">
                            {group.description}
                        </p>

                        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                            {group.buttons.map((button) => {
                            const Icon = button.icon;

                            return (
                                <a
                                key={button.label}
                                href={button.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:px-5 ${
                                    isBlue
                                    ? "bg-[#0878f9] hover:bg-[#0564d6]"
                                    : "bg-[#ff7108] hover:bg-[#e96200]"
                                }`}
                                >
                                <Icon size={15} strokeWidth={2.2} />
                                <span>{button.label}</span>
                                </a>
                            );
                            })}
                        </div>
                        </div>
                    );
                    })}

                    {/* Hướng dẫn sử dụng */}
                    <div className="rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-start gap-4">
                        <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                        <Download size={24} />
                        </div>

                        <div>
                        <h3 className="font-bold text-[#092b59]">
                            Hướng dẫn cài đặt phần mềm
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-gray-600">
                            Chọn đúng phần mềm theo dòng tay cầm và hệ điều
                            hành đang sử dụng. Hãy ưu tiên tải từ trang chính
                            thức của nhà sản xuất.
                        </p>
                        </div>
                    </div>
                    </div>
                </section>
                </div>

               </div>
            </div>
            </main>
       </PublicLayout>
  );
}
