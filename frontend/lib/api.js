import fallback from "../../shared/portfolio.json";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Load portfolio content from the Express API; use the bundled copy if the API is down.
export async function getPortfolio() {
  try {
    const res = await fetch(`${API_URL}/api/portfolio`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`API responded ${res.status}`);
    return await res.json();
  } catch {
    return fallback;
  }
}
