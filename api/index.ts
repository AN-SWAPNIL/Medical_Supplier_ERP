import app from "../server/index.js";

type VercelLikeRequest = {
  url?: string;
  headers: Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[] | undefined>;
};

function firstQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function handler(req: VercelLikeRequest, res: any) {
  const rewrittenPath = firstQueryValue(req.query?.path);

  if (rewrittenPath) {
    const host = firstQueryValue(req.headers.host) ?? "localhost";
    const url = new URL(req.url ?? "/", `https://${host}`);
    url.searchParams.delete("path");
    const query = url.searchParams.toString();
    req.url = `/api/${rewrittenPath}${query ? `?${query}` : ""}`;
  }

  return app(req as any, res);
}
