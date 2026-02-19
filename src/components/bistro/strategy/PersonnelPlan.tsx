const POSITIONS = [
  {
    title: "Kuchar (HPP)",
    type: "Hlavni pracovni pomer",
    hours: "Po-Pa, 6:00-14:00",
    salary: "45 000 Kc/mes",
    responsibilities: [
      "Denni menu (polevka + 2 hlavni jidla)",
      "Turnajovy catering",
      "Receptury a kalkulace",
      "HACCP evidence",
      "Objednavky surovin",
    ],
    requirements: [
      "Min. 3 roky praxe v gastro",
      "Zdravotni prukaz",
      "Zkusenost s cateringem vyhoda",
    ],
    priority: "high" as const,
  },
  {
    title: "Vedouci bistra / Provoz",
    type: "DPP / 0.5 uvazek",
    hours: "Flexibilni, 20h/tyden",
    salary: "20 000 Kc/mes",
    responsibilities: [
      "Koordinace smenu",
      "Objednavky napoju a zasob",
      "Komunikace s dodavateli",
      "Reporting a kontrola",
      "Zastup za obsluhu",
    ],
    requirements: [
      "Organizacni schopnosti",
      "Zkusenost s provozem",
      "Zdravotni prukaz",
    ],
    priority: "high" as const,
  },
  {
    title: "Brigadnik 1",
    type: "DPP",
    hours: "Po-Pa 11:00-15:00 (turnus)",
    salary: "12 000 Kc/mes",
    responsibilities: [
      "Obsluha zakazniku",
      "Cepovani piva",
      "Udrzba cistoty",
      "Doplnovani zasob",
    ],
    requirements: ["Min. 18 let", "Zdravotni prukaz", "Prijemne vystupovani"],
    priority: "medium" as const,
  },
  {
    title: "Brigadnik 2",
    type: "DPP",
    hours: "Turnaje + vikendy",
    salary: "12 000 Kc/mes",
    responsibilities: [
      "Pomoc pri turnajovem cateringu",
      "Obsluha vikendy",
      "Priprava salonku",
      "Zastup za brigadnika 1",
    ],
    requirements: ["Min. 18 let", "Zdravotni prukaz", "Fyzicka zdatnost"],
    priority: "medium" as const,
  },
];

const SHIFT_PLAN = [
  { day: "Pondeli-Patek", morning: "Kuchar (6-14)", afternoon: "Brigadnik 1 (11-15)", evening: "—", note: "Vedouci flexibilne" },
  { day: "Turnajova So/Ne", morning: "Kuchar (7-15)", afternoon: "Brigadnik 1+2", evening: "Dle potřeby", note: "Catering rezim" },
  { day: "Bezna So/Ne", morning: "—", afternoon: "Brigadnik 1 (dle akci)", evening: "—", note: "Dle poptavky" },
];

export default function PersonnelPlan() {
  return (
    <div className="space-y-6">
      {/* Org overview */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Organizacni struktura
        </h3>
        <div className="flex flex-col items-center gap-2">
          <div className="bg-blue-100 text-blue-800 rounded-lg px-4 py-2 text-sm font-semibold border border-blue-200">
            Tomas Knopp — Vlastnik / CEO
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="bg-green-100 text-green-800 rounded-lg px-4 py-2 text-sm font-medium border border-green-200">
            Vedouci bistra (0.5 uvazek)
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex gap-3 flex-wrap justify-center">
            <div className="bg-amber-100 text-amber-800 rounded-lg px-3 py-1.5 text-sm border border-amber-200">
              Kuchar (HPP)
            </div>
            <div className="bg-gray-100 text-gray-700 rounded-lg px-3 py-1.5 text-sm border border-gray-200">
              Brigadnik 1
            </div>
            <div className="bg-gray-100 text-gray-700 rounded-lg px-3 py-1.5 text-sm border border-gray-200">
              Brigadnik 2
            </div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-muted">
            Celkove personalni naklady:{" "}
            <span className="font-semibold text-foreground">89 000 Kc/mes</span>
          </p>
        </div>
      </div>

      {/* Position details */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">
          Pozice a mzdy
        </h3>
        {POSITIONS.map((pos) => (
          <div
            key={pos.title}
            className="bg-white rounded-xl border border-border shadow-sm p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  {pos.title}
                </h4>
                <p className="text-xs text-muted mt-0.5">
                  {pos.type} | {pos.hours}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    pos.priority === "high"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {pos.priority === "high" ? "Prioritni" : "Standard"}
                </span>
                <span className="text-sm font-bold text-foreground">
                  {pos.salary}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-muted mb-1">
                  Zodpovednosti
                </p>
                <ul className="space-y-0.5">
                  {pos.responsibilities.map((r, i) => (
                    <li key={i} className="text-sm text-foreground flex items-start gap-1">
                      <span className="text-muted mt-1 flex-shrink-0 text-xs">&bull;</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-medium text-muted mb-1">
                  Pozadavky
                </p>
                <ul className="space-y-0.5">
                  {pos.requirements.map((r, i) => (
                    <li key={i} className="text-sm text-foreground flex items-start gap-1">
                      <span className="text-muted mt-1 flex-shrink-0 text-xs">&bull;</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Shift plan */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Smenovy plan
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-xs font-semibold text-muted">Den</th>
                <th className="text-left py-2 text-xs font-semibold text-muted">Rano</th>
                <th className="text-left py-2 text-xs font-semibold text-muted">Odpoledne</th>
                <th className="text-left py-2 text-xs font-semibold text-muted">Vecer</th>
                <th className="text-left py-2 text-xs font-semibold text-muted">Poznamka</th>
              </tr>
            </thead>
            <tbody>
              {SHIFT_PLAN.map((row) => (
                <tr key={row.day} className="border-b border-border">
                  <td className="py-2 font-medium text-foreground">{row.day}</td>
                  <td className="py-2 text-foreground">{row.morning}</td>
                  <td className="py-2 text-foreground">{row.afternoon}</td>
                  <td className="py-2 text-foreground">{row.evening}</td>
                  <td className="py-2 text-muted">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
