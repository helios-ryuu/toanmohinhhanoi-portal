import UnderDevelopment from "@/components/ui/UnderDevelopment";

export const metadata = {
    title: "Kỳ thi - Toán Mô Hình Hà Nội",
};

export default function ContestsPage() {
    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <header className="mb-6">
                <h1 className="text-2xl font-bold tracking-widest text-accent">KỲ THI</h1>
                <p className="text-sm text-foreground/60 mt-1">
                    Đăng ký, nộp bài và theo dõi kết quả các kỳ thi.
                </p>
            </header>
            <UnderDevelopment
                title="Tính năng kỳ thi đang được phát triển"
                description="Chức năng này sẽ sớm ra mắt. Vui lòng quay lại sau."
            />
        </div>
    );
}
