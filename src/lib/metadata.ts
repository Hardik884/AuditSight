const ensureHttps = (url: string) => (url.startsWith("http") ? url : `https://${url}`);

export const getSiteUrl = () => {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_URL ||
    "http://localhost:3000";
  return ensureHttps(envUrl);
};

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
};

export const normalizeText = (text: string) =>
  text
    .replace(/\s+/g, " ")
    .replace(/\n/g, " ")
    .trim();
