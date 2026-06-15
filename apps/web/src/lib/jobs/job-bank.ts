export interface JobBankListing {
  externalJobId: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  source: "job_bank";
  jobUrl: string;
  postedAt: string;
}

const USER_AGENT = "Immg-Jade/1.0 (+https://github.com/Polga088/Immg; job search)";

function decodeHtml(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .trim();
}

export function parseJobBankSearchHtml(html: string): JobBankListing[] {
  const listings: JobBankListing[] = [];
  const articleRegex =
    /<article[^>]*id="article-(\d+)"[\s\S]*?<\/article>/gi;
  let match: RegExpExecArray | null;

  while ((match = articleRegex.exec(html)) !== null) {
    const block = match[0];
    const externalJobId = match[1];

    const titleMatch = block.match(/<span class="noctitle"[^>]*>([^<]+)/i);
    const companyMatch = block.match(/<span class="business"[^>]*>([^<]+)/i);
    const locationMatch = block.match(/<span class="location"[^>]*>([^<]+)/i);
    const salaryMatch = block.match(/<span class="salary"[^>]*>([^<]+)/i);
    const dateMatch = block.match(
      /<span class="date[^"]*"[^>]*>[\s\S]*?<span[^>]*>([^<]+)/i,
    );

    const title = decodeHtml(titleMatch?.[1] ?? "Poste");
    const company = decodeHtml(companyMatch?.[1] ?? "Entreprise");
    const location = decodeHtml(locationMatch?.[1] ?? "");
    const salary = decodeHtml(salaryMatch?.[1] ?? "");
    const postedAt = decodeHtml(dateMatch?.[1] ?? "");

    listings.push({
      externalJobId,
      title,
      company,
      location,
      salary,
      source: "job_bank",
      jobUrl: `https://www.jobbank.gc.ca/jobsearch/jobposting/${externalJobId}`,
      postedAt,
    });
  }

  return listings;
}

export async function searchJobBank(
  keywords: string,
  location: string,
  page = 1,
): Promise<{ results: JobBankListing[]; total: number }> {
  const params = new URLSearchParams({
    searchstring: keywords,
    locationstring: location || "Canada",
    sort: "M",
    page: String(page),
  });

  const res = await fetch(
    `https://www.jobbank.gc.ca/jobsearch/jobsearch?${params}`,
    {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html",
        "Accept-Language": "en-CA,en;q=0.9,fr-CA;q=0.8",
      },
      signal: AbortSignal.timeout(25_000),
      next: { revalidate: 0 },
    },
  );

  if (!res.ok) {
    throw new Error(`Job Bank search failed: ${res.status}`);
  }

  const html = await res.text();
  const results = parseJobBankSearchHtml(html);

  const totalMatch = html.match(/(\d+)\s+results?/i);
  const total = totalMatch ? Number(totalMatch[1]) : results.length;

  return { results, total };
}

export async function fetchJobBankPostingDescription(
  externalJobId: string,
): Promise<string> {
  const res = await fetch(
    `https://www.jobbank.gc.ca/jobsearch/jobposting/${externalJobId}`,
    {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
      signal: AbortSignal.timeout(25_000),
      next: { revalidate: 0 },
    },
  );

  if (!res.ok) return "";

  const html = await res.text();
  const mainMatch = html.match(/<main[\s\S]*?>([\s\S]*?)<\/main>/i);
  const source = mainMatch?.[1] ?? html;
  return source
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 6000);
}
