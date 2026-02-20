"use client";

import { useState } from "react";

interface CheckItem {
  id: string;
  title: string;
  description: string;
  responsible: string;
  deadline: string;
  status: "pending" | "in_progress" | "done";
}

const ITEMS: CheckItem[] = [
  {
    id: "zl",
    title: "Zivnostensky list — hostinska cinnost",
    description: "Overit platnost ZL, pripadne pozadat o rozsireni. Hostinska cinnost je remeslna zivnost — vyzaduje odbornou zpusobilost.",
    responsible: "Tomas Knopp",
    deadline: "02/2026",
    status: "in_progress",
  },
  {
    id: "haccp",
    title: "HACCP dokumentace",
    description: "Objednat u akreditovaneho konzultanta. Zahrnuje: analyzu rizik, kriticke body, monitorovaci postupy, napravna opatreni.",
    responsible: "HACCP konzultant",
    deadline: "03/2026",
    status: "pending",
  },
  {
    id: "khs",
    title: "Schvaleni KHS (Krajska hygienicka stanice)",
    description: "Kontrola provozovny pred zahajenim. KHS Plzen overuje: dispozice, vybaveni, vodni zdroj, odpady, HACCP.",
    responsible: "Tomas Knopp",
    deadline: "03/2026",
    status: "pending",
  },
  {
    id: "zdravotni_prukazy",
    title: "Zdravotni prukazy zamestnancu",
    description: "Vsichni zamestnanci v kontaktu s potravinami musi mit platny zdravotni prukaz. Zajistit u praktickych lekaru.",
    responsible: "Vedouci bistra",
    deadline: "03/2026",
    status: "pending",
  },
  {
    id: "revize",
    title: "Revize elektro a plynu",
    description: "Overit platnost revizich zprav pro kuchynske spotrebice, elektro rozvody a plynove instalace.",
    responsible: "Servisni technik",
    deadline: "03/2026",
    status: "pending",
  },
  {
    id: "pozarni",
    title: "Pozarni bezpecnost",
    description: "Kontrola a doplneni hasiccich pristroju, unikovych cest, pozarniho radu. Revize hasicich pristroju.",
    responsible: "Tomas Knopp",
    deadline: "03/2026",
    status: "pending",
  },
  {
    id: "pojisteni",
    title: "Pojisteni provozovny",
    description: "Pojisteni odpovednosti za skodu, pojisteni majetku, pojisteni preruseni provozu.",
    responsible: "Tomas Knopp",
    deadline: "04/2026",
    status: "pending",
  },
  {
    id: "osa",
    title: "OSA / Intergram licence",
    description: "Licence pro verejne produkci hudby v provozovne. Nutne pokud hraje radio/hudba v bistra.",
    responsible: "Vedouci bistra",
    deadline: "04/2026",
    status: "pending",
  },
  {
    id: "eet",
    title: "Evidence trzeb (EET / POS)",
    description: "POS system Dotykacka zajistuje automatickou evidenci trzeb. Overit spravne nastaveni DPH sazeb.",
    responsible: "IT",
    deadline: "04/2026",
    status: "pending",
  },
  {
    id: "odpady",
    title: "Smlouva na svoz odpadu",
    description: "Smlouva se svozovou firmou na komunalni a gastronomicky odpad. Separace oleje, bioodpadu.",
    responsible: "Tomas Knopp",
    deadline: "04/2026",
    status: "pending",
  },
];

const STATUS_CONFIG = {
  pending: { label: "Ceka", bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
  in_progress: { label: "Resim", bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  done: { label: "Hotovo", bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
};

export default function LegislativeChecklist() {
  const [items, setItems] = useState(ITEMS);

  function cycleStatus(id: string) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const order: CheckItem["status"][] = ["pending", "in_progress", "done"];
        const nextIdx = (order.indexOf(item.status) + 1) % order.length;
        return { ...item, status: order[nextIdx] };
      })
    );
  }

  const doneCount = items.filter((i) => i.status === "done").length;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-border shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            Legislativni pripravenost
          </span>
          <span className="text-sm font-semibold text-foreground">
            {doneCount} / {items.length}
          </span>
        </div>
        <div className="h-2 rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-green-500 transition-all"
            style={{ width: `${(doneCount / items.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const cfg = STATUS_CONFIG[item.status];
          return (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-border shadow-sm p-4"
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => cycleStatus(item.id)}
                  className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    item.status === "done"
                      ? "bg-green-500 border-green-500 text-white"
                      : item.status === "in_progress"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 bg-white"
                  }`}
                  title="Kliknete pro zmenu stavu"
                >
                  {item.status === "done" && (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {item.status === "in_progress" && (
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4
                      className={`text-sm font-semibold ${
                        item.status === "done"
                          ? "text-muted line-through"
                          : "text-foreground"
                      }`}
                    >
                      {item.title}
                    </h4>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.text}`}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-1">{item.description}</p>
                  <div className="flex gap-4 mt-2 text-xs text-muted">
                    <span>Zodpovedny: {item.responsible}</span>
                    <span>Termin: {item.deadline}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
