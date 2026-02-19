const SUPPLIERS = [
  {
    name: "Plzensky Prazdroj",
    category: "Napoje",
    products: "Pivo (sud, tank), cepovaci zarizeni",
    terms: "Spolufinancovani cepovani, rabat dle odberu",
    contact: "Obchodni zastupce",
    priority: "high" as const,
  },
  {
    name: "Makro Cash & Carry",
    category: "Suroviny",
    products: "Potraviny, suroviny, cistici prostredky",
    terms: "Karta Makro, pravidelny odber",
    contact: "Pobocka Plzen",
    priority: "high" as const,
  },
  {
    name: "Bidfood Czech",
    category: "Suroviny",
    products: "Mrazene polotovary, masa, zelenina",
    terms: "Rozvoz 2x/tyden, min. objednavka 3000 Kc",
    contact: "Obchodni zastupce",
    priority: "medium" as const,
  },
  {
    name: "Coca-Cola HBC",
    category: "Napoje",
    products: "Nealko napoje, dzusy, vody",
    terms: "Chlazeni zapujcka, cenove podmínky dle objemu",
    contact: "Obchodni zastupce",
    priority: "medium" as const,
  },
  {
    name: "Lavazza / Segafredo",
    category: "Napoje",
    products: "Kavove smesi, kavovar (zapujcka)",
    terms: "Kavovar zapujcka pri odberu 5+ kg/mesic",
    contact: "Distributor",
    priority: "medium" as const,
  },
  {
    name: "Dotykacka",
    category: "Technologie",
    products: "POS system KOMPLET",
    terms: "Mesicni licence 1 500 Kc, HW jednorázově 18 000 Kc",
    contact: "dotykacka.cz",
    priority: "high" as const,
  },
  {
    name: "Lokalni pekarstvi",
    category: "Suroviny",
    products: "Pecivo, chleba, zakusky",
    terms: "Denni rozvoz, platba tydenni",
    contact: "Dle lokality",
    priority: "low" as const,
  },
  {
    name: "Svoz odpadu",
    category: "Sluzby",
    products: "Komunalni + gastroodpad, separace oleje",
    terms: "Mesicni pausál",
    contact: "Lokalni firma",
    priority: "low" as const,
  },
  {
    name: "HACCP konzultant",
    category: "Sluzby",
    products: "HACCP dokumentace, skoleni, audit",
    terms: "Jednorazove 15-25K Kc, rocni audit 5K Kc",
    contact: "Akreditovany konzultant",
    priority: "high" as const,
  },
  {
    name: "Wolt / Bolt Food",
    category: "Distribuce",
    products: "Online objednavky, rozvoz",
    terms: "Provize 25-30% z objednavky",
    contact: "Registrace online",
    priority: "medium" as const,
  },
];

const PRIORITY_COLORS = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-gray-100 text-gray-600",
};

const PRIORITY_LABELS = {
  high: "Klicovy",
  medium: "Dulezity",
  low: "Doplnkovy",
};

export default function SuppliersSection() {
  const categories = [...new Set(SUPPLIERS.map((s) => s.category))];

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        Prehled klicovych dodavatelu a partneru pro provoz bistra.
        Priorita urcuje poradi, ve kterem je treba smlouvy uzavrit.
      </p>

      {categories.map((cat) => (
        <div key={cat}>
          <h3 className="text-sm font-semibold text-foreground mb-3">{cat}</h3>
          <div className="space-y-2">
            {SUPPLIERS.filter((s) => s.category === cat).map((s) => (
              <div
                key={s.name}
                className="bg-white rounded-xl border border-border shadow-sm p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold text-foreground">
                        {s.name}
                      </h4>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${PRIORITY_COLORS[s.priority]}`}
                      >
                        {PRIORITY_LABELS[s.priority]}
                      </span>
                    </div>
                    <p className="text-sm text-foreground mt-1">{s.products}</p>
                    <p className="text-xs text-muted mt-1">
                      Podminky: {s.terms}
                    </p>
                    <p className="text-xs text-muted">Kontakt: {s.contact}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
