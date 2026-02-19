const PHASES = [
  {
    title: "Pre-launch (M1-M2)",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    activities: [
      "Teaser na sociálních sítích (FB, IG)",
      "Info na webu Hala Krašovská",
      "Email členům klubu",
      "Plakáty v hale a na recepcí",
      "QR kód s předběžným menu",
    ],
  },
  {
    title: "Grand Opening (M3)",
    color: "bg-green-100 text-green-800 border-green-200",
    activities: [
      "Slavnostní otevření — akční ceny první týden",
      "Ochutnávky zdarma pro členy",
      "PR článek do lokálních médií",
      "Spolupráce s influencery (sport/gastro)",
      "Soutěž na IG (oběd zdarma pro 10 výherců)",
    ],
  },
  {
    title: "Ongoing (M4+)",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    activities: [
      "Věrnostní program — 10. oběd zdarma",
      "Denní menu na webu + FB/IG stories",
      "Google My Business profil + recenze",
      "Wolt/Bolt registrace pro rozšíření dosahu",
      "Cross-promo s turnaji a kempy",
    ],
  },
];

const SEASONAL = [
  { event: "Letní kempy", period: "Červenec-Srpen", desc: "Catering pro dětské kempy, 50-100 obědů/den", impact: "+40K/měs" },
  { event: "Back to Sport", period: "Září", desc: "Akční nabídka start nové sezóny", impact: "+20K" },
  { event: "Halloween party", period: "Říjen", desc: "Tematický menu, dekorace, family event", impact: "+15K" },
  { event: "Vánoční turnaje", period: "Prosinec", desc: "Vánoční menu, svařák, cukroví, catering", impact: "+60K" },
  { event: "Turnajový catering", period: "Celoročně", desc: "Víkendové turnaje 80-300 osob, buffet/boxy", impact: "+50-150K/měs" },
];

export default function MarketingPlan() {
  return (
    <div className="space-y-6">
      {/* Marketing phases */}
      <div className="space-y-4">
        {PHASES.map((phase) => (
          <div
            key={phase.title}
            className="bg-white rounded-xl border border-border shadow-sm p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${phase.color}`}
              >
                {phase.title}
              </span>
            </div>
            <ul className="space-y-1.5">
              {phase.activities.map((a, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-foreground"
                >
                  <span className="text-muted mt-0.5 flex-shrink-0">&bull;</span>
                  {a}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Seasonal events */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Sezonni akce a turnajovy catering
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-xs font-semibold text-muted">
                  Akce
                </th>
                <th className="text-left py-2 text-xs font-semibold text-muted">
                  Obdobi
                </th>
                <th className="text-left py-2 text-xs font-semibold text-muted">
                  Popis
                </th>
                <th className="text-right py-2 text-xs font-semibold text-muted">
                  Odhadovany dopad
                </th>
              </tr>
            </thead>
            <tbody>
              {SEASONAL.map((s) => (
                <tr key={s.event} className="border-b border-border">
                  <td className="py-2 font-medium text-foreground">
                    {s.event}
                  </td>
                  <td className="py-2 text-foreground">{s.period}</td>
                  <td className="py-2 text-muted">{s.desc}</td>
                  <td className="py-2 text-right font-semibold text-green-600">
                    {s.impact}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Catering upsell highlight */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">Turnajovy catering upsell:</span>{" "}
          Kazdy turnaj (80-300 hracu) = prilezitost pro catering.
          Nabidka: buffet (120 Kc/os), lunch boxy (89 Kc/ks), napojove balicky.
          Automaticka nabidka pri registraci turnaje.
        </p>
      </div>
    </div>
  );
}
