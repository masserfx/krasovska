const PACKAGES = [
  {
    name: "Zakladni",
    price: "2 000 Kc",
    duration: "4 hodiny",
    includes: ["Pronájem prostoru", "Základní úklid", "Wifi"],
    target: "Schůzky, menší firemní jednání",
  },
  {
    name: "Standard",
    price: "5 000 Kc",
    duration: "8 hodin",
    includes: [
      "Pronájem prostoru",
      "Občerstvení (káva, čaj, voda)",
      "Projektor / TV",
      "Úklid",
    ],
    target: "Firemní workshopy, prezentace",
  },
  {
    name: "Premium",
    price: "8 000 Kc",
    duration: "Celý den",
    includes: [
      "Pronájem prostoru",
      "Catering (oběd + coffee break)",
      "Technika (projektor, ozvučení)",
      "Asistence obsluhy",
      "Úklid",
    ],
    target: "Konference, oslavy, teambuildingy",
  },
  {
    name: "Oslava / Party",
    price: "od 10 000 Kc",
    duration: "Večer (18:00-24:00)",
    includes: [
      "Pronájem prostoru",
      "Catering (buffet)",
      "Bar service",
      "Dekorace (základní)",
      "Úklid",
    ],
    target: "Narozeniny, firemní večírky, rozlučky",
  },
];

const REVENUE_PROJECTION = [
  { month: "Květen", events: 2, avgRevenue: 5000, total: 10000 },
  { month: "Červen", events: 3, avgRevenue: 6000, total: 18000 },
  { month: "Červenec", events: 2, avgRevenue: 5000, total: 10000 },
  { month: "Srpen", events: 2, avgRevenue: 5000, total: 10000 },
  { month: "Září", events: 4, avgRevenue: 7000, total: 28000 },
  { month: "Říjen", events: 3, avgRevenue: 6000, total: 18000 },
  { month: "Listopad", events: 4, avgRevenue: 8000, total: 32000 },
  { month: "Prosinec", events: 5, avgRevenue: 10000, total: 50000 },
];

export default function SalonkySection() {
  const totalRevenue = REVENUE_PROJECTION.reduce((s, r) => s + r.total, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Monetizace salonku (200 m2)
        </h3>
        <p className="text-sm text-muted">
          Hala Krasovska disponuje salonkem o rozloze cca 200 m2, ktery je mozne
          vyuzit pro firemni akce, oslavy, workshopy a teambuildingy. V kombinaci
          s bistrem (catering) vzniká kompletní balíček služeb.
        </p>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">200 m2</p>
            <p className="text-xs text-muted">Rozloha</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">80 osob</p>
            <p className="text-xs text-muted">Max. kapacita</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">4 balicky</p>
            <p className="text-xs text-muted">Cenove varianty</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PACKAGES.map((pkg) => (
          <div
            key={pkg.name}
            className="bg-white rounded-xl border border-border shadow-sm p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-foreground">
                {pkg.name}
              </h4>
              <span className="text-sm font-bold text-primary">{pkg.price}</span>
            </div>
            <p className="text-xs text-muted mb-2">
              Doba: {pkg.duration} | Cíl: {pkg.target}
            </p>
            <ul className="space-y-1">
              {pkg.includes.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-1.5 text-sm text-foreground"
                >
                  <span className="text-green-500 mt-0.5 flex-shrink-0">&#10003;</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Projekce prijmu ze salonku (2026)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-xs font-semibold text-muted">
                  Mesic
                </th>
                <th className="text-right py-2 text-xs font-semibold text-muted">
                  Pocet akci
                </th>
                <th className="text-right py-2 text-xs font-semibold text-muted">
                  Prumer/akce
                </th>
                <th className="text-right py-2 text-xs font-semibold text-muted">
                  Celkem
                </th>
              </tr>
            </thead>
            <tbody>
              {REVENUE_PROJECTION.map((r) => (
                <tr key={r.month} className="border-b border-border">
                  <td className="py-2 text-foreground">{r.month}</td>
                  <td className="py-2 text-right tabular-nums">{r.events}</td>
                  <td className="py-2 text-right tabular-nums">
                    {r.avgRevenue.toLocaleString("cs-CZ")} Kc
                  </td>
                  <td className="py-2 text-right font-medium tabular-nums">
                    {r.total.toLocaleString("cs-CZ")} Kc
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-foreground">
                <td className="py-2 font-bold text-foreground" colSpan={3}>
                  Celkem za rok
                </td>
                <td className="py-2 text-right font-bold text-foreground tabular-nums">
                  {totalRevenue.toLocaleString("cs-CZ")} Kc
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
