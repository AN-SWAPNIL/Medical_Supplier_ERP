import { Building2, Handshake, HeartHandshake, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import ContactCTA from "./components/ContactCTA";
import PublicPageHero from "./components/PublicPageHero";
import SectionHeading from "./components/SectionHeading";
import { usePublicMeta } from "./usePublicMeta";

const businessFocus = [
  [PackageCheck, "Medical product supply", "A reviewed catalogue of medical devices and consumables for professional healthcare use."],
  [Handshake, "Institutional relationships", "Quotation-led engagement with hospitals, clinics, dialysis centers, dealers and healthcare organizations."],
  [Truck, "Import and distribution", "Coordinated overseas procurement, import operations, warehouse handling and customer delivery."],
  [ShieldCheck, "Documentation discipline", "Manufacturer, product and commercial records presented with the correct owner and scope."]
] as const;

export default function AboutPage() {
  usePublicMeta({
    title: "About MIPRO Healthcare Corporation | MiproBD",
    description: "Learn about MIPRO Healthcare Corporation, a Bangladesh medical device and consumable supplier supporting procurement, import, warehousing and distribution.",
    path: "/about",
    image: "/medical-products.png"
  });

  return (
    <>
      <PublicPageHero eyebrow="About MIPRO" title="Healthcare supply built around dependable operations" body="MIPRO Healthcare Corporation supports medical product procurement and distribution for healthcare organizations in Bangladesh." image="/medical-products.png" imageAlt="Collection of hemodialysis and medical consumable products" actions={<Link className="inline-flex h-11 items-center rounded-md bg-cyan-400 px-4 text-sm font-bold text-blue-950 hover:bg-cyan-300" to="/contact">Speak with our team</Link>} />

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <SectionHeading eyebrow="Company overview" title="MIPRO Healthcare Corporation" />
          <div className="space-y-5 text-base leading-8 text-slate-700">
            <p>MIPRO is a Bangladesh healthcare supply business focused on medical devices and consumables. The company supports the commercial and operational path from overseas sourcing and import coordination through warehouse handling and institutional distribution.</p>
            <p>The public catalogue is designed for professional inquiry. Exact model, manufacturer, specification, documentation and commercial terms are confirmed before a quotation proceeds.</p>
            <p>MIPRO does not present itself as the manufacturer of distributed products unless a specific product record explicitly confirms that relationship.</p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Business focus" title="A practical operating model for healthcare supply" body="The corporate website explains the public business. MIPRO's secure internal system manages the operational detail behind it." align="center" />
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {businessFocus.map(([Icon, title, body]) => (
              <div className="flex gap-4 rounded-md border border-slate-200 bg-white p-6" key={title}><span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-cyan-50 text-cyan-700"><Icon className="h-5 w-5" /></span><div><h3 className="font-bold text-slate-950">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{body}</p></div></div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading eyebrow="Markets served" title="Supporting professional healthcare buyers" body="MIPRO's commercial process is suited to organizations that need product review, documentation and quotation before purchase." />
              <div className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-slate-200 bg-slate-200">
                {["Hospitals", "Dialysis centers", "Clinics", "Medical dealers"].map((market) => <div className="bg-white p-5 text-sm font-bold text-blue-950" key={market}>{market}</div>)}
              </div>
            </div>
            <div>
              <SectionHeading eyebrow="Operating path" title="From requirement to delivery" />
              <ol className="mt-7 grid gap-3">
                {["Review the institution's product and documentation requirement", "Confirm model, variant and manufacturer information", "Prepare commercial quotation and supply terms", "Coordinate procurement, import and warehouse receipt", "Deliver with batch and product references"].map((step, index) => <li className="flex items-start gap-3 border-b border-slate-200 pb-3 text-sm leading-6 text-slate-700" key={step}><span className="grid h-7 w-7 shrink-0 place-items-center rounded bg-blue-900 text-xs font-bold text-white">{index + 1}</span>{step}</li>)}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-blue-950 py-16 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Corporate values" title="Clarity, responsibility and continuity" body="Public claims remain conservative, documentation ownership stays explicit, and operational records continue from procurement through customer fulfillment." tone="dark" />
          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {[[Building2, "Commercial clarity", "The exact product and supply basis is agreed before order conversion."], [HeartHandshake, "Healthcare responsibility", "Clinical selection remains with qualified professionals and approved documentation."], [ShieldCheck, "Record continuity", "Import, warehouse, sales and collection records stay connected internally."]].map(([Icon, title, body]) => {
              const ValueIcon = Icon as typeof Building2;
              return <div className="border-t border-cyan-400 pt-5" key={title as string}><ValueIcon className="h-6 w-6 text-cyan-300" /><h3 className="mt-3 font-bold">{title as string}</h3><p className="mt-2 text-sm leading-6 text-slate-300">{body as string}</p></div>;
            })}
          </div>
        </div>
      </section>
      <ContactCTA />
    </>
  );
}
