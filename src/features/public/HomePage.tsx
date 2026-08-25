import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { ArrowRight, BadgeCheck, Boxes, ClipboardCheck, FileBadge2, Globe2, Layers3, MessageSquareText, PackageCheck, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ContactCTA from "./components/ContactCTA";
import HeroCarousel from "./components/HeroCarousel";
import PublicProductCard from "./components/PublicProductCard";
import SectionHeading from "./components/SectionHeading";
import { publicSiteService } from "./publicSiteService";
import { usePublicMeta } from "./usePublicMeta";

const supplySteps = [
  { icon: Globe2, title: "Overseas procurement", body: "Product, manufacturer and commercial requirements are reviewed against the requested supply.", detail: "The requested model, variant and supporting documents stay connected before commercial confirmation.", image: "/medical-products.png" },
  { icon: ClipboardCheck, title: "Import coordination", body: "Commercial documents, shipment milestones and import requirements remain connected.", detail: "One import reference follows the consignment through shipping, costing and warehouse readiness.", image: "/mipro-warehouse.png" },
  { icon: Boxes, title: "Warehouse handling", body: "Received products are handled by batch, LOT and expiry-aware processes.", detail: "Product identity and receiving details support visible batch records and controlled stock movement.", image: "/products/blood-tubing-set.png" },
  { icon: Truck, title: "Institutional distribution", body: "Quotation-led supply supports hospitals, clinics, dialysis centers and dealers.", detail: "Customer requirements carry into quotation, order, delivery and collection without a public checkout flow.", image: "/products/dialyzer.jpg" }
] as const;

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("Featured");
  const [activeSupplyStep, setActiveSupplyStep] = useState(0);
  usePublicMeta({
    title: "MIPRO Healthcare Corporation | Medical Device & Consumable Supplier in Bangladesh",
    description: "MIPRO Healthcare Corporation supplies medical devices and consumables including hemodialysis and related healthcare products in Bangladesh."
  });

  const hero = useQuery({ queryKey: ["public", "hero-slides"], queryFn: publicSiteService.heroSlides });
  const categories = useQuery({ queryKey: ["public", "categories"], queryFn: publicSiteService.categories });
  const products = useQuery({ queryKey: ["public", "products"], queryFn: () => publicSiteService.products() });
  const certificates = useQuery({ queryKey: ["public", "certificates"], queryFn: publicSiteService.certificates });
  const resources = useQuery({ queryKey: ["public", "resources"], queryFn: publicSiteService.resources });

  const productRows = products.data ?? [];
  const categoryRows = categories.data ?? [];
  const featuredProducts = useMemo(() => {
    if (activeCategory === "Featured") return productRows.filter((product) => product.featured).slice(0, 8);
    return productRows.filter((product) => product.category === activeCategory).slice(0, 8);
  }, [activeCategory, productRows]);
  const activeStep = supplySteps[activeSupplyStep];

  const catalogueMetrics = [
    { value: String(productRows.length).padStart(2, "0"), label: "Published products", icon: PackageCheck },
    { value: String(categoryRows.length).padStart(2, "0"), label: "Product families", icon: Layers3 },
    { value: String(certificates.data?.length ?? 0).padStart(2, "0"), label: "Document records", icon: FileBadge2 },
    { value: String(resources.data?.length ?? 0).padStart(2, "0"), label: "Public resources", icon: MessageSquareText }
  ];

  return (
    <>
      <HeroCarousel slides={hero.data ?? []} />

      <section className="border-b border-slate-200 bg-white" aria-label="Published website catalogue counts">
        <div className="mx-auto grid max-w-7xl grid-cols-2 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          {catalogueMetrics.map(({ value, label, icon: Icon }, index) => (
            <div className={clsx("flex min-h-24 items-center gap-3 px-3 py-5 sm:px-5", index % 2 ? "border-l border-slate-200" : "", index > 1 ? "border-t border-slate-200 lg:border-t-0" : "", index === 2 ? "lg:border-l" : "")} key={label}>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-cyan-50 text-cyan-700"><Icon className="h-5 w-5" /></span>
              <div><strong className="block text-2xl font-bold text-blue-950">{value}</strong><span className="text-xs font-semibold text-slate-500">{label}</span></div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Product center" title="Medical supplies organized around care needs" body="Explore MIPRO's current public catalogue by product family. Exact models, variants and supporting documents are confirmed during inquiry and quotation." />
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categoryRows.map((category) => {
              const count = productRows.filter((product) => product.category === category.name).length;
              return <Link className="group overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-cyan-300 hover:shadow-lg" key={category.id} to={`/products?category=${encodeURIComponent(category.name)}`}>
                <div className="relative aspect-[16/10] overflow-hidden bg-white p-4"><img className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.05]" src={category.image} alt={`${category.name} product category`} loading="lazy" /><span className="absolute right-3 top-3 rounded bg-blue-950 px-2 py-1 text-[10px] font-bold text-white">{count} product{count === 1 ? "" : "s"}</span></div>
                <div className="border-t border-slate-100 p-4">
                  <h2 className="font-bold text-slate-950">{category.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{category.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-cyan-700">View category <ArrowRight className="h-4 w-4" /></span>
                </div>
              </Link>;
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionHeading eyebrow="Featured catalogue" title="Review products before commercial discussion" body="Select a product family to inspect available public records. Internal pricing, stock, landed cost and suppliers remain protected inside MIPRO ERP." />
            <Link className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-blue-900 hover:text-cyan-700" to="/products">Browse all products <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-7 flex max-w-full gap-2 overflow-x-auto pb-2" aria-label="Filter homepage products">
            {["Featured", ...categoryRows.map((category) => category.name)].map((category) => <button className={clsx("h-10 shrink-0 rounded-md border px-4 text-sm font-bold transition", activeCategory === category ? "border-blue-950 bg-blue-950 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-cyan-400 hover:text-blue-950")} type="button" key={category} onClick={() => setActiveCategory(category)}>{category}</button>)}
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featuredProducts.map((product) => <PublicProductCard key={product.slug} product={product} />)}
          </div>
          {!featuredProducts.length ? <div className="mt-6 border-y border-slate-200 py-10 text-center text-sm text-slate-500">No published products are assigned to this view yet.</div> : null}
        </div>
      </section>

      <section className="bg-cyan-50 py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
          <div className="grid grid-cols-2 gap-3" aria-label="Representative MIPRO product range">
            {productRows.slice(0, 4).map((product) => <Link className="group grid aspect-square place-items-center overflow-hidden rounded-md border border-cyan-100 bg-white p-4" key={product.slug} to={`/products/${product.slug}`}><img className="h-full w-full object-contain transition duration-300 group-hover:scale-105" src={product.images[0]} alt={product.imageAlt} loading="lazy" /></Link>)}
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-cyan-800">About MIPRO</p>
            <h2 className="mt-2 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">A Bangladesh healthcare supply and distribution business</h2>
            <p className="mt-5 text-base leading-7 text-slate-700">MIPRO Healthcare Corporation supplies medical devices and consumables to healthcare institutions in Bangladesh, supporting overseas procurement, import operations, warehouse handling and organized distribution.</p>
            <p className="mt-4 text-base leading-7 text-slate-700">Manufacturer and product documentation is presented against the exact model requested, without representing partner certifications as MIPRO corporate certificates.</p>
            <div className="mt-6 flex flex-wrap gap-3"><Link className="inline-flex h-11 items-center gap-2 rounded-md bg-blue-900 px-4 text-sm font-bold text-white hover:bg-blue-800" to="/about">Learn about MIPRO <ArrowRight className="h-4 w-4" /></Link><Link className="inline-flex h-11 items-center rounded-md border border-cyan-300 bg-white px-4 text-sm font-bold text-blue-950 hover:bg-cyan-100" to="/contact">Discuss a requirement</Link></div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-slate-950 py-16 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Supply capability" title="One connected path from sourcing to institutional delivery" body="Choose a stage to see how product and commercial information stays connected through the supply process." tone="dark" />
          <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
            <div className="grid gap-2">
              {supplySteps.map((step, index) => {
                const Icon = step.icon;
                return <button className={clsx("flex min-h-24 items-start gap-4 rounded-md border p-4 text-left transition", activeSupplyStep === index ? "border-cyan-400 bg-white text-slate-950" : "border-white/15 bg-white/5 text-white hover:bg-white/10")} type="button" key={step.title} onClick={() => setActiveSupplyStep(index)}>
                  <span className={clsx("grid h-10 w-10 shrink-0 place-items-center rounded-md", activeSupplyStep === index ? "bg-cyan-100 text-cyan-800" : "bg-white/10 text-cyan-300")}><Icon className="h-5 w-5" /></span>
                  <span><span className="flex items-center gap-2 text-sm font-bold"><small className="text-[10px] opacity-60">0{index + 1}</small>{step.title}</span><span className={clsx("mt-1 block text-sm leading-6", activeSupplyStep === index ? "text-slate-600" : "text-slate-300")}>{step.body}</span></span>
                </button>;
              })}
            </div>
            <div className="relative min-h-[380px] overflow-hidden rounded-md bg-white">
              <img className="absolute inset-0 h-full w-full object-cover" src={activeStep.image} alt={activeStep.title} />
              <div className="absolute inset-x-0 bottom-0 bg-blue-950/90 p-5 sm:p-6"><p className="text-xs font-bold uppercase text-cyan-300">Current stage</p><h3 className="mt-1 text-xl font-bold">{activeStep.title}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-slate-200">{activeStep.detail}</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <SectionHeading eyebrow="Quality documentation" title="Documents shown with the correct owner and scope" body="Manufacturer certificates, product conformity records and supply documents are separated clearly. Public files appear only after publication approval." />
              <Link className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-900 hover:text-cyan-700" to="/certificates">Review all documents <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="grid gap-3">
              {(certificates.data ?? []).slice(0, 4).map((certificate) => (
                <Link className="flex gap-4 rounded-md border border-slate-200 bg-white p-5 transition hover:border-cyan-300 hover:shadow-md" to="/certificates" key={certificate.id}>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-emerald-50 text-emerald-700"><PackageCheck className="h-5 w-5" /></span>
                  <div><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-slate-950">{certificate.title}</h3><span className="rounded bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">{certificate.status}</span></div><p className="mt-2 text-sm leading-6 text-slate-600">{certificate.summary}</p></div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionHeading eyebrow="Resources" title="Useful product and procurement guidance" body="Curated healthcare supply content focused on product review and institutional purchasing." />
            <Link className="inline-flex items-center gap-2 text-sm font-bold text-blue-900 hover:text-cyan-700" to="/news">All resources <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {(resources.data ?? []).slice(0, 3).map((resource) => (
              <article className="group overflow-hidden rounded-md border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg" key={resource.slug}>
                <div className="aspect-[16/9] overflow-hidden bg-slate-50 p-4"><img className="h-full w-full object-contain transition duration-500 group-hover:scale-105" src={resource.image} alt="" loading="lazy" /></div>
                <div className="p-5"><p className="text-xs font-bold uppercase text-cyan-700">{resource.kind}</p><h3 className="mt-2 text-lg font-bold leading-6 text-slate-950">{resource.title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{resource.summary}</p><Link className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-blue-900" to={`/news#${resource.slug}`}>Read resource <ArrowRight className="h-4 w-4" /></Link></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-cyan-50 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 sm:px-6 md:flex-row md:items-center lg:px-8"><div className="flex items-center gap-3"><BadgeCheck className="h-6 w-6 shrink-0 text-cyan-700" /><p className="text-sm font-semibold text-slate-700">Product selection and clinical use must follow the approved documentation for the exact supplied model.</p></div><Link className="shrink-0 text-sm font-bold text-blue-950 hover:text-cyan-700" to="/certificates">Documentation policy</Link></div>
      </section>

      <ContactCTA />
    </>
  );
}
