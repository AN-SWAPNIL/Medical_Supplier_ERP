export const COMPANY_SCOPE_KEY = "mipro-company-scope";

export const demoCompanies = [
  {
    id: "cmp-001",
    name: "Mipro HealthCare Corp.",
    note: "Primary operating company"
  },
  {
    id: "cmp-002",
    name: "Mipro Chattogram Port Office",
    note: "Separate company/branch ledger scope"
  }
];

export function getStoredCompanyId() {
  return window.localStorage.getItem(COMPANY_SCOPE_KEY) ?? demoCompanies[0].id;
}

export function setStoredCompanyId(companyId: string) {
  window.localStorage.setItem(COMPANY_SCOPE_KEY, companyId);
}

export function getCompanyName(companyId: string) {
  return demoCompanies.find((company) => company.id === companyId)?.name ?? demoCompanies[0].name;
}
