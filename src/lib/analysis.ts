import { FormData, AnalysisResult, Insight, Metric, RecommendedProject, Priority } from "@/types";
import { getStrategicData } from "./strategic-data";

// Helper to safely get a string value from form data
function getString(data: FormData, section: string, field: string): string {
  const val = data?.[section]?.[field];
  if (Array.isArray(val)) return val.join(", ");
  return (val as string) || "";
}

// Helper to safely get an array value from form data
function getArray(data: FormData, section: string, field: string): string[] {
  const val = data?.[section]?.[field];
  if (Array.isArray(val)) return val;
  if (typeof val === "string" && val) return [val];
  return [];
}

// Helper to safely get a numeric value from form data
function getNumber(data: FormData, section: string, field: string): number {
  const val = data?.[section]?.[field];
  const num = Number(val);
  return isNaN(num) ? 0 : num;
}

// Count filled sections
function countFilledSections(data: FormData): number {
  let count = 0;
  for (const section of Object.keys(data)) {
    const fields = data[section];
    const hasValues = Object.values(fields).some((v) =>
      Array.isArray(v) ? v.length > 0 : v !== "" && v !== undefined
    );
    if (hasValues) count++;
  }
  return count;
}

export function generateAnalysis(formData: FormData): AnalysisResult {
  const metrics: Metric[] = [];
  const insights: Insight[] = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const opportunities: string[] = [];
  const threats: string[] = [];
  const recommendedProjects: RecommendedProject[] = [];

  let insightCounter = 0;
  const addInsight = (
    section: string,
    type: Insight["type"],
    title: string,
    description: string,
    priority: Priority
  ) => {
    insights.push({ id: `insight-${++insightCounter}`, section, type, title, description, priority });
  };

  // --- General metrics ---
  const filledSections = countFilledSections(formData);
  metrics.push({ id: "m-sections", label: "Vyplněné sekce", value: filledSections, unit: "/ 14" });

  // --- FINANCE analysis ---
  const mainIncome = getArray(formData, "finance", "hlavni_prijmy");
  const incomeShare = getString(formData, "finance", "podil_prijmu");
  const grants = getString(formData, "finance", "dotace_granty");
  const paymentMethods = getArray(formData, "finance", "platebni_metody");
  const wantedPayments = getArray(formData, "finance", "pozadovane_platby");
  const accountingSystem = getString(formData, "finance", "ucetni_system");
  const annualTurnover = getString(formData, "finance", "rocni_obrat");

  if (mainIncome.length > 0) {
    metrics.push({ id: "m-income-sources", label: "Zdroje příjmů", value: mainIncome.length });
  }
  if (annualTurnover) {
    metrics.push({ id: "m-turnover", label: "Roční obrat", value: annualTurnover });
  }

  // Revenue concentration check
  if (incomeShare) {
    const percentages = incomeShare.match(/(\d+)\s*%/g);
    if (percentages) {
      const values = percentages.map((p) => parseInt(p));
      const maxShare = Math.max(...values);
      if (maxShare > 60) {
        addInsight("finance", "threat", "Vysoká koncentrace příjmů",
          `Jeden zdroj příjmů tvoří ${maxShare}% obratu. Diverzifikace příjmů sníží riziko výpadku.`, "high");
        threats.push(`Koncentrace příjmů — jeden zdroj tvoří ${maxShare}%`);
      } else if (values.length >= 3) {
        addInsight("finance", "strength", "Diverzifikované příjmy",
          `Organizace má ${values.length} zdrojů příjmů s rozumným rozložením.`, "low");
        strengths.push("Diverzifikované zdroje příjmů");
      }
    }
  }

  // Grants usage
  if (mainIncome.includes("Dotace a granty")) {
    if (grants) {
      strengths.push("Aktivní čerpání dotací a grantů");
      addInsight("finance", "strength", "Dotační aktivita",
        `Organizace aktivně čerpá dotace: ${grants.substring(0, 100)}...`, "medium");
    }
  } else {
    opportunities.push("Nevyužitý potenciál dotací a grantů");
    addInsight("finance", "opportunity", "Nevyužité dotace",
      "Organizace aktuálně nečerpá dotace. Existují programy MŠMT, NSA, krajské a městské dotace pro sportovní organizace.", "high");
  }

  // Payment methods gap
  if (paymentMethods.length > 0 && wantedPayments.length > 0) {
    const missing = wantedPayments.filter((w) => !paymentMethods.includes(w));
    if (missing.length > 0) {
      addInsight("finance", "opportunity", "Rozšíření platebních metod",
        `Chybějící požadované platební metody: ${missing.join(", ")}`, "medium");
      opportunities.push("Modernizace platebních metod");
    }
  }
  if (paymentMethods.length > 0 && !paymentMethods.includes("Online platba (kartou)")) {
    addInsight("finance", "weakness", "Chybí online platby",
      "Organizace nepřijímá online platby kartou, což omezuje možnosti e-shopu a online rezervací.", "high");
    weaknesses.push("Chybí online platby kartou");
  }

  // Accounting system
  if (accountingSystem === "Excel" || accountingSystem === "Žádný") {
    addInsight("finance", "weakness", "Nedostatečný účetní systém",
      `Aktuální účetní systém: ${accountingSystem}. Profesionální účetní software zefektivní správu financí.`, "medium");
    weaknesses.push(`Účetní systém: ${accountingSystem}`);
  }

  // --- PERSONAL analysis ---
  const hppCount = getNumber(formData, "personal", "pocet_zamestnancu_hpp");
  const dppCount = getNumber(formData, "personal", "pocet_dpp_dpc");
  const externCount = getNumber(formData, "personal", "pocet_externisti");
  const volunteerCount = getNumber(formData, "personal", "pocet_dobrovolnici");
  const expansionPlan = getString(formData, "personal", "plan_rozsireni");

  const totalStaff = hppCount + dppCount + externCount;
  if (totalStaff > 0) {
    metrics.push({ id: "m-staff", label: "Celkem pracovníků", value: totalStaff });
    metrics.push({ id: "m-hpp", label: "HPP zaměstnanci", value: hppCount });

    const hppRatio = totalStaff > 0 ? Math.round((hppCount / totalStaff) * 100) : 0;
    metrics.push({ id: "m-hpp-ratio", label: "Podíl HPP", value: hppRatio, unit: "%" });

    if (hppRatio < 30 && totalStaff > 3) {
      addInsight("personal", "threat", "Nízký podíl HPP zaměstnanců",
        `Pouze ${hppRatio}% pracovníků je na HPP (${hppCount} z ${totalStaff}). Vysoká závislost na DPP/DPČ a externistech zvyšuje personální riziko.`, "medium");
      threats.push(`Nízký podíl HPP (${hppRatio}%)`);
    }
  }

  if (volunteerCount > 0) {
    metrics.push({ id: "m-volunteers", label: "Dobrovolníci", value: volunteerCount });
    strengths.push(`Dobrovolnická základna: ${volunteerCount} osob`);
  } else if (totalStaff > 0) {
    opportunities.push("Budování dobrovolnické základny");
  }

  if (expansionPlan) {
    addInsight("personal", "info", "Plán rozšíření personálu",
      expansionPlan, "medium");
    recommendedProjects.push({
      title: "Rozšíření personálu",
      description: `Realizace plánu rozšíření: ${expansionPlan.substring(0, 150)}`,
      category: "operations",
      priority: "medium",
      tasks: [
        "Definovat požadavky na nové pozice",
        "Připravit inzeráty a výběrové řízení",
        "Zajistit onboarding nových pracovníků",
        "Aktualizovat organizační strukturu",
      ],
    });
  }

  // --- SPORTOVISTE analysis ---
  const facilities = getString(formData, "sportoviste", "prehled_prostor");
  const investmentPlan = getString(formData, "sportoviste", "plan_investice");
  const accessibility = getString(formData, "sportoviste", "pristupnost");

  if (facilities) {
    addInsight("sportoviste", "info", "Přehled sportovišť", facilities.substring(0, 200), "low");
    strengths.push("Existující sportovní infrastruktura");
  }

  if (accessibility === "Bariérové") {
    addInsight("sportoviste", "weakness", "Bariérovost prostor",
      "Prostory nejsou bezbariérové, což omezuje přístup pro osoby s omezenou pohyblivostí.", "medium");
    weaknesses.push("Bariérové prostory");
  }

  if (investmentPlan) {
    addInsight("sportoviste", "opportunity", "Plánované investice do prostor",
      investmentPlan.substring(0, 200), "medium");
    recommendedProjects.push({
      title: "Modernizace sportovišť",
      description: investmentPlan.substring(0, 200),
      category: "infrastructure",
      priority: "medium",
      tasks: [
        "Zpracovat projektovou dokumentaci",
        "Zajistit financování (dotace, vlastní zdroje)",
        "Vybrat dodavatele",
        "Realizace stavebních prací",
        "Kolaudace a uvedení do provozu",
      ],
    });
  }

  // --- IT analysis ---
  const itSupport = getString(formData, "it", "it_podpora");
  const backupStatus = getString(formData, "it", "zalohovani");
  const network = getString(formData, "it", "sit");

  if (itSupport) {
    metrics.push({ id: "m-it-support", label: "IT podpora", value: itSupport });
  }

  if (itSupport === "Nemáme" || itSupport === "Ad-hoc (zavoláme někoho)") {
    addInsight("it", "weakness", "Nedostatečná IT podpora",
      `IT podpora: "${itSupport}". Pro provoz komplexního systému je potřeba zajistit systematickou IT podporu.`, "high");
    weaknesses.push(`IT podpora: ${itSupport}`);
  }

  if (backupStatus === "Nezálohujeme") {
    addInsight("it", "threat", "Chybí zálohování dat",
      "Data nejsou zálohována. Riziko ztráty dat při selhání hardware nebo kybernetickém útoku.", "critical");
    threats.push("Žádné zálohování dat");
    recommendedProjects.push({
      title: "Implementace zálohování dat",
      description: "Zavedení automatického zálohování dat pro ochranu před ztrátou.",
      category: "infrastructure",
      priority: "critical",
      tasks: [
        "Audit aktuálních dat a systémů",
        "Výběr zálohovacího řešení (cloud / lokální)",
        "Nastavení automatických záloh",
        "Testování obnovy dat",
        "Dokumentace zálohovacího plánu",
      ],
    });
  } else if (backupStatus === "Ruční zálohy") {
    addInsight("it", "weakness", "Ruční zálohování",
      "Ruční zálohy jsou nespolehlivé. Doporučujeme automatizaci.", "medium");
    weaknesses.push("Pouze ruční zálohování");
  }

  // --- REZERVACE analysis ---
  const currentReservation = getString(formData, "rezervace", "aktualni_system");
  const reservationProblems = getString(formData, "rezervace", "problemy_soucasny");
  const reservationRequirements = getArray(formData, "rezervace", "pozadavky_novy");

  if (currentReservation) {
    const isManual = currentReservation.toLowerCase().includes("tabulk") ||
      currentReservation.toLowerCase().includes("telefon") ||
      currentReservation.toLowerCase().includes("excel") ||
      currentReservation.toLowerCase().includes("papír");

    if (isManual) {
      addInsight("rezervace", "weakness", "Manuální rezervační systém",
        `Aktuální systém: "${currentReservation}". Manuální správa rezervací je neefektivní a náchylná k chybám.`, "high");
      weaknesses.push("Manuální rezervační systém");

      recommendedProjects.push({
        title: "Implementace online rezervačního systému",
        description: "Nasazení moderního online rezervačního systému s automatizací a notifikacemi.",
        category: "development",
        priority: "high",
        tasks: [
          "Analýza požadavků na rezervační systém",
          "Výběr technologického řešení",
          "Implementace online rezervací",
          "Integrace platební brány",
          "Migrace stávajících rezervací",
          "Školení personálu",
          "Testovací provoz",
        ],
      });
    }
  }

  if (reservationRequirements.includes("Online rezervace 24/7") && currentReservation &&
    !currentReservation.toLowerCase().includes("online")) {
    opportunities.push("Zavedení online rezervací 24/7");
  }

  // --- CLENSTVI / CRM analysis ---
  const memberCount = getNumber(formData, "clenstvi", "pocet_clenu");
  const memberEvidence = getString(formData, "clenstvi", "clenska_evidence");
  const crmRequirements = getArray(formData, "clenstvi", "pozadavky_crm");

  if (memberCount > 0) {
    metrics.push({ id: "m-members", label: "Aktivní členové", value: memberCount });
  }

  if (memberEvidence === "Excel / tabulky" || memberEvidence === "Papírová evidence" || memberEvidence === "Není systematicky vedena") {
    addInsight("clenstvi", "weakness", "Nedostatečná evidence členů",
      `Evidence členů: "${memberEvidence}". Pro efektivní CRM je potřeba systematická digitální evidence.`, "medium");
    weaknesses.push(`Evidence členů: ${memberEvidence}`);
  }

  if (crmRequirements.length > 3) {
    addInsight("clenstvi", "opportunity", "Komplexní CRM požadavky",
      `Identifikováno ${crmRequirements.length} požadavků na CRM: ${crmRequirements.join(", ")}`, "medium");

    recommendedProjects.push({
      title: "Nasazení CRM systému",
      description: "Implementace CRM pro správu členů, komunikaci a věrnostní programy.",
      category: "development",
      priority: "medium",
      tasks: [
        "Definice datového modelu členů",
        "Import stávající evidence",
        "Nastavení komunikačních kanálů",
        "Implementace členských programů",
        "Integrace s rezervačním systémem",
      ],
    });
  }

  // --- MARKETING analysis ---
  const socialMedia = getArray(formData, "marketing", "socialni_site");
  const newsletter = getString(formData, "marketing", "newsletter");
  const branding = getString(formData, "marketing", "branding");
  const website = getString(formData, "marketing", "web_aktualni");

  if (socialMedia.length > 0) {
    metrics.push({ id: "m-social", label: "Sociální sítě", value: socialMedia.length });
    if (socialMedia.length >= 3) {
      strengths.push(`Přítomnost na ${socialMedia.length} sociálních sítích`);
    }
  } else {
    addInsight("marketing", "weakness", "Absence na sociálních sítích",
      "Organizace není přítomna na žádné sociální síti, čímž přichází o významný marketingový kanál.", "high");
    weaknesses.push("Žádná přítomnost na sociálních sítích");
  }

  if (!socialMedia.includes("Instagram")) {
    addInsight("marketing", "opportunity", "Instagram marketing",
      "Instagram je klíčová platforma pro sportovní organizace. Vizuální obsah z tréninků a turnajů přitáhne nové členy.", "medium");
    opportunities.push("Založení a správa Instagramu");
  }

  if (!newsletter || newsletter.toLowerCase().includes("ne") || newsletter.toLowerCase().includes("žádný")) {
    addInsight("marketing", "opportunity", "Newsletter marketing",
      "Newsletter je efektivní kanál pro komunikaci s členy. Pravidelný newsletter zvýší retenci a informovanost.", "medium");
    opportunities.push("Zavedení newsletteru");
  }

  if (!branding || branding.toLowerCase().includes("ne") || branding.toLowerCase().includes("žádný")) {
    addInsight("marketing", "weakness", "Chybí vizuální identita",
      "Absence brand manuálu a jednotné vizuální identity oslabuje profesionální vnímání organizace.", "medium");
    weaknesses.push("Chybí brand manual / vizuální identita");

    recommendedProjects.push({
      title: "Vytvoření vizuální identity a brand manuálu",
      description: "Profesionální branding: logo, barvy, typografie, šablony pro tiskové materiály.",
      category: "marketing",
      priority: "medium",
      tasks: [
        "Výběr grafického studia / designéra",
        "Definice brandových hodnot a positioningu",
        "Návrh loga a vizuálního stylu",
        "Zpracování brand manuálu",
        "Aplikace na web, tisk, sociální sítě",
      ],
    });
  }

  if (website) {
    addInsight("marketing", "info", "Webová prezentace", website.substring(0, 200), "low");
  }

  // --- RESTAURACE analysis ---
  const restaurantType = getString(formData, "restaurace", "typ_provozu");
  const catering = getString(formData, "restaurace", "catering");
  const restaurantOperator = getString(formData, "restaurace", "provozovatel");

  if (restaurantType === "Pouze nápoje" || restaurantType === "Automat / vending") {
    addInsight("restaurace", "opportunity", "Rozšíření gastronomie",
      `Aktuální provoz: "${restaurantType}". Rozšíření na bistro/bufet může zvýšit příjmy a atraktivitu haly.`, "medium");
    opportunities.push("Rozšíření gastronomického provozu");
  }

  if (catering && !catering.toLowerCase().includes("ne")) {
    strengths.push("Cateringové služby pro akce");
  } else if (restaurantType && restaurantType !== "Pouze nápoje" && restaurantType !== "Automat / vending") {
    addInsight("restaurace", "opportunity", "Catering pro akce",
      "Organizace pořádá turnaje a akce — catering může být doplňkový zdroj příjmů.", "low");
    opportunities.push("Zavedení cateringových služeb");
  }

  // --- CILE (goals) analysis → recommended projects ---
  const mainGoal = getString(formData, "cile", "hlavni_cil");
  const currentProblems = getString(formData, "cile", "problemy_dnes");
  const modulePriorities = getString(formData, "cile", "priority_moduly");
  const expectedTimeline = getString(formData, "cile", "ocekavany_termin");
  const itExperience = getString(formData, "cile", "zkusenosti_it");

  if (mainGoal) {
    addInsight("cile", "info", "Hlavní cíl projektu", mainGoal, "high");
  }

  if (currentProblems) {
    addInsight("cile", "weakness", "Identifikované problémy", currentProblems, "high");
  }

  if (expectedTimeline) {
    metrics.push({ id: "m-timeline", label: "Očekávaný termín", value: expectedTimeline });
  }

  if (itExperience === "Minimální zkušenosti" || itExperience === "Základní znalosti") {
    addInsight("cile", "threat", "Nízká IT gramotnost personálu",
      `IT zkušenosti personálu: "${itExperience}". Je třeba počítat s důkladným školením a jednoduchým UI.`, "medium");
    threats.push(`IT zkušenosti personálu: ${itExperience}`);
  }

  // Parse module priorities for recommended projects
  if (modulePriorities) {
    const lines = modulePriorities.split("\n").filter((l) => l.trim());
    const priorityMap: Record<number, Priority> = { 0: "critical", 1: "high", 2: "high", 3: "medium" };

    lines.slice(0, 5).forEach((line, index) => {
      const moduleName = line.replace(/^\d+[\.\)\-\s]+/, "").trim();
      if (!moduleName) return;

      const priority = priorityMap[index] || "medium";
      const existingProject = recommendedProjects.find(
        (p) => p.title.toLowerCase().includes(moduleName.toLowerCase())
      );

      if (!existingProject) {
        recommendedProjects.push({
          title: `Implementace modulu: ${moduleName}`,
          description: `Priorita #${index + 1} dle zadání. Implementace modulu ${moduleName} v rámci nového systému.`,
          category: "development",
          priority,
          tasks: [
            `Detailní analýza požadavků na modul ${moduleName}`,
            "Návrh architektury a datového modelu",
            "Vývoj a testování",
            "Nasazení a migrace dat",
            "Školení uživatelů",
          ],
        });
      }
    });
  }

  // --- GDPR / Legislativa quick check ---
  const gdprStatus = getString(formData, "legislativa", "gdpr_stav");
  if (gdprStatus === "Nezajištěno" || gdprStatus === "Nevím") {
    addInsight("legislativa", "threat", "GDPR nesplněno",
      `Stav GDPR: "${gdprStatus}". Neplnění GDPR může vést k pokutám až 20 mil. EUR / 4% obratu.`, "critical");
    threats.push("GDPR nesplněno");

    recommendedProjects.push({
      title: "GDPR compliance",
      description: "Zajištění souladu s GDPR — audit dat, souhlasy, DPO, procesy.",
      category: "operations",
      priority: "critical",
      tasks: [
        "Audit zpracovávaných osobních údajů",
        "Příprava záznamů o zpracování",
        "Implementace správy souhlasů",
        "Jmenování DPO (interní/externí)",
        "Školení personálu o GDPR",
        "Příprava procesů pro práva subjektů údajů",
      ],
    });
  }

  // --- Ensure there's always a strategic overview project ---
  if (filledSections >= 5 && recommendedProjects.length > 0) {
    recommendedProjects.unshift({
      title: "Strategický plán digitalizace",
      description: "Komplexní plán digitální transformace organizace na základě analýzy dotazníku.",
      category: "strategic",
      priority: "high",
      tasks: [
        "Sestavit řídicí výbor projektu",
        "Definovat roadmapu implementace",
        "Zajistit rozpočet a financování",
        "Stanovit KPI a metriky úspěchu",
        "Nastavit pravidelný reporting a kontrolu",
      ],
    });
  }

  const strategic = getStrategicData();

  return {
    metrics: [...strategic.metrics, ...metrics],
    swot: {
      strengths: [...strategic.strengths, ...strengths],
      weaknesses: [...strategic.weaknesses, ...weaknesses],
      opportunities: [...strategic.opportunities, ...opportunities],
      threats: [...strategic.threats, ...threats],
    },
    insights: [...strategic.insights, ...insights],
    recommended_projects: [...strategic.recommended_projects, ...recommendedProjects],
  };
}
