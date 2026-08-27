import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, CalendarDays, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";
import PublicPageHero from "./components/PublicPageHero";
import SectionHeading from "./components/SectionHeading";
import { publicSiteService } from "./publicSiteService";
import { usePublicMeta } from "./usePublicMeta";

const formatDate = (value?: string) => value
  ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`))
  : "MIPRO resource";

export default function NewsPage() {
  usePublicMeta({
    title: "Healthcare News & Resources | MIPRO Healthcare Corporation",
    description: "Read curated MIPRO product guides and healthcare procurement resources for institutional medical supply review.",
    path: "/news",
    image: "/products/blood-tubing-set.png"
  });
  const resources = useQuery({ queryKey: ["public", "resources"], queryFn: () => publicSiteService.resources() });
  const rows = resources.data ?? [];
  const featured = rows.find((resource) => resource.featured) ?? rows[0];
  const remaining = rows.filter((resource) => resource.slug !== featured?.slug);

  return (
    <>
      <PublicPageHero eyebrow="News & resources" title="Relevant guidance for healthcare procurement" body="Curated product education, documentation guidance and MIPRO updates, without unrelated news or generic store content." image="/products/blood-tubing-set.png" imageAlt="Hemodialysis blood tubing set" />
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Resource library" title="Practical, product-focused information" body="These short resources support inquiry preparation. They do not replace approved product instructions or clinical judgment." />
          {resources.isLoading ? <div className="mt-9 border-y border-slate-200 py-12 text-center text-sm font-semibold text-slate-500">Loading published resources...</div> : null}
          {featured ? <Link className="group mt-9 grid overflow-hidden rounded-md border border-slate-200 bg-slate-50 transition hover:border-cyan-300 hover:shadow-xl lg:grid-cols-[1.05fr_.95fr]" to={`/news/${featured.slug}`}>
            <div className="grid min-h-[310px] place-items-center overflow-hidden bg-white p-6 sm:min-h-[390px]"><img className="h-full max-h-[430px] w-full object-contain transition duration-500 group-hover:scale-[1.03]" src={featured.image} alt={featured.imageAlt ?? ""} /></div>
            <div className="flex flex-col justify-center border-t border-slate-200 p-6 sm:p-9 lg:border-l lg:border-t-0">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs"><span className="inline-flex items-center gap-1.5 font-bold uppercase text-cyan-700"><BookOpen className="h-4 w-4" />{featured.kind}</span><span className="inline-flex items-center gap-1.5 text-slate-500"><CalendarDays className="h-3.5 w-3.5" />{formatDate(featured.publishedOn)}</span></div>
              <h2 className="mt-4 text-2xl font-bold leading-tight text-blue-950 sm:text-3xl">{featured.title}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">{featured.summary}</p>
              <span className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-blue-900">Read full article <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
            </div>
          </Link> : null}

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {remaining.map((resource) => (
              <Link className="group flex min-w-0 flex-col overflow-hidden rounded-md border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-cyan-300 hover:shadow-lg" key={resource.slug} to={`/news/${resource.slug}`}>
                <div className="grid aspect-[16/9] place-items-center overflow-hidden bg-slate-50 p-4"><img className="h-full w-full object-contain transition duration-500 group-hover:scale-105" src={resource.image} alt={resource.imageAlt ?? ""} /></div>
                <div className="flex flex-1 flex-col border-t border-slate-100 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs"><span className="font-bold uppercase text-cyan-700">{resource.kind}</span><span className="inline-flex items-center gap-1 text-slate-400"><Clock3 className="h-3.5 w-3.5" />{resource.readingMinutes ?? 3} min</span></div>
                  <h2 className="mt-3 text-xl font-bold leading-7 text-blue-950">{resource.title}</h2>
                  <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{resource.summary}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4"><span className="text-xs text-slate-500">{formatDate(resource.publishedOn)}</span><span className="inline-flex items-center gap-1 text-sm font-bold text-blue-900">Read <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
