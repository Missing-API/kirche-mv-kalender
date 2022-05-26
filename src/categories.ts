export type TChurchCategory =
  | "Alle"
  | "Bildung/Kultur"
  | "Ehrenamt"
  | "Gemeindeleben"
  | "Gottesdienste"
  | "Konzerte/Musik"
  | "Sitzungen/Gremien"
  | "Sonstiges";

export interface ICategory {
  externalId: number;
  name: TChurchCategory;
  slug: string;
  googleClassifications?: string[];
}
export const Categories: ICategory[] = [
  { externalId: 0, name: "Alle", slug: "alle" },
  { externalId: 16, name: "Gottesdienste", slug: "gottesdienste" },
  { externalId: 17, name: "Bildung/Kultur", slug: "bildung-kultur" },
  { externalId: 18, name: "Ehrenamt", slug: "ehrenamt" },
  { externalId: 19, name: "Gemeindeleben", slug: "gemeindeleben" },
  { externalId: 20, name: "Konzerte/Musik", slug: "konzerte-musik" },
  { externalId: 21, name: "Sitzungen/Gremien", slug: "sitzungen-gremien" },
  { externalId: 22, name: "Sonstiges", slug: "sonstige" },
];
