import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "About — Toán Mô Hình Hà Nội",
};

export default function AboutPage() {
    return (
        <main className="mx-auto max-w-5xl px-4 py-10">
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-widest text-accent">VỀ TOÁN MÔ HÌNH HÀ NỘI</h1>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-foreground/70">
                    Toán Mô Hình Hà Nội là không gian học thuật dành cho những bạn trẻ quan tâm tới mô hình hóa,
                    tư duy định lượng và ứng dụng toán học vào các vấn đề thực tiễn.
                </p>
            </header>

            <div className="grid gap-6 md:grid-cols-3">
                <section className="rounded-lg border border-(--border-color) bg-(--post-card) p-5">
                    <h2 className="mb-2 text-sm font-semibold uppercase tracking-widest">Sứ mệnh</h2>
                    <p className="text-sm leading-relaxed text-foreground/70">
                        Xây dựng cộng đồng học hỏi nghiêm túc, nơi kiến thức toán học được nối với dữ liệu,
                        kinh tế, tài chính, kỹ thuật và các bài toán xã hội.
                    </p>
                </section>
                <section className="rounded-lg border border-(--border-color) bg-(--post-card) p-5">
                    <h2 className="mb-2 text-sm font-semibold uppercase tracking-widest">Hoạt động</h2>
                    <p className="text-sm leading-relaxed text-foreground/70">
                        Portal này tập trung đăng tải bài viết chuyên môn, thông tin cuộc thi và hỗ trợ thí sinh
                        nộp bài trong các vòng thi được ban tổ chức mở.
                    </p>
                </section>
                <section className="rounded-lg border border-(--border-color) bg-(--post-card) p-5">
                    <h2 className="mb-2 text-sm font-semibold uppercase tracking-widest">Liên hệ</h2>
                    <p className="text-sm leading-relaxed text-foreground/70">
                        Thông tin liên hệ chính thức sẽ được cập nhật sau. Trong thời gian này, vui lòng theo dõi
                        fanpage của Toán Mô Hình Hà Nội để nhận thông báo mới nhất.
                    </p>
                </section>
            </div>
        </main>
    );
}
