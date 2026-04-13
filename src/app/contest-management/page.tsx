import UnderDevelopment from "@/components/ui/UnderDevelopment";

export default function ContestManagementPage() {
    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <header className="mb-6">
                <h1 className="text-2xl font-bold tracking-widest text-accent">CONTEST MANAGEMENT</h1>
                <p className="text-sm text-foreground/60 mt-1">
                    Create contests, review submissions, and manage enrollments.
                </p>
            </header>
            <UnderDevelopment
                title="Contest Management is under development"
                description="Phase 4 of the contest portal. Coming soon."
            />
        </div>
    );
}
