export default function ExecutiveSummary() {
  return (
    <div className="space-y-6">
      {/* Recommendation banner */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">&#9989;</span>
          <div>
            <h3 className="text-lg font-bold text-green-900">
              Doporuceni: Varianta B — Standard Bistro
            </h3>
            <p className="text-sm text-green-800 mt-1">
              Nejlepsi pomer investice vs. vystup. Plny servis s kucharem, siroky sortiment,
              turnajovy catering. Moznost budouciho rozsireni na Variantu C.
            </p>
          </div>
        </div>
      </div>

      {/* 3 key figures */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-border shadow-sm p-6 text-center">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">
            Pocatecni investice
          </p>
          <p className="text-3xl font-bold text-foreground mt-2">220 000 Kc</p>
          <p className="text-xs text-muted mt-1">Vybaveni + zasoby + reserve</p>
        </div>
        <div className="bg-white rounded-xl border border-border shadow-sm p-6 text-center">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">
            Mesicni naklady
          </p>
          <p className="text-3xl font-bold text-foreground mt-2">178 500 Kc</p>
          <p className="text-xs text-muted mt-1">Personal + suroviny + provoz</p>
        </div>
        <div className="bg-white rounded-xl border border-border shadow-sm p-6 text-center">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">
            Break-even
          </p>
          <p className="text-3xl font-bold text-foreground mt-2">153 846 Kc</p>
          <p className="text-xs text-muted mt-1">Mesicni trzby pro nulovy bod</p>
        </div>
      </div>

      {/* Timeline overview */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Harmonogram spusteni</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { phase: "Phase 0", title: "Quick Start", period: "02-03/2026", color: "bg-blue-100 text-blue-800 border-blue-200" },
            { phase: "Phase 1", title: "MVP \u2192 Standard", period: "04/2026", color: "bg-green-100 text-green-800 border-green-200" },
            { phase: "Phase 2", title: "Standard \u2192 Full", period: "05-06/2026", color: "bg-amber-100 text-amber-800 border-amber-200" },
            { phase: "Phase 3", title: "Full Operace", period: "07-12/2026", color: "bg-purple-100 text-purple-800 border-purple-200" },
          ].map((p) => (
            <div key={p.phase} className={`rounded-lg border p-3 ${p.color}`}>
              <p className="text-xs font-semibold">{p.phase}</p>
              <p className="text-sm font-bold mt-0.5">{p.title}</p>
              <p className="text-xs mt-1 opacity-80">{p.period}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Key insight */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-900">
          <span className="font-semibold">Klicovy zaver:</span> Turnajovy catering
          (80-300 osob) je nejvetsi prilezitost — zvysuje trzby o 30-50% behem
          turnajovych vikendovych dni bez pridavani staleho personalu.
        </p>
      </div>
    </div>
  );
}
