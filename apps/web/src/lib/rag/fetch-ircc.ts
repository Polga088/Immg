import { FETCH_DELAY_MS } from "./constants";

export interface IrccSource {
  url: string;
  lang: "fr" | "en";
  fallbackTitle: string;
}

export const IRCC_SOURCES: IrccSource[] = [
  {
    url: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/immigrer-canada/entree-express/verifier-note.html",
    lang: "fr",
    fallbackTitle: "Entrée express — Système de classement global (CRS)",
  },
  {
    url: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/immigrer-canada/entree-express/admissibilite.html",
    lang: "fr",
    fallbackTitle: "Entrée express — Admissibilité",
  },
  {
    url: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/immigrer-canada/entree-express.html",
    lang: "fr",
    fallbackTitle: "Entrée express — Vue d'ensemble",
  },
  {
    url: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/immigrer-canada/candidats-provinces.html",
    lang: "fr",
    fallbackTitle: "Programmes des candidats des provinces (PNP)",
  },
  {
    url: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/travailler-canada/permis.html",
    lang: "fr",
    fallbackTitle: "Permis de travail au Canada",
  },
  {
    url: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/etudier-canada/permis-etudes.html",
    lang: "fr",
    fallbackTitle: "Permis d'études",
  },
  {
    url: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/immigrer-canada/entree-express/documents/evaluer-diplomes-etudes.html",
    lang: "fr",
    fallbackTitle: "Évaluation des diplômes (ECA)",
  },
  {
    url: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/immigrer-canada/entree-express/documents/examen-linguistique.html",
    lang: "fr",
    fallbackTitle: "Tests de langue — Entrée express",
  },
  {
    url: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/immigrer-canada/entree-express/documents/preuve-fonds-suffisants.html",
    lang: "fr",
    fallbackTitle: "Entrée express — Preuve de fonds suffisants",
  },
  {
    url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score.html",
    lang: "en",
    fallbackTitle: "Express Entry — Comprehensive Ranking System",
  },
  {
    url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/eligibility.html",
    lang: "en",
    fallbackTitle: "Express Entry — Eligibility",
  },
  {
    url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/provincial-nominees.html",
    lang: "en",
    fallbackTitle: "Provincial Nominee Program",
  },
  {
    url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/work-permit.html",
    lang: "en",
    fallbackTitle: "Work permit",
  },
  {
    url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/proof-funds.html",
    lang: "en",
    fallbackTitle: "Express Entry — Proof of funds",
  },
];

const USER_AGENT =
  "Immg-IRCC-Bot/1.0 (+https://github.com/Polga088/Immg; immigration research)";

export function htmlToText(html: string): string {
  const withoutScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");

  const mainMatch = withoutScripts.match(/<main[\s\S]*?>([\s\S]*?)<\/main>/i);
  const bodyMatch = withoutScripts.match(/<body[\s\S]*?>([\s\S]*?)<\/body>/i);
  const source = mainMatch?.[1] ?? bodyMatch?.[1] ?? withoutScripts;

  return source
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, " ")
    .trim();
}

export function extractTitle(html: string, fallback: string): string {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!match) return fallback;
  return match[1].replace(/\s+/g, " ").trim() || fallback;
}

export interface FetchedPage {
  url: string;
  title: string;
  content: string;
  fetchedAt: Date;
}

export async function fetchIrccPage(source: IrccSource): Promise<FetchedPage | null> {
  try {
    const res = await fetch(source.url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": source.lang === "fr" ? "fr-CA,fr;q=0.9" : "en-CA,en;q=0.9",
      },
      signal: AbortSignal.timeout(20_000),
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      console.warn(`IRCC fetch failed ${source.url}: ${res.status}`);
      return null;
    }

    const html = await res.text();
    const content = htmlToText(html);
    if (content.length < 200) {
      console.warn(`IRCC page too short ${source.url}`);
      return null;
    }

    return {
      url: source.url,
      title: extractTitle(html, source.fallbackTitle),
      content,
      fetchedAt: new Date(),
    };
  } catch (error) {
    console.warn(`IRCC fetch error ${source.url}:`, error);
    return null;
  }
}

export async function fetchAllIrccSources(
  sources: IrccSource[] = IRCC_SOURCES,
): Promise<FetchedPage[]> {
  const pages: FetchedPage[] = [];

  for (const source of sources) {
    const page = await fetchIrccPage(source);
    if (page) pages.push(page);
    await new Promise((r) => setTimeout(r, FETCH_DELAY_MS));
  }

  return pages;
}

export const IRCC_SEED_FALLBACK: Array<{ url: string; title: string; content: string }> = [
  {
    url: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/immigrer-canada/aide-famille/entree-express/verifier-note.html",
    title: "Entrée express — Comprehensive Ranking System",
    content:
      "Le système de classement global (CRS) évalue les candidats selon l'âge, l'éducation, l'expérience de travail, les compétences linguistiques et d'autres facteurs. Les candidats avec les scores les plus élevés reçoivent une invitation à présenter une demande.",
  },
  {
    url: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/immigrer-canada/candidats-provinces.html",
    title: "Programmes des candidats des provinces",
    content:
      "Les PNP permettent aux provinces et territoires de nominer des personnes qui souhaitent immigrer au Canada et s'établir dans une province particulière.",
  },
];
