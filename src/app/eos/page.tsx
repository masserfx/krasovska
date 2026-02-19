"use client";

import { Suspense, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Printer,
  ClipboardList,
  Database,
  CreditCard,
  Wifi,
  Users,
  Shield,
  HelpCircle,
  Loader2,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";

interface CheckItem {
  id: string;
  question: string;
  detail?: string;
  why?: string;
}

interface CheckSection {
  title: string;
  icon: React.ReactNode;
  color: string;
  items: CheckItem[];
}

const sections: CheckSection[] = [
  {
    title: "Základní informace o EOS",
    icon: <Database className="h-5 w-5" />,
    color: "text-blue-600 bg-blue-50 border-blue-200",
    items: [
      {
        id: "eos-version",
        question: "Jaká verze EOS se používá? Kdo je dodavatel?",
        detail: "Název produktu, verze, webová adresa dodavatele, kontakt na podporu",
        why: "Potřebujeme zjistit, zda existuje API nebo exportní rozhraní",
      },
      {
        id: "eos-hosting",
        question: "Kde EOS běží? (cloud / lokální server / PC na recepci)",
        detail: "URL adresa systému, nebo lokální instalace?",
        why: "Ovlivňuje způsob integrace — cloud = API, lokální = export/import",
      },
      {
        id: "eos-license",
        question: "Jaký typ licence? Kolik uživatelů má přístup?",
        detail: "Měsíční/roční poplatek, počet licencí, omezení",
      },
      {
        id: "eos-login",
        question: "Kdo má přihlašovací údaje do EOS?",
        detail: "Admin účet, recepční účty, role v systému",
      },
    ],
  },
  {
    title: "Evidence členů",
    icon: <Users className="h-5 w-5" />,
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    items: [
      {
        id: "member-data",
        question: "Jaká data o členech EOS eviduje?",
        detail: "Jméno, email, telefon, adresa, datum narození, foto, poznámky...",
        why: "Potřebujeme vědět, co můžeme synchronizovat do našeho systému",
      },
      {
        id: "member-count",
        question: "Kolik členů je aktuálně v databázi? (aktivních / celkem)",
        detail: "Uváděno 350 aktivních — souhlasí?",
      },
      {
        id: "member-types",
        question: "Jaké typy členství existují?",
        detail: "Dospělí, mládež, rodinné, VIP, trenéři, jednorázové...",
        why: "Ovlivňuje cenovou politiku v e-shopu a kreditním systému",
      },
      {
        id: "member-history",
        question: "Eviduje EOS historii návštěv / vstupů?",
        detail: "Kdy člen přišel/odešel, na jaký kurt, jak dlouho",
      },
      {
        id: "member-export",
        question: "Lze exportovat seznam členů? V jakém formátu?",
        detail: "CSV, Excel, PDF, API endpoint? Jak často se aktualizuje?",
        why: "Klíčové pro počáteční import dat do našeho systému",
      },
    ],
  },
  {
    title: "RFID karty a čtečky",
    icon: <CreditCard className="h-5 w-5" />,
    color: "text-violet-600 bg-violet-50 border-violet-200",
    items: [
      {
        id: "rfid-type",
        question: "Jaký typ RFID čipů/karet se používá?",
        detail: "Mifare Classic, Mifare DESFire, EM4100, HID iClass, NFC...?",
        why: "Určuje kompatibilitu s naším systémem a bezpečnost",
      },
      {
        id: "rfid-uid",
        question: "Co je na kartě uloženo? Jen UID, nebo i data?",
        detail: "Číslo karty = UID čipu, nebo vlastní číslo zapsané v paměti karty?",
      },
      {
        id: "rfid-reader",
        question: "Jaké čtečky jsou na recepci? Kolik kusů?",
        detail: "Výrobce, model, rozhraní (USB HID / serial / síťové)",
        why: "USB HID čtečky posílají číslo karty jako klávesnici — snadno integrovatelné",
      },
      {
        id: "rfid-reader-output",
        question: "Co čtečka pošle do PC při přiložení karty?",
        detail: "Číslo (hex/dec), délka, ukončení (Enter?). Lze otestovat v Notepadu.",
        why: "Test: otevřít Notepad, přiložit kartu ke čtečce, zapsat co se zobrazí",
      },
      {
        id: "rfid-spare",
        question: "Jsou k dispozici prázdné karty pro nové členy?",
        detail: "Kolik kusů na skladě? Kde se objednávají? Cena za kus?",
      },
    ],
  },
  {
    title: "Platby a finance v EOS",
    icon: <CreditCard className="h-5 w-5" />,
    color: "text-amber-600 bg-amber-50 border-amber-200",
    items: [
      {
        id: "payment-types",
        question: "Jaké platby EOS eviduje?",
        detail: "Členské příspěvky, jednorázové vstupy, pronájem kurtů, kurzy...",
      },
      {
        id: "payment-methods",
        question: "Jakými způsoby členové platí?",
        detail: "Hotovost na recepci, převod, faktura, terminál, jiné?",
      },
      {
        id: "payment-credit",
        question: "Má EOS funkci předplaceného kreditu / peněženky?",
        detail: "Pokud ano — jak funguje? Pokud ne — je to požadovaná funkce?",
        why: "Pokud EOS nemá kredit, implementujeme vlastní. Pokud má, propojíme.",
      },
      {
        id: "payment-reports",
        question: "Generuje EOS finanční reporty / přehledy?",
        detail: "Denní tržby, měsíční přehledy, export pro účetní?",
      },
    ],
  },
  {
    title: "Integrace a API",
    icon: <Wifi className="h-5 w-5" />,
    color: "text-rose-600 bg-rose-50 border-rose-200",
    items: [
      {
        id: "api-exists",
        question: "Má EOS REST API nebo jiné programové rozhraní?",
        detail: "Dokumentace API? URL endpointy? Autentizace (API klíč, OAuth)?",
        why: "API = nejlepší způsob integrace. Bez API budeme muset řešit export/import.",
      },
      {
        id: "api-webhooks",
        question: "Podporuje EOS webhooky / notifikace?",
        detail: "Upozornění při novém členovi, platbě, expirace členství...",
      },
      {
        id: "api-isport",
        question: "Je EOS propojený s iSport.cz?",
        detail: "Synchronizace rezervací, členů, vstupů mezi systémy?",
      },
      {
        id: "api-other",
        question: "Je EOS propojený s dalšími systémy?",
        detail: "Účetní SW, banka, turniket/brána, kamerový systém?",
      },
    ],
  },
  {
    title: "Provozní workflow",
    icon: <ClipboardList className="h-5 w-5" />,
    color: "text-teal-600 bg-teal-50 border-teal-200",
    items: [
      {
        id: "workflow-checkin",
        question: "Jak probíhá příchod člena? (krok za krokem)",
        detail: "Přiloží kartu → co se stane? Zobrazí se jméno? Odečte se vstup?",
        why: "Pochopení workflow = základ pro návrh integrace",
      },
      {
        id: "workflow-new-member",
        question: "Jak se registruje nový člen?",
        detail: "Kdo zadává data? Na recepci / online? Jak dostane kartu?",
      },
      {
        id: "workflow-payment",
        question: "Jak se eviduje platba na recepci?",
        detail: "Recepční otevře EOS → vybere člena → zadá platbu? Nebo jinak?",
      },
      {
        id: "workflow-problems",
        question: "Jaké jsou nejčastější problémy s EOS?",
        detail: "Co nefunguje, co chybí, co zdržuje, co frustruje?",
        why: "Příležitost vyřešit bolesti vlastním systémem",
      },
    ],
  },
  {
    title: "Bezpečnost a GDPR",
    icon: <Shield className="h-5 w-5" />,
    color: "text-slate-600 bg-slate-50 border-slate-200",
    items: [
      {
        id: "gdpr-consent",
        question: "Mají členové podepsaný souhlas se zpracováním údajů?",
        detail: "Papírově / elektronicky? Zahrnuje předání dat třetí straně?",
        why: "Synchronizace dat do našeho systému = zpracování osobních údajů",
      },
      {
        id: "gdpr-children",
        question: "Jak se řeší data dětí / mládeže?",
        detail: "Souhlas zákonného zástupce, zvláštní kategorie údajů",
      },
      {
        id: "gdpr-backup",
        question: "Zálohují se data z EOS? Jak a kam?",
        detail: "Automatické zálohy, frekvence, umístění",
      },
    ],
  },
  {
    title: "Budoucnost a rozhodnutí",
    icon: <HelpCircle className="h-5 w-5" />,
    color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    items: [
      {
        id: "future-keep",
        question: "Plánujete EOS nadále používat, nebo nahradit?",
        detail: "Spokojenost s EOS? Cenová náročnost? Důvody pro/proti změně?",
        why: "Určuje strategii: integrace (propojíme) vs. migrace (nahradíme)",
      },
      {
        id: "future-features",
        question: "Co v EOS chybí a chtěli byste?",
        detail: "Funkce, které byste ocenili — online registrace, e-shop, bistro...",
      },
      {
        id: "future-timeline",
        question: "Kdy končí smlouva / licence na EOS?",
        detail: "Výpovědní lhůta, automatické prodloužení?",
      },
    ],
  },
];

function EosContent() {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [showNotes, setShowNotes] = useState<string | null>(null);

  const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0);
  const checkedCount = checked.size;
  const progress = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0;

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            EOS — Checklist pro schůzku
          </h2>
          <p className="text-sm text-muted">
            Příprava na integraci se systémem správy členů
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-foreground hover:bg-background print:hidden"
        >
          <Printer className="h-4 w-4" />
          Tisk
        </button>
      </div>

      {/* Progress */}
      <div className="mb-6 rounded-xl border border-border bg-white p-4 shadow-sm print:border-0 print:p-0 print:shadow-none">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">
            Zodpovězeno {checkedCount} z {totalItems} otázek
          </span>
          <span className="font-bold text-primary">{progress.toFixed(0)} %</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-background">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Context box */}
      <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 print:border-blue-300">
        <strong className="block mb-1">Kontext schůzky</strong>
        Hala Krašovská aktuálně používá systém <strong>EOS</strong> pro evidenci
        350 aktivních členů s RFID kartami. Plánujeme propojení e-shopu a
        kreditního systému s existující členskou databází. Cíl: člen přiloží
        kartu na recepci → identifikace → platba kreditem / zobrazení info.
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {sections.map((section) => {
          const sectionChecked = section.items.filter((i) =>
            checked.has(i.id)
          ).length;

          return (
            <div
              key={section.title}
              className="rounded-xl border border-border bg-white shadow-sm print:break-inside-avoid print:shadow-none"
            >
              {/* Section header */}
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border ${section.color}`}
                  >
                    {section.icon}
                  </div>
                  <h3 className="font-semibold text-foreground">
                    {section.title}
                  </h3>
                </div>
                <span className="text-xs text-muted">
                  {sectionChecked}/{section.items.length}
                </span>
              </div>

              {/* Items */}
              <div className="divide-y divide-border/50">
                {section.items.map((item) => {
                  const isChecked = checked.has(item.id);
                  const hasNote = !!notes[item.id]?.trim();

                  return (
                    <div key={item.id} className="px-5 py-3">
                      <div className="flex gap-3">
                        <button
                          onClick={() => toggle(item.id)}
                          className={`mt-0.5 flex-shrink-0 print:hidden ${
                            isChecked ? "text-green-500" : "text-border"
                          }`}
                        >
                          {isChecked ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <Circle className="h-5 w-5" />
                          )}
                        </button>
                        {/* Print checkbox */}
                        <span className="mt-0.5 hidden flex-shrink-0 print:inline-block">
                          {isChecked ? "\u2611" : "\u2610"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div
                            className={`font-medium ${
                              isChecked
                                ? "text-muted line-through"
                                : "text-foreground"
                            }`}
                          >
                            {item.question}
                          </div>
                          {item.detail && (
                            <div className="mt-0.5 text-sm text-muted">
                              {item.detail}
                            </div>
                          )}
                          {item.why && (
                            <div className="mt-1 text-xs text-primary/70 italic">
                              Proč: {item.why}
                            </div>
                          )}

                          {/* Notes */}
                          {showNotes === item.id && (
                            <textarea
                              value={notes[item.id] || ""}
                              onChange={(e) =>
                                setNotes((prev) => ({
                                  ...prev,
                                  [item.id]: e.target.value,
                                }))
                              }
                              placeholder="Poznámky ze schůzky..."
                              rows={2}
                              className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none print:hidden"
                            />
                          )}
                          {hasNote && showNotes !== item.id && (
                            <div className="mt-1 rounded bg-amber-50 px-2 py-1 text-xs text-amber-800">
                              {notes[item.id]}
                            </div>
                          )}

                          <button
                            onClick={() =>
                              setShowNotes(
                                showNotes === item.id ? null : item.id
                              )
                            }
                            className="mt-1 text-xs text-muted hover:text-primary print:hidden"
                          >
                            {showNotes === item.id
                              ? "Skrýt poznámku"
                              : hasNote
                                ? "Upravit poznámku"
                                : "+ Poznámka"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer info */}
      <div className="mt-8 rounded-xl border border-border bg-background p-5 text-sm text-muted print:mt-4">
        <strong className="block mb-2 text-foreground">Po schůzce — další kroky:</strong>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Získat vzorový export dat z EOS (anonymizovaný CSV/Excel)</li>
          <li>Otestovat RFID čtečku — otevřít Notepad, přiložit kartu, zapsat výstup</li>
          <li>Kontaktovat dodavatele EOS ohledně API dokumentace</li>
          <li>Rozhodnout strategii: integrace (propojení) vs. migrace (náhrada)</li>
          <li>Na základě odpovědí navrhnout technické řešení Sprint 6</li>
        </ol>
      </div>
    </>
  );
}

export default function EosChecklistPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader activeTab="eos" />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <Suspense
          fallback={
            <div className="flex min-h-[60vh] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted" />
            </div>
          }
        >
          <EosContent />
        </Suspense>
      </main>
    </div>
  );
}
