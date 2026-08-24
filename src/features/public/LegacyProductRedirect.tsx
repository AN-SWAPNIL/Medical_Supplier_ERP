import { Navigate, useParams } from "react-router-dom";
import { publicProducts } from "./public.content";

export default function LegacyProductRedirect() {
  const { legacySlug = "" } = useParams();
  const product = publicProducts.find((entry) => entry.legacySlug === legacySlug);
  return <Navigate to={product ? `/products/${product.slug}` : "/products"} replace />;
}
