// --- Questionnaire types ---

export interface QuestionnaireSection {
  id: string;
  title: string;
  icon: string;
  description: string;
}

export interface FieldConfig {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "radio" | "checkbox" | "number";
  placeholder?: string;
  options?: string[];
  required?: boolean;
  hint?: string;
}

export type FormData = Record<string, Record<string, string | string[]>>;

export interface QuestionnaireMetadata {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

// --- Project Management types ---

export type ProjectCategory = "strategic" | "marketing" | "operations" | "development" | "infrastructure";
export type ProjectStatus = "planned" | "active" | "paused" | "completed" | "cancelled";
export type Priority = "low" | "medium" | "high" | "critical";
export type TaskStatus = "todo" | "in_progress" | "done";

export interface Project {
  id: string;
  questionnaire_id: string | null;
  title: string;
  description: string | null;
  category: ProjectCategory;
  status: ProjectStatus;
  priority: Priority;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  task_count?: number;
  done_count?: number;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  assignee: string | null;
  due_date: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// --- Analysis types ---

export interface Insight {
  id: string;
  section: string;
  type: "strength" | "weakness" | "opportunity" | "threat" | "info";
  title: string;
  description: string;
  priority: Priority;
}

export interface Metric {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "neutral";
}

export interface RecommendedProject {
  title: string;
  description: string;
  category: ProjectCategory;
  priority: Priority;
  tasks: string[];
}

export interface AnalysisResult {
  metrics: Metric[];
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  insights: Insight[];
  recommended_projects: RecommendedProject[];
}

export interface AnalysisSnapshot {
  id: string;
  questionnaire_id: string;
  data: AnalysisResult;
  created_at: string;
}

// --- Dashboard types ---

export interface DashboardData {
  stats: {
    total_projects: number;
    total_tasks: number;
    done_tasks: number;
    overdue_tasks: number;
  };
  projects_by_category: Record<ProjectCategory, number>;
  recent_projects: Project[];
  insights: Insight[];
}

// --- Label maps ---

export const PROJECT_CATEGORY_LABELS: Record<ProjectCategory, string> = {
  strategic: "Strategické",
  marketing: "Marketing",
  operations: "Operace",
  development: "Vývoj",
  infrastructure: "Infrastruktura",
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planned: "Plánováno",
  active: "Aktivní",
  paused: "Pozastaveno",
  completed: "Dokončeno",
  cancelled: "Zrušeno",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Nízká",
  medium: "Střední",
  high: "Vysoká",
  critical: "Kritická",
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "K řešení",
  in_progress: "Probíhá",
  done: "Hotovo",
};

export const SECTIONS: QuestionnaireSection[] = [
  {
    id: "organizace",
    title: "Organizace a vedení",
    icon: "Building2",
    description: "Právní forma, struktura řízení, rozhodovací procesy",
  },
  {
    id: "personal",
    title: "Personální zajištění",
    icon: "Users",
    description: "Zaměstnanci, trenéři, externisté, dobrovolníci",
  },
  {
    id: "finance",
    title: "Finance a rozpočet",
    icon: "Wallet",
    description: "Příjmy, výdaje, dotace, sponzoři, rozpočtování",
  },
  {
    id: "sportoviste",
    title: "Sportoviště a prostory",
    icon: "Landmark",
    description: "Kurty, sály, sauna, zázemí, kapacity, údržba",
  },
  {
    id: "rezervace",
    title: "Rezervační systém",
    icon: "CalendarCheck",
    description: "Aktuální stav rezervací, požadavky na nový systém",
  },
  {
    id: "clenstvi",
    title: "Členství a CRM",
    icon: "UserCheck",
    description: "Členské programy, databáze, komunikace s členy",
  },
  {
    id: "aktivity",
    title: "Aktivity a kroužky",
    icon: "Dumbbell",
    description: "Sportovní a volnočasové aktivity, kurzy, tréninky",
  },
  {
    id: "turnaje",
    title: "Turnaje a akce",
    icon: "Trophy",
    description: "Organizace turnajů, mezinárodní akce, registrace",
  },
  {
    id: "eshop",
    title: "E-shop a prodej",
    icon: "ShoppingCart",
    description: "Online prodej, sortiment, platby, logistika",
  },
  {
    id: "restaurace",
    title: "Restaurace / Bistro",
    icon: "UtensilsCrossed",
    description: "Provoz stravování, menu, zásobování, hygiena",
  },
  {
    id: "marketing",
    title: "Marketing a komunikace",
    icon: "Megaphone",
    description: "Web, sociální sítě, newsletter, PR, branding",
  },
  {
    id: "it",
    title: "IT infrastruktura",
    icon: "Server",
    description: "Hardware, software, síť, bezpečnost, zálohování",
  },
  {
    id: "legislativa",
    title: "Legislativa a GDPR",
    icon: "Shield",
    description: "Právní požadavky, ochrana dat, smlouvy, pojištění",
  },
  {
    id: "cile",
    title: "Cíle a vize projektu",
    icon: "Target",
    description: "Očekávání, priority, harmonogram, kritéria úspěchu",
  },
];
