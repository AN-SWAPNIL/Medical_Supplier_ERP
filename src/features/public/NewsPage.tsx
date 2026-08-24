import { useQuery } from "@tanstack/react-query";
import { BookOpen, ChevronDown } from "lucide-react";
import PublicPageHero from "./components/PublicPageHero";
import SectionHeading from "./components/SectionHeading";
import { publicSiteService } from "./publicSiteService";
import { usePublicMeta } from "./usePublicMeta";

export default function NewsPage() {
  usePublicMeta({
    title: "Healthcare News & Resources | MIPRO Healthcare Corporation",
    description: "Read curated MIPRO product guides and healthcare procurement resources for institutional medical supply review.",
    path: "/news",
    image: "/products/blood-tubing-set.png"
  });
  const resources = useQuery({ queryKey: ["public", "resources"], queryFn: () => publicSiteService.resources() });

  return (
    <>
      <PublicPageHero eyebrow="News & resources" title="Relevant guidance for healthcare procurement" body="Curated product education, documentation guidance and MIPRO updates, without unrelated news or generic store content." image="/products/blood-tubing-set.png" imageAlt="Hemodialysis blood tubing set" />
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Resource library" title="Practical, product-focused information" body="These short resources support inquiry preparation. They do not replace approved product instructions or clinical judgment." />
          <div className="mt-9 grid gap-6">
            {(resources.data ?? []).map((resource, index) => (
              <article className="grid overflow-hidden rounded-md border border-slate-200 bg-slate-50 md:grid-cols-[260px_1fr]" id={resource.slug} key={resource.slug}>
                <div className="grid min-h-52 place-items-center overflow-hidden bg-white p-5"><img className="h-full max-h-56 w-full object-contain" src={resource.image} alt="" loading="lazy" /></div>
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-3"><span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-cyan-700"><BookOpen className="h-4 w-4" /> {resource.kind}</span><span className="text-xs text-slate-400">Resource {String(index + 1).padStart(2, "0")}</span></div>
                  <h2 className="mt-3 text-2xl font-bold leading-8 text-slate-950">{resource.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{resource.summary}</p>
                  <details className="mt-5 border-t border-slate-200 pt-4"><summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-bold text-blue-900">Read full resource <ChevronDown className="h-4 w-4" /></summary><div className="mt-4 grid gap-3 text-sm leading-7 text-slate-700">{resource.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></details>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
