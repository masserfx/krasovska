export default function FinancialModel() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Rozklad pocatecni investice (Varianta B)
        </h3>
        <div className="space-y-2">
          {[
            { item: "Konvektomat / trouba", amount: 45000 },
            { item: "Chladicí vitrína", amount: 25000 },
            { item: "POS systém Dotykačka KOMPLET", amount: 18000 },
            { item: "Drobné vybavení kuchyně", amount: 20000 },
            { item: "Čepovací zařízení (spolufinancuje pivovar)", amount: 15000 },
            { item: "Nádobí, příbory, servírovací pomůcky", amount: 12000 },
            { item: "Počáteční zásoby surovin", amount: 35000 },
            { item: "Nápojový sklad (pivo, nealko, káva)", amount: 20000 },
            { item: "Grafika, cedule, menu tabule", amount: 10000 },
            { item: "Rezerva na nečekané výdaje", amount: 20000 },
          ].map((row) => (
            <div
              key={row.item}
              className="flex justify-between items-center py-1.5 border-b border-border last:border-0"
            >
              <span className="text-sm text-foreground">{row.item}</span>
              <span className="text-sm font-medium text-foreground tabular-nums">
                {row.amount.toLocaleString("cs-CZ")} Kc
              </span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-2 border-t-2 border-foreground">
            <span className="text-sm font-bold text-foreground">Celkem</span>
            <span className="text-sm font-bold text-foreground">
              220 000 Kc
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Mesicni naklady (plny provoz)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-xs font-medium text-muted mb-2 uppercase tracking-wider">
              Fixni naklady
            </h4>
            <div className="space-y-1.5">
              {[
                { item: "Kuchař (HPP)", amount: 45000 },
                { item: "Vedoucí bistra / provoz (0.5 úvazek)", amount: 20000 },
                { item: "Brigádníci (2x)", amount: 24000 },
                { item: "Energie, voda", amount: 15000 },
                { item: "Pojištění", amount: 3000 },
                { item: "POS licence + SW", amount: 1500 },
                { item: "Úklid, odpady", amount: 5000 },
              ].map((row) => (
                <div
                  key={row.item}
                  className="flex justify-between text-sm"
                >
                  <span className="text-foreground">{row.item}</span>
                  <span className="font-medium text-foreground tabular-nums">
                    {row.amount.toLocaleString("cs-CZ")} Kc
                  </span>
                </div>
              ))}
              <div className="flex justify-between pt-1 border-t border-border text-sm font-semibold">
                <span>Subtotal fixní</span>
                <span>113 500 Kc</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-medium text-muted mb-2 uppercase tracking-wider">
              Variabilni naklady
            </h4>
            <div className="space-y-1.5">
              {[
                { item: "Suroviny (food cost 32-35%)", amount: 50000 },
                { item: "Nápoje (nákupní cena)", amount: 10000 },
                { item: "Obaly, čisticí prostředky", amount: 5000 },
              ].map((row) => (
                <div
                  key={row.item}
                  className="flex justify-between text-sm"
                >
                  <span className="text-foreground">{row.item}</span>
                  <span className="font-medium text-foreground tabular-nums">
                    {row.amount.toLocaleString("cs-CZ")} Kc
                  </span>
                </div>
              ))}
              <div className="flex justify-between pt-1 border-t border-border text-sm font-semibold">
                <span>Subtotal variabilní</span>
                <span>65 000 Kc</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4 pt-3 border-t-2 border-foreground">
          <span className="font-bold text-foreground">Celkem mesicne</span>
          <span className="text-lg font-bold text-foreground">178 500 Kc</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Break-even analyza
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-xs text-blue-600 font-medium">Break-even mesicne</p>
            <p className="text-xl font-bold text-blue-900 mt-1">153 846 Kc</p>
            <p className="text-xs text-blue-600 mt-0.5">pri marzi 65%</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-xs text-green-600 font-medium">Break-even denne</p>
            <p className="text-xl font-bold text-green-900 mt-1">5 128 Kc</p>
            <p className="text-xs text-green-600 mt-0.5">30 dnu v mesici</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 text-center">
            <p className="text-xs text-amber-600 font-medium">Potreba zakazniku/den</p>
            <p className="text-xl font-bold text-amber-900 mt-1">34</p>
            <p className="text-xs text-amber-600 mt-0.5">pri prumernem utrace 150 Kc</p>
          </div>
        </div>

        <h4 className="text-xs font-medium text-muted mb-2 uppercase tracking-wider">
          Scenare trzeb
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-xs font-semibold text-muted">Scenar</th>
                <th className="text-right py-2 text-xs font-semibold text-muted">Trzby/mes</th>
                <th className="text-right py-2 text-xs font-semibold text-muted">Zisk/ztrata</th>
                <th className="text-right py-2 text-xs font-semibold text-muted">Zakazniku/den</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Pesimistický", revenue: 120000, customers: 27, color: "text-red-600" },
                { name: "Break-even", revenue: 153846, customers: 34, color: "text-amber-600" },
                { name: "Realistický", revenue: 200000, customers: 44, color: "text-green-600" },
                { name: "Optimistický", revenue: 280000, customers: 62, color: "text-green-700" },
                { name: "S cateringem", revenue: 350000, customers: 44, color: "text-blue-600" },
              ].map((s) => {
                const profit = s.revenue * 0.65 - 113500;
                return (
                  <tr key={s.name} className="border-b border-border">
                    <td className="py-2 text-foreground">{s.name}</td>
                    <td className="py-2 text-right font-medium tabular-nums">
                      {s.revenue.toLocaleString("cs-CZ")} Kc
                    </td>
                    <td className={`py-2 text-right font-medium tabular-nums ${s.color}`}>
                      {profit >= 0 ? "+" : ""}
                      {Math.round(profit).toLocaleString("cs-CZ")} Kc
                    </td>
                    <td className="py-2 text-right tabular-nums">{s.customers}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-900">
          <span className="font-semibold">Klicove zjisteni:</span> Turnajovy catering
          (vikendove akce pro 80-300 osob) muze zvysit mesicni trzby o 50-150K Kc
          bez pridavani staleho personalu. Je to nejvetsi paka pro rychle dosazeni
          break-even bodu.
        </p>
      </div>
    </div>
  );
}
