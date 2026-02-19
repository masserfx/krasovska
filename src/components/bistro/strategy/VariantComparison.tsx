const VARIANTS = [
  {
    id: "A",
    title: "Quick Start",
    subtitle: "Nouzovy provoz",
    investment: "75-85K Kc",
    monthly: "47 500 Kc",
    staff: "1 brigádník",
    menu: "Polotovary, nápoje, základní občerstvení",
    pros: [
      "Minimální investice",
      "Rychlé spuštění (2-4 týdny)",
      "Nízké riziko",
    ],
    cons: [
      "Omezený sortiment",
      "Nízké tržby (60-90K/měs)",
      "Žádný catering",
    ],
    recommended: false,
  },
  {
    id: "B",
    title: "Standard Bistro",
    subtitle: "Doporučená varianta",
    investment: "220 000 Kc",
    monthly: "178 500 Kc",
    staff: "Kuchař + 2 brigádníci",
    menu: "Plný sortiment, denní menu, turnajový catering",
    pros: [
      "Plný servis s kuchařem",
      "Turnajový catering (80-300 osob)",
      "Break-even dosažitelný do 3 měsíců",
      "Možnost rozšíření na C",
    ],
    cons: [
      "Vyšší počáteční investice",
      "Potřeba kvalitního kuchaře",
      "3 měsíce do plného provozu",
    ],
    recommended: true,
  },
  {
    id: "C",
    title: "Full Restaurant",
    subtitle: "Budoucí rozšíření",
    investment: "500-700K Kc",
    monthly: "280 000+ Kc",
    staff: "Šéfkuchař + 2 kuchaři + obsluha",
    menu: "Plná restaurace, à la carte, banketní servis",
    pros: [
      "Maximální tržby (400K+/měs)",
      "Prémiový servis",
      "Salonky a eventy",
    ],
    cons: [
      "Vysoká investice",
      "Složitý personální management",
      "Delší návratnost",
    ],
    recommended: false,
  },
];

export default function VariantComparison() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Porovnání tří variant provozu bistra. Varianta B je doporučená jako
        optimální poměr investice a výnosu.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {VARIANTS.map((v) => (
          <div
            key={v.id}
            className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
              v.recommended
                ? "border-primary ring-2 ring-primary/20"
                : "border-border"
            }`}
          >
            {/* Header */}
            <div
              className={`px-5 py-4 ${
                v.recommended
                  ? "bg-primary text-white"
                  : "bg-background"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${
                    v.recommended ? "text-white/70" : "text-muted"
                  }`}
                >
                  Varianta {v.id}
                </span>
                {v.recommended && (
                  <span className="text-xs bg-white/20 rounded-full px-2 py-0.5">
                    Doporuceno
                  </span>
                )}
              </div>
              <h3
                className={`text-lg font-bold mt-1 ${
                  v.recommended ? "text-white" : "text-foreground"
                }`}
              >
                {v.title}
              </h3>
              <p
                className={`text-xs mt-0.5 ${
                  v.recommended ? "text-white/70" : "text-muted"
                }`}
              >
                {v.subtitle}
              </p>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {/* Key numbers */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Investice</span>
                  <span className="font-semibold text-foreground">
                    {v.investment}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Mesicni naklady</span>
                  <span className="font-semibold text-foreground">
                    {v.monthly}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Personal</span>
                  <span className="font-semibold text-foreground">
                    {v.staff}
                  </span>
                </div>
              </div>

              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted mb-1 font-medium">Menu</p>
                <p className="text-sm text-foreground">{v.menu}</p>
              </div>

              {/* Pros */}
              <div>
                <p className="text-xs text-muted mb-1.5 font-medium">Výhody</p>
                <ul className="space-y-1">
                  {v.pros.map((p, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-sm">
                      <span className="text-green-500 mt-0.5 flex-shrink-0">+</span>
                      <span className="text-foreground">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cons */}
              <div>
                <p className="text-xs text-muted mb-1.5 font-medium">Nevýhody</p>
                <ul className="space-y-1">
                  {v.cons.map((c, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-sm">
                      <span className="text-red-500 mt-0.5 flex-shrink-0">-</span>
                      <span className="text-foreground">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
