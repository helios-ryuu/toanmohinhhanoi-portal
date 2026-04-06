import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="relative flex-1 flex flex-col items-center justify-center md:pt-35 md:pb-10 py-40 px-6">
      {/* Content */}
      <div className="relative z-10 max-w-3xl text-center border border-accent/20 rounded-2xl bg-accent/5 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 md:px-12 md:py-8">
        {/* Greeting */}
        <h1 className="md:text-4xl text-2xl text-accent font-bold tracking-tight mb-6">
          Welcome to my digital space
        </h1>

        {/* Subtitle */}
        <p className="text-foreground/70 mb-10 text-base md:text-sm leading-relaxed max-w-xl mx-auto">
          A personal space for sharing insights, experiments, and learnings about <span className="text-foreground font-medium">software engineering</span>, <span className="text-foreground font-medium">technology</span>, and the journey of building products.
        </p>

        {/* CTA Button */}
        <div className="flex justify-center">
          <Link
            href="/post"
            className="group flex items-center gap-2 px-6 py-3 rounded-full border border-accent bg-accent/20 text-accent font-medium hover:bg-accent hover:text-accent-foreground transition-all"
          >
            Explore posts
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
