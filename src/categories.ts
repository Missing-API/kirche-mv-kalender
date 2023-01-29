export type TChurchCategory =
  | "Alle"
  | "Bildung/Kultur"
  | "Ehrenamt"
  | "Gemeindeleben"
  | "Gottesdienste"
  | "Konzerte/Musik"
  | "Sitzungen/Gremien"
  | "Sonstiges";

export type TScope = "Ort" | "Umgebung" | "Region";
export interface ICategory {
  externalId: number;
  name: TChurchCategory;
  slug: string;
  scope: TScope;
  googleClassifications?: string[];
}
export const Categories: ICategory[] = [
  { externalId: 0, name: "Alle", slug: "alle", scope: "Umgebung" },
  {
    externalId: 16,
    name: "Gottesdienste",
    slug: "gottesdienste",
    scope: "Umgebung",
  },
  {
    externalId: 17,
    name: "Bildung/Kultur",
    slug: "bildung-kultur",
    scope: "Umgebung",
  },
  { externalId: 18, name: "Ehrenamt", slug: "ehrenamt", scope: "Umgebung" },
  {
    externalId: 19,
    name: "Gemeindeleben",
    slug: "gemeindeleben",
    scope: "Umgebung",
  },
  {
    externalId: 20,
    name: "Konzerte/Musik",
    slug: "konzerte-musik",
    scope: "Region",
  },
  {
    externalId: 21,
    name: "Sitzungen/Gremien",
    slug: "sitzungen-gremien",
    scope: "Umgebung",
  },
  { externalId: 22, name: "Sonstiges", slug: "sonstige", scope: "Umgebung" },
];
