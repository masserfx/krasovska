import { sql } from "@vercel/postgres";
import { FormData } from "@/types";

export interface AuditEntry {
  id: string;
  questionnaire_id: string;
  ip_address: string | null;
  user_agent: string | null;
  device_type: string | null;
  country: string | null;
  city: string | null;
  geo_status: string;
  changed_sections: string[];
  changed_fields: Record<string, string[]>;
  created_at: string;
  questionnaire_title?: string;
}

export function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip");
}

export function parseDeviceType(ua: string | null): string {
  if (!ua) return "unknown";
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android.*mobile|opera m(ob|in)/i.test(ua)) return "mobile";
  return "desktop";
}

export function detectChanges(
  oldData: FormData,
  newData: FormData
): { changedSections: string[]; changedFields: Record<string, string[]> } {
  const changedSections: string[] = [];
  const changedFields: Record<string, string[]> = {};

  const allSections = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

  for (const section of allSections) {
    const oldSection = oldData[section] || {};
    const newSection = newData[section] || {};
    const allFields = new Set([...Object.keys(oldSection), ...Object.keys(newSection)]);
    const sectionChangedFields: string[] = [];

    for (const field of allFields) {
      const oldVal = JSON.stringify(oldSection[field] ?? "");
      const newVal = JSON.stringify(newSection[field] ?? "");
      if (oldVal !== newVal) {
        sectionChangedFields.push(field);
      }
    }

    if (sectionChangedFields.length > 0) {
      changedSections.push(section);
      changedFields[section] = sectionChangedFields;
    }
  }

  return { changedSections, changedFields };
}

export async function logAudit(entry: {
  questionnaire_id: string;
  ip_address: string | null;
  user_agent: string | null;
  device_type: string;
  changed_sections: string[];
  changed_fields: Record<string, string[]>;
}): Promise<string> {
  const { rows } = await sql`
    INSERT INTO audit_log (questionnaire_id, ip_address, user_agent, device_type, changed_sections, changed_fields)
    VALUES (
      ${entry.questionnaire_id},
      ${entry.ip_address},
      ${entry.user_agent},
      ${entry.device_type},
      ${JSON.stringify(entry.changed_sections)},
      ${JSON.stringify(entry.changed_fields)}
    )
    RETURNING id
  `;
  return rows[0].id;
}

export async function resolveGeo(auditId: string, ip: string | null): Promise<void> {
  if (!ip || ip === "127.0.0.1" || ip === "::1") {
    await sql`UPDATE audit_log SET geo_status = 'skipped' WHERE id = ${auditId}`;
    return;
  }

  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city`);
    const data = await res.json();

    if (data.status === "success") {
      await sql`
        UPDATE audit_log
        SET country = ${data.country}, city = ${data.city}, geo_status = 'resolved'
        WHERE id = ${auditId}
      `;
    } else {
      await sql`UPDATE audit_log SET geo_status = 'failed' WHERE id = ${auditId}`;
    }
  } catch {
    await sql`UPDATE audit_log SET geo_status = 'failed' WHERE id = ${auditId}`;
  }
}
