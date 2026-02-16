export interface QuestionnaireSection {
  id: string;
  title: string;
  icon: string;
  description: string;
}

export interface FieldConfig {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "radio" | "checkbox" | "number";
  placeholder?: string;
  options?: string[];
  required?: boolean;
  hint?: string;
}

export type FormData = Record<string, Record<string, string | string[]>>;

export const SECTIONS: QuestionnaireSection[] = [
  {
    id: "organizace",
    title: "Organizace a vedení",
    icon: "Building2",
    description: "Právní forma, struktura řízení, rozhodovací procesy",
  },
  {
    id: "personal",
    title: "Personální zajištění",
    icon: "Users",
    description: "Zaměstnanci, trenéři, externisté, dobrovolníci",
  },
  {
    id: "finance",
    title: "Finance a rozpočet",
    icon: "Wallet",
    description: "Příjmy, výdaje, dotace, sponzoři, rozpočtování",
  },
  {
    id: "sportoviste",
    title: "Sportoviště a prostory",
    icon: "Landmark",
    description: "Kurty, sály, sauna, zázemí, kapacity, údržba",
  },
  {
    id: "rezervace",
    title: "Rezervační systém",
    icon: "CalendarCheck",
    description: "Aktuální stav rezervací, požadavky na nový systém",
  },
  {
    id: "clenstvi",
    title: "Členství a CRM",
    icon: "UserCheck",
    description: "Členské programy, databáze, komunikace s členy",
  },
  {
    id: "aktivity",
    title: "Aktivity a kroužky",
    icon: "Dumbbell",
    description: "Sportovní a volnočasové aktivity, kurzy, tréninky",
  },
  {
    id: "turnaje",
    title: "Turnaje a akce",
    icon: "Trophy",
    description: "Organizace turnajů, mezinárodní akce, registrace",
  },
  {
    id: "eshop",
    title: "E-shop a prodej",
    icon: "ShoppingCart",
    description: "Online prodej, sortiment, platby, logistika",
  },
  {
    id: "restaurace",
    title: "Restaurace / Bistro",
    icon: "UtensilsCrossed",
    description: "Provoz stravování, menu, zásobování, hygiena",
  },
  {
    id: "marketing",
    title: "Marketing a komunikace",
    icon: "Megaphone",
    description: "Web, sociální sítě, newsletter, PR, branding",
  },
  {
    id: "it",
    title: "IT infrastruktura",
    icon: "Server",
    description: "Hardware, software, síť, bezpečnost, zálohování",
  },
  {
    id: "legislativa",
    title: "Legislativa a GDPR",
    icon: "Shield",
    description: "Právní požadavky, ochrana dat, smlouvy, pojištění",
  },
  {
    id: "cile",
    title: "Cíle a vize projektu",
    icon: "Target",
    description: "Očekávání, priority, harmonogram, kritéria úspěchu",
  },
];
