import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BadgeCheck, Boxes, ClipboardCheck, Globe2, PackageCheck, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import ContactCTA from "./components/ContactCTA";
import PublicProductCard from "./components/PublicProductCard";
import SectionHeading from "./components/SectionHeading";
import { publicSiteService } from "./publicSiteService";
import { usePublicMeta } from "./usePublicMeta";

const supplySteps = [
  [Globe2, "Overseas procurement", "Product and manufacturer documentation are reviewed against the requested supply."],
  [ClipboardCheck, "Import coordination", "Commercial documents, shipment milestones and import requirements remain connected."],
  [Boxes, "Warehouse handling", "Received products are handled by batch, LOT and expiry-aware warehouse processes."],
  [Truck, "Institutional distribution", "Quotation-led supply supports hospitals, clinics, dialysis centers and dealers."]
] as const;

export default function HomePage() {
  usePublicMeta({
    title: "MIPRO Healthcare Corporation | Medical Device & Consumable Supplier in Bangladesh",
    description: "MIPRO Healthcare Corporation supplies medical devices and consumables including hemodialysis and related healthcare products in Bangladesh."
  });
  const categories = useQuery({ queryKey: ["public", "categories"], queryFn: () => publicSiteService.categories() });
  const featured = useQuery({ queryKey: ["public", "products", "featured"], queryFn: () => publicSiteService.products({ featured: true }) });
  const certificates = useQuery({ queryKey: ["public", "certificates"], queryFn: () => publicSiteService.certificates() });
  const resources = useQuery({ queryKey: ["public", "resources"], queryFn: () => publicSiteService.resources() });

  return (
    <>
      <section className="relative min-h-[570px] overflow-hidden bg-blue-950 text-white sm:min-h-[600px]">
        <img className="absolute inset-0 h-full w-full object-cover" src="/medical-products.png" alt="Hemodialysis and medical consumable product collection" />
        <div className="absolute inset-0 bg-blue-950/84" />
        <div className="relative mx-auto flex min-h-[570px] max-w-7xl items-center px-4 py-16 sm:min-h-[600px] sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase text-cyan-300">Precision in Healthcare</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-6xl">MIPRO Healthcare Corporation</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
              Reliable medical devices and consumables for hospitals, clinics, dialysis centers and healthcare providers in Bangladesh.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link className="inline-flex h-12 items-center gap-2 rounded-md bg-cyan-400 px-5 text-sm font-bold text-blue-950 hover:bg-cyan-300" to="/products">Explore products <ArrowRight className="h-4 w-4" /></Link>
              <Link className="inline-flex h-12 items-center rounded-md border border-white/40 px-5 text-sm font-bold text-white hover:bg-white/10" to="/contact">Contact our team</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-slate-200 px-4 sm:px-6 md:grid-cols-4 md:divide-y-0 lg:px-8">
          {["Institutional supply", "Product documentation", "Import coordination", "Batch-aware distribution"].map((item) => (
            <div className="flex min-h-20 items-center justify-center gap-2 px-3 py-4 text-center text-xs font-bold uppercase text-blue-950" key={item}><BadgeCheck className="h-4 w-4 shrink-0 text-cyan-600" /> {item}</div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Product categories" title="Medical supplies organized around care needs" body="Explore MIPRO's current public catalogue by product family. Exact models, variants and supporting documents are confirmed during inquiry and quotation." />
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(categories.data ?? []).map((category) => (
              <Link className="group overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm hover:border-cyan-300" key={category.name} to={`/products?category=${encodeURIComponent(category.name)}`}>
                <div className="aspect-[16/10] overflow-hidden bg-white p-4"><img className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.03]" src={category.image} alt={`${category.name} product category`} loading="lazy" /></div>
                <div className="border-t border-slate-100 p-4">
                  <h2 className="font-bold text-slate-950">{category.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{category.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-cyan-700">View category <ArrowRight className="h-4 w-4" /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionHeading eyebrow="Featured products" title="Core products in the MiproBD catalogue" body="A B2B catalogue for product review and institutional inquiry, without exposing internal pricing or inventory data." />
            <Link className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-blue-900 hover:text-cyan-700" to="/products">Browse all products <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {(featured.data ?? []).map((product) => <PublicProductCard key={product.slug} product={product} />)}
          </div>
        </div>
      </section>

      <section className="bg-cyan-50 py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
          <div className="grid grid-cols-2 gap-3" aria-label="Representative MIPRO product range">
            {[
              ["/products/dialyzer.jpg", "Hemodialyzer"],
              ["/products/blood-tubing-set.png", "Blood tubing set"],
              ["/products/av-fistula-needle.jpg", "A.V. fistula needle"],
              ["/products/iv-catheter.jpg", "IV catheter"]
            ].map(([src, alt]) => <div className="grid aspect-square place-items-center overflow-hidden rounded-md border border-cyan-100 bg-white p-4" key={src}><img className="h-full w-full object-contain" src={src} alt={alt} loading="lazy" /></div>)}
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-cyan-800">About MIPRO</p>
            <h2 className="mt-2 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">A Bangladesh healthcare supply and distribution business</h2>
            <p className="mt-5 text-base leading-7 text-slate-700">MIPRO Healthcare Corporation supplies medical devices and consumables to healthcare institutions in Bangladesh, supporting overseas procurement, import operations, warehouse handling and organized distribution.</p>
            <p className="mt-4 text-base leading-7 text-slate-700">We present manufacturer and product documentation against the exact model requested, without representing partner certifications as MIPRO corporate certificates.</p>
            <Link className="mt-6 inline-flex h-11 items-center gap-2 rounded-md bg-blue-900 px-4 text-sm font-bold text-white hover:bg-blue-800" to="/about">Learn about MIPRO <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Supply capability" title="One connected path from sourcing to institutional delivery" body="A controlled operating flow supports commercial review, import coordination, traceability and customer fulfillment." align="center" />
          <div className="mt-10 grid gap-px overflow-hidden rounded-md border border-slate-200 bg-slate-200 md:grid-cols-4">
            {supplySteps.map(([Icon, title, body], index) => (
              <div className="bg-white p-6" key={title}>
                <div className="flex items-center justify-between"><span className="grid h-10 w-10 place-items-center rounded-md bg-cyan-50 text-cyan-700"><Icon className="h-5 w-5" /></span><span className="text-xs font-bold text-slate-400">0{index + 1}</span></div>
                <h3 className="mt-5 font-bold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <SectionHeading eyebrow="Quality documentation" title="Certificates shown with the correct owner and scope" body="Manufacturer certificates, product conformity records and supply documents are separated clearly. Public files appear only after publication approval." />
              <Link className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-900 hover:text-cyan-700" to="/certificates">Review documentation approach <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="grid gap-3">
              {(certificates.data ?? []).map((certificate) => (
                <div className="flex gap-4 rounded-md border border-slate-200 bg-white p-5" key={certificate.id}>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-emerald-50 text-emerald-700"><PackageCheck className="h-5 w-5" /></span>
                  <div><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-slate-950">{certificate.title}</h3><span className="rounded bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">{certificate.status}</span></div><p className="mt-2 text-sm leading-6 text-slate-600">{certificate.summary}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionHeading eyebrow="Resources" title="Useful product and procurement guidance" body="Curated healthcare supply content only, focused on product review and institutional purchasing." />
            <Link className="inline-flex items-center gap-2 text-sm font-bold text-blue-900 hover:text-cyan-700" to="/news">All resources <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {(resources.data ?? []).slice(0, 3).map((resource) => (
              <article className="overflow-hidden rounded-md border border-slate-200 bg-white" key={resource.slug}>
                <div className="aspect-[16/9] overflow-hidden bg-slate-50 p-4"><img className="h-full w-full object-contain" src={resource.image} alt="" loading="lazy" /></div>
                <div className="p-5"><p className="text-xs font-bold uppercase text-cyan-700">{resource.kind}</p><h3 className="mt-2 text-lg font-bold leading-6 text-slate-950">{resource.title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{resource.summary}</p><Link className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-blue-900" to={`/news#${resource.slug}`}>Read resource <ArrowRight className="h-4 w-4" /></Link></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ContactCTA />
    </>
  );
}
