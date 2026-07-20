// ─── Property Types ────────────────────────────────────────────────────────
export type PropertyType =
  | "text"
  | "number"
  | "select"
  | "multiselect"
  | "date"
  | "checkbox"
  | "url"
  | "email"
  | "phone"
  | "relation";

export interface DatabaseProperty {
  id: string;
  name: string;
  type: PropertyType;
  /** For select / multiselect: available option labels */
  options?: string[];
  /** For number: optional format */
  numberFormat?: "plain" | "dollar" | "euro" | "percent";
  /** For relation: linked database page id */
  linkedDatabaseId?: string;
}

export interface DatabaseConfig {
  type: "database";
  viewType: "table" | "board" | "todo" | "document" | "calendar" | "timeline" | "chart" | "gallery" | "form";
  properties: DatabaseProperty[];
  views?: ("table" | "board" | "todo" | "document" | "calendar" | "timeline" | "chart" | "gallery" | "form")[];
}

export interface DatabaseComment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  createdAt: number;
}

export interface DatabaseRowConfig {
  type: "database_row";
  /**
   * All values are stored as strings.
   * • checkbox:    "true" | "false"
   * • multiselect: comma-separated labels, e.g. "Tag A,Tag B"
   * • date:        ISO date string, e.g. "2024-03-14"
   * • number:      numeric string, e.g. "42"
   * • url/email/phone/text: raw string
   */
  values: Record<string, string>;
  comments?: DatabaseComment[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────

export const isDatabase = (content?: string): boolean => {
  if (!content) return false;
  try {
    const parsed = JSON.parse(content);
    return parsed.type === "database";
  } catch {
    return false;
  }
};

export const parseDatabaseConfig = (content?: string): DatabaseConfig => {
  const fallback: DatabaseConfig = {
    type: "database",
    viewType: "table",
    views: ["table"],
    properties: [
      {
        id: "status",
        name: "Status",
        type: "select",
        options: ["To Do", "In Progress", "Done"],
      },
      {
        id: "priority",
        name: "Priority",
        type: "select",
        options: ["Low", "Medium", "High"],
      },
    ],
  };
  if (!content) return fallback;
  try {
    const parsed = JSON.parse(content);
    if (parsed.type === "database") {
      const config = parsed as DatabaseConfig;
      if (!config.views) {
        config.views = [config.viewType];
      }
      return config;
    }
  } catch {}
  return fallback;
};

export const isDatabaseRow = (content?: string): boolean => {
  if (!content) return false;
  try {
    const parsed = JSON.parse(content);
    return parsed.type === "database_row";
  } catch {
    return false;
  }
};

export const parseDatabaseRow = (content?: string): DatabaseRowConfig => {
  if (!content) return { type: "database_row", values: {} };
  try {
    const parsed = JSON.parse(content);
    if (parsed.type === "database_row") return parsed as DatabaseRowConfig;
  } catch {}
  return { type: "database_row", values: {} };
};

// ─── Default value for a property type ────────────────────────────────────
export const defaultValueForType = (prop: DatabaseProperty): string => {
  switch (prop.type) {
    case "checkbox":
      return "false";
    case "select":
      return prop.options?.[0] ?? "";
    case "multiselect":
      return "";
    default:
      return "";
  }
};

// ─── Property metadata (icon name, label) used in UI ─────────────────────
export const PROPERTY_TYPE_META: Record<
  PropertyType,
  { label: string; icon: string }
> = {
  text:        { label: "Text",         icon: "Type" },
  number:      { label: "Number",       icon: "Hash" },
  select:      { label: "Select",       icon: "CircleDot" },
  multiselect: { label: "Multi-select", icon: "Tags" },
  date:        { label: "Date",         icon: "CalendarDays" },
  checkbox:    { label: "Checkbox",     icon: "CheckSquare2" },
  url:         { label: "URL",          icon: "Link" },
  email:       { label: "Email",        icon: "Mail" },
  phone:       { label: "Phone",        icon: "Phone" },
  relation:    { label: "Relation",     icon: "ArrowUpRight" },
};
