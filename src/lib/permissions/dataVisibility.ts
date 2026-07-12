import type { EntityRecord, FieldConfig, Role } from "../../types";

const salesSensitiveFields = new Set([
  "purchasePrice",
  "purchaseUnitFob",
  "seaFreightUnit",
  "customsDutyUnit",
  "cfCostUnit",
  "localTransportUnit",
  "bankLcInsuranceUnit",
  "totalLandedUnit",
  "marginPreview",
  "unitLandedCost",
  "totalCostAmount",
  "profitMarginUnit",
  "totalProfitRealized",
  "totalStockAssetValue",
  "exchangeRate",
  "totalValue"
]);

const technicalFields = new Set(["id", "ownerId", "companyId"]);
const finalizedStatuses = new Set(["Approved", "Posted", "Delivered", "Closed", "Cancelled", "Archived", "Reconciled", "Sent"]);

export function hiddenFieldsForRole(role: Role) {
  if (role === "Sales Executive" || role === "Sales Manager") {
    return salesSensitiveFields;
  }

  return new Set<string>();
}

export function isFieldVisibleForRole(role: Role, fieldKey: string) {
  return !hiddenFieldsForRole(role).has(fieldKey);
}

export function visibleColumnsForRole(columns: string[], role: Role) {
  return columns.filter((column) => isFieldVisibleForRole(role, column));
}

export function visibleFieldsForRole(fields: FieldConfig[], role: Role) {
  return fields.filter((field) => isFieldVisibleForRole(role, field.key));
}

export function sanitizeRecordForRole(record: EntityRecord, role: Role): EntityRecord {
  const hidden = hiddenFieldsForRole(role);
  const sanitized: EntityRecord = { ...record };
  hidden.forEach((key) => {
    delete sanitized[key];
  });
  return sanitized;
}

export function sanitizeRecordsForRole(records: EntityRecord[], role: Role) {
  return records.map((record) => sanitizeRecordForRole(record, role));
}

export function isFinalizedRecord(record: EntityRecord) {
  return finalizedStatuses.has(String(record.status ?? ""));
}

export function canEditRecordForRole(role: Role, record: EntityRecord) {
  if (role === "Super Admin") {
    return true;
  }

  return !isFinalizedRecord(record);
}

export function canDeleteRecordForRole(role: Role, record: EntityRecord) {
  if (role === "Super Admin") {
    return true;
  }

  return !isFinalizedRecord(record);
}

export function detailKeysForRole(record: EntityRecord, role: Role) {
  const hidden = hiddenFieldsForRole(role);
  return Object.keys(record).filter((key) => !technicalFields.has(key) && !hidden.has(key));
}

export function redactedFieldNotice(role: Role) {
  if (role === "Sales Executive") {
    return "Sales Executive privacy is active: purchase cost, landed cost and profit fields are hidden.";
  }

  if (role === "Sales Manager") {
    return "Sales Manager view is focused on team execution: core purchase cost and profit fields are hidden.";
  }

  return "";
}
