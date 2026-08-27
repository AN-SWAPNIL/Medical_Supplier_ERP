import type {
  AccountTransaction,
  AuditEvent,
  BusinessDecision,
  CashBankAccount,
  Collection,
  CostPreset,
  Customer,
  CustomerOpeningBalance,
  DailyMarketingPlan,
  Delivery,
  DocumentRecord,
  Expense,
  CurrentEmployeeLocation,
  FieldVisit,
  EmployeeMarketingTarget,
  ImportCase,
  ImportDocument,
  Product,
  Quotation,
  SalesOrder,
  StockBatch,
  StockMovement,
  Supplier,
  WarehouseConfig,
  WarehouseReceipt,
  LocationHistoryPoint,
  MarketingActivity,
  MarketingFollowUp,
  MarketingLead,
  MarketingScoreRule,
  MonthlyMarketingPlan,
  TrackingSession,
  PrintConfiguration
} from "../src/domains/erp.types.js";
import type { User } from "../src/types/index.js";

export const demoUsers: User[] = [
  {
    id: "u-super",
    name: "Sadia Karim",
    email: "superadmin@mipro.local",
    role: "Super Admin",
    title: "Owner & System Administrator",
    department: "Management",
    phone: "+880 1711 000001",
    avatarUrl: "/mipro-owner.png",
    status: "Active",
    capabilities: ["view_sensitive_cost", "edit_sensitive_cost", "finalize_landed_cost", "reopen_landed_cost", "view_profit", "approve_stock_override", "approve_special_price", "manage_users", "manage_user_access"]
  },
  {
    id: "u-md",
    name: "Mahmud Rahman",
    email: "md@mipro.local",
    role: "Managing Director",
    title: "Managing Director",
    department: "Management",
    phone: "+880 1711 000002",
    avatarUrl: "",
    status: "Active",
    capabilities: []
  },
  {
    id: "u-accounts",
    name: "Nusrat Jahan",
    email: "accounts@mipro.local",
    role: "Accounts",
    title: "Accounts Officer",
    department: "Accounts",
    phone: "+880 1711 000003",
    avatarUrl: "",
    status: "Active",
    capabilities: []
  },
  {
    id: "u-import",
    name: "Tanvir Hasan",
    email: "import@mipro.local",
    role: "Import Officer",
    title: "Import Officer",
    department: "Import",
    phone: "+880 1711 000004",
    avatarUrl: "",
    status: "Active",
    permissionOverrides: [
      { permission: "reports", action: "view", effect: "ALLOW" },
      { permission: "reports", action: "export", effect: "ALLOW" }
    ],
    capabilities: []
  },
  {
    id: "u-warehouse",
    name: "Aminul Islam",
    email: "warehouse@mipro.local",
    role: "Warehouse Manager",
    title: "Warehouse Manager",
    department: "Warehouse",
    phone: "+880 1711 000005",
    avatarUrl: "",
    status: "Active",
    capabilities: ["approve_stock_override"]
  },
  {
    id: "u-sales-manager",
    name: "Farhana Akter",
    email: "salesmanager@mipro.local",
    role: "Sales Manager",
    title: "Sales Manager",
    department: "Sales",
    phone: "+880 1711 000006",
    avatarUrl: "",
    status: "Active",
    permissionOverrides: [
      { permission: "users", action: "view", effect: "ALLOW" },
      { permission: "users", action: "create", effect: "ALLOW" },
      { permission: "users", action: "edit", effect: "ALLOW" },
      { permission: "reports", action: "export", effect: "DENY" }
    ],
    capabilities: ["approve_special_price", "manage_users"]
  },
  {
    id: "sales1",
    name: "Rafiq Ahmed",
    email: "sales1@mipro.local",
    role: "Sales Executive",
    title: "Sales Executive",
    department: "Sales",
    phone: "+880 1711 000007",
    avatarUrl: "",
    status: "Active",
    territory: "Dhaka North",
    employeeCode: "SE-001",
    capabilities: []
  },
  {
    id: "sales2",
    name: "Shamima Sultana",
    email: "sales2@mipro.local",
    role: "Sales Executive",
    title: "Sales Executive",
    department: "Sales",
    phone: "+880 1711 000008",
    avatarUrl: "",
    status: "Active",
    territory: "Dhaka Central",
    employeeCode: "SE-014",
    capabilities: []
  },
  {
    id: "sales3", name: "Sabbir Hossain", email: "sales3@mipro.local", role: "Sales Executive", title: "Sales Executive", department: "Sales", phone: "+880 1711 000009", avatarUrl: "", status: "Active", territory: "Mirpur", employeeCode: "SE-021", capabilities: []
  },
  {
    id: "sales4", name: "Nabila Chowdhury", email: "sales4@mipro.local", role: "Sales Executive", title: "Senior Sales Executive", department: "Sales", phone: "+880 1711 000010", avatarUrl: "", status: "Active", territory: "Dhaka South", employeeCode: "SE-027", capabilities: []
  },
  {
    id: "sales5", name: "Imran Kabir", email: "sales5@mipro.local", role: "Sales Executive", title: "Sales Executive", department: "Sales", phone: "+880 1711 000011", avatarUrl: "", status: "Active", territory: "Narayanganj", employeeCode: "SE-032", capabilities: []
  }
];

export const passwordByEmail = new Map(demoUsers.map((user) => [user.email, "password123"]));

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();
const businessDay = (offset = 0) => {
  const value = new Date(Date.now() + offset * 86_400_000);
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(value);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
};
const businessTime = (dayOffset: number, hour: number, minute = 0) => `${businessDay(dayOffset)}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+06:00`;

export const fieldVisits: FieldVisit[] = [
  { id: "visit-rafiq-popular", userId: "sales1", customerId: "cus-popular", customerName: "Popular Medicine & Departmental Store", purpose: "Stock and collection follow-up", status: "Checked In", plannedAt: minutesAgo(70), checkInAt: minutesAgo(28), customerLatitude: 23.8759, customerLongitude: 90.3795, checkInLatitude: 23.8758, checkInLongitude: 90.3794, checkInAccuracyMeters: 18, productIds: ["prd-d17h", "prd-bts"], verification: "GPS_VERIFIED", checkInDistanceMeters: 15, distanceWarning: false, submittedAt: minutesAgo(27) },
  { id: "visit-rafiq-kuwait", userId: "sales1", customerId: "cus-kuwait", customerName: "Kuwait Moitri Hospital", purpose: "Dialyzer demand review", outcome: "Next quotation requested", status: "Completed", plannedAt: minutesAgo(190), checkInAt: minutesAgo(175), checkOutAt: minutesAgo(130), customerLatitude: 23.8702, customerLongitude: 90.4031, checkInLatitude: 23.8701, checkInLongitude: 90.4030, checkInAccuracyMeters: 14, productIds: ["prd-d17h", "prd-d15h"], nextFollowUpAt: businessTime(1, 10), remarks: "Procurement requested institutional pricing.", verification: "GPS_VERIFIED", checkInDistanceMeters: 15, distanceWarning: false, submittedAt: minutesAgo(125) },
  { id: "visit-shamima-labaid", userId: "sales2", customerId: "cus-labaid", customerName: "Labaid Specialized Hospital", purpose: "Outstanding payment follow-up", outcome: "Accounts review scheduled", status: "Completed", plannedAt: minutesAgo(155), checkInAt: minutesAgo(142), checkOutAt: minutesAgo(96), customerLatitude: 23.7392, customerLongitude: 90.3830, checkInLatitude: 23.7391, checkInLongitude: 90.3831, checkInAccuracyMeters: 22, productIds: ["prd-d17h"], nextFollowUpAt: businessTime(2, 11), verification: "GPS_VERIFIED", checkInDistanceMeters: 15, distanceWarning: false, submittedAt: minutesAgo(90) },
  { id: "visit-sabbir-ark", userId: "sales3", customerId: "cus-ark", customerName: "ARK Hospital", purpose: "Product presentation", status: "Planned", plannedAt: new Date(Date.now() + 45 * 60_000).toISOString(), customerLatitude: 23.8223, customerLongitude: 90.3654, productIds: ["prd-av16", "prd-av17"], verification: "UNVERIFIED" },
  { id: "visit-nabila-bismillah", userId: "sales4", customerId: "cus-bismillah", customerName: "Bismillah Surgical", purpose: "Dealer stock review", status: "Missed", plannedAt: minutesAgo(210), customerLatitude: 23.7114, customerLongitude: 90.4067, verification: "UNVERIFIED", remarks: "Customer contact was unavailable." }
];

export const trackingSessions: TrackingSession[] = [
  { id: "track-sales1", userId: "sales1", startedAt: minutesAgo(235), source: "DEMO", status: "Active" },
  { id: "track-sales2", userId: "sales2", startedAt: minutesAgo(205), source: "DEMO", status: "Active" },
  { id: "track-sales3", userId: "sales3", startedAt: minutesAgo(175), source: "DEMO", status: "Active" },
  { id: "track-sales4", userId: "sales4", startedAt: minutesAgo(280), endedAt: minutesAgo(118), source: "DEMO", status: "Completed" }
];

export const currentEmployeeLocations: CurrentEmployeeLocation[] = [
  { userId: "sales1", employee: { id: "sales1", name: "Rafiq Ahmed", title: "Sales Executive", territory: "Dhaka North", employeeCode: "SE-001", phone: "+880 1711 000007", avatarUrl: "" }, latitude: 23.8758, longitude: 90.3794, accuracyMeters: 18, recordedAt: minutesAgo(0.4), status: "LIVE", source: "DEMO", sessionId: "track-sales1", sessionStartedAt: minutesAgo(235), currentVisit: fieldVisits[0] },
  { userId: "sales2", employee: { id: "sales2", name: "Shamima Sultana", title: "Sales Executive", territory: "Dhaka Central", employeeCode: "SE-014", phone: "+880 1711 000008", avatarUrl: "" }, latitude: 23.7515, longitude: 90.3898, accuracyMeters: 26, recordedAt: minutesAgo(4), status: "RECENT", source: "DEMO", sessionId: "track-sales2", sessionStartedAt: minutesAgo(205) },
  { userId: "sales3", employee: { id: "sales3", name: "Sabbir Hossain", title: "Sales Executive", territory: "Mirpur", employeeCode: "SE-021", phone: "+880 1711 000009", avatarUrl: "" }, latitude: 23.8069, longitude: 90.3687, accuracyMeters: 41, recordedAt: minutesAgo(26), status: "STALE", source: "DEMO", sessionId: "track-sales3", sessionStartedAt: minutesAgo(175) },
  { userId: "sales4", employee: { id: "sales4", name: "Nabila Chowdhury", title: "Senior Sales Executive", territory: "Dhaka South", employeeCode: "SE-027", phone: "+880 1711 000010", avatarUrl: "" }, latitude: 23.7114, longitude: 90.4067, accuracyMeters: 65, recordedAt: minutesAgo(118), status: "OFFLINE", source: "DEMO" },
  { userId: "sales5", employee: { id: "sales5", name: "Imran Kabir", title: "Sales Executive", territory: "Narayanganj", employeeCode: "SE-032", phone: "+880 1711 000011", avatarUrl: "" }, latitude: 23.6238, longitude: 90.5000, accuracyMeters: 80, recordedAt: minutesAgo(1440), status: "NOT_TRACKING", source: "DEMO" }
];

export const locationHistory: LocationHistoryPoint[] = [
  { id: "loc-r1", userId: "sales1", latitude: 23.8103, longitude: 90.4125, accuracyMeters: 22, recordedAt: minutesAgo(235), source: "DEMO", event: "TRACKING_STARTED" },
  { id: "loc-r2", userId: "sales1", latitude: 23.8262, longitude: 90.3991, accuracyMeters: 19, recordedAt: minutesAgo(205), source: "DEMO", event: "LOCATION" },
  { id: "loc-r3", userId: "sales1", latitude: 23.8701, longitude: 90.4030, accuracyMeters: 14, recordedAt: minutesAgo(175), source: "DEMO", event: "VISIT_CHECK_IN" },
  { id: "loc-r4", userId: "sales1", latitude: 23.8704, longitude: 90.4027, accuracyMeters: 17, recordedAt: minutesAgo(130), source: "DEMO", event: "VISIT_CHECK_OUT" },
  { id: "loc-r5", userId: "sales1", latitude: 23.8689, longitude: 90.3901, accuracyMeters: 21, recordedAt: minutesAgo(75), source: "DEMO", event: "LOCATION" },
  { id: "loc-r6", userId: "sales1", latitude: 23.8758, longitude: 90.3794, accuracyMeters: 18, recordedAt: minutesAgo(28), source: "DEMO", event: "VISIT_CHECK_IN" },
  { id: "loc-s1", userId: "sales2", latitude: 23.7637, longitude: 90.3894, accuracyMeters: 28, recordedAt: minutesAgo(205), source: "DEMO", event: "TRACKING_STARTED" },
  { id: "loc-s2", userId: "sales2", latitude: 23.7391, longitude: 90.3831, accuracyMeters: 22, recordedAt: minutesAgo(142), source: "DEMO", event: "VISIT_CHECK_IN" },
  { id: "loc-s3", userId: "sales2", latitude: 23.7428, longitude: 90.3859, accuracyMeters: 24, recordedAt: minutesAgo(96), source: "DEMO", event: "VISIT_CHECK_OUT" },
  { id: "loc-s4", userId: "sales2", latitude: 23.7515, longitude: 90.3898, accuracyMeters: 26, recordedAt: minutesAgo(4), source: "DEMO", event: "LOCATION" }
];

export const marketingLeads: MarketingLead[] = [
  { id: "lead-1", leadNumber: "LEAD-2026-031", organizationName: "North Point Dialysis Centre", organizationType: "Clinic", contactPerson: "Dr. Afsana Kabir", contactRole: "Doctor", mobile: "+880 1712 450910", email: "procurement@northpoint.example", address: "Uttara, Dhaka", latitude: 23.8842, longitude: 90.3924, interestedProductIds: ["prd-d17h", "prd-bts"], leadSource: "Website Inquiry", assignedUserId: "sales1", stage: "PRESENTATION", nextFollowUpAt: businessTime(0, 15), lastContactAt: businessTime(0, 10, 20), notes: "Clinical team requested membrane and sterilization documentation.", createdAt: businessTime(-8, 9), updatedAt: businessTime(0, 10, 20) },
  { id: "lead-2", leadNumber: "LEAD-2026-032", organizationName: "Careline Medical Services", organizationType: "Dealer", contactPerson: "Mohammad Tariqul Islam", contactRole: "Owner", mobile: "+880 1818 620044", email: "tariqul@careline.example", address: "Uttara, Dhaka", interestedProductIds: ["prd-av16", "prd-av17"], leadSource: "Website Inquiry", assignedUserId: "sales1", stage: "QUOTATION", nextFollowUpAt: businessTime(-1, 14), lastContactAt: businessTime(-2, 16), notes: "Monthly volume confirmed; quotation submitted.", createdAt: businessTime(-12, 11), updatedAt: businessTime(-2, 16) },
  { id: "lead-3", leadNumber: "LEAD-2026-033", organizationName: "Metro Clinical Hospital", organizationType: "Hospital", contactPerson: "Sabina Yasmin", contactRole: "Procurement", mobile: "+880 1911 335508", email: "supply@metroclinical.example", address: "Moghbazar, Dhaka", interestedProductIds: ["prd-cat"], leadSource: "Website Inquiry", assignedUserId: "sales2", stage: "CONTACTED", nextFollowUpAt: businessTime(1, 11), lastContactAt: businessTime(0, 9, 40), createdAt: businessTime(-4, 12), updatedAt: businessTime(0, 9, 40) },
  { id: "lead-4", leadNumber: "LEAD-2026-034", organizationName: "Uttara Renal Care", organizationType: "Clinic", contactPerson: "Dr. M. Islam", contactRole: "Doctor", mobile: "+880 1710 335901", address: "Sector 7, Uttara", interestedProductIds: ["prd-d15h", "prd-d17h"], leadSource: "Referral", assignedUserId: "sales3", stage: "SAMPLE", nextFollowUpAt: businessTime(3, 12), lastContactAt: businessTime(-1, 15), notes: "Sample evaluation is in progress.", createdAt: businessTime(-18, 10), updatedAt: businessTime(-1, 15) },
  { id: "lead-5", leadNumber: "LEAD-2026-035", organizationName: "Mirpur Kidney Foundation", organizationType: "Clinic", contactPerson: "Razia Sultana", contactRole: "Management", mobile: "+880 1812 009181", address: "Mirpur 10, Dhaka", interestedProductIds: ["prd-bts"], leadSource: "Field Prospecting", assignedUserId: "sales3", stage: "INTERESTED", nextFollowUpAt: businessTime(0, 16, 30), lastContactAt: businessTime(-1, 12), createdAt: businessTime(-7, 14), updatedAt: businessTime(-1, 12) },
  { id: "lead-6", leadNumber: "LEAD-2026-036", organizationName: "South City Hospital", organizationType: "Hospital", contactPerson: "Mahin Chowdhury", contactRole: "Procurement", mobile: "+880 1913 801240", address: "Jatrabari, Dhaka", interestedProductIds: ["prd-d16h", "prd-bts"], leadSource: "Conference", assignedUserId: "sales4", stage: "NEGOTIATION", nextFollowUpAt: businessTime(2, 14), lastContactAt: businessTime(-1, 17), createdAt: businessTime(-25, 10), updatedAt: businessTime(-1, 17) },
  { id: "lead-7", leadNumber: "LEAD-2026-037", organizationName: "Narayanganj Kidney Centre", organizationType: "Clinic", contactPerson: "Asif Mahmud", contactRole: "Owner", mobile: "+880 1718 660451", address: "Chashara, Narayanganj", interestedProductIds: ["prd-d17l"], leadSource: "Field Prospecting", assignedUserId: "sales5", stage: "NEW", nextFollowUpAt: businessTime(1, 10), createdAt: businessTime(0, 8, 35), updatedAt: businessTime(0, 8, 35) },
  { id: "lead-8", leadNumber: "LEAD-2026-038", organizationName: "Central Surgical Mart", organizationType: "Dealer", contactPerson: "Kamrul Hasan", contactRole: "Owner", mobile: "+880 1705 330922", address: "Mitford, Dhaka", interestedProductIds: ["prd-av16"], leadSource: "Trade Reference", assignedUserId: "sales2", stage: "LOST", lostReason: "Customer selected another brand for this procurement cycle.", lastContactAt: businessTime(-6, 13), createdAt: businessTime(-30, 9), updatedAt: businessTime(-6, 13) }
];

export const marketingActivities: MarketingActivity[] = [
  { id: "mkt-act-1", userId: "sales1", employeeCode: "SE-001", employeeName: "Rafiq Ahmed", territory: "Dhaka North", activityType: "PRODUCT_PRESENTATION", source: "MANUAL", occurredAt: businessTime(0, 10, 20), submittedAt: businessTime(0, 10, 34), leadId: "lead-1", subjectName: "North Point Dialysis Centre", productIds: ["prd-d17h", "prd-bts"], purpose: "Clinical product review", remarks: "Demonstrated product specifications and shared regulatory documents.", nextFollowUpAt: businessTime(0, 15), verification: "MANUAL", createdByUserId: "sales1" },
  { id: "mkt-act-2", userId: "sales2", employeeCode: "SE-014", employeeName: "Shamima Sultana", territory: "Dhaka Central", activityType: "CUSTOMER_CONTACT", source: "MANUAL", occurredAt: businessTime(0, 9, 40), submittedAt: businessTime(0, 9, 43), leadId: "lead-3", subjectName: "Metro Clinical Hospital", productIds: ["prd-cat"], purpose: "Qualification call", remarks: "Procurement requested packaging and delivery details.", nextFollowUpAt: businessTime(1, 11), verification: "MANUAL", createdByUserId: "sales2" },
  { id: "mkt-act-3", userId: "sales3", employeeCode: "SE-021", employeeName: "Sabbir Hossain", territory: "Mirpur", activityType: "SAMPLE_DELIVERED", source: "MANUAL", occurredAt: businessTime(-1, 15), submittedAt: businessTime(-1, 18, 20), leadId: "lead-4", subjectName: "Uttara Renal Care", productIds: ["prd-d15h"], purpose: "Product evaluation sample", remarks: "Two sealed evaluation units acknowledged by the clinical coordinator.", nextFollowUpAt: businessTime(3, 12), verification: "MANUAL", createdByUserId: "sales3" },
  { id: "mkt-act-4", userId: "sales4", employeeCode: "SE-027", employeeName: "Nabila Chowdhury", territory: "Dhaka South", activityType: "NEGOTIATION_UPDATE", source: "MANUAL", occurredAt: businessTime(-1, 17), submittedAt: businessTime(-1, 17, 15), leadId: "lead-6", subjectName: "South City Hospital", productIds: ["prd-d16h", "prd-bts"], purpose: "Commercial terms", remarks: "Customer requested a phased delivery option.", nextFollowUpAt: businessTime(2, 14), verification: "MANUAL", createdByUserId: "sales4" },
  { id: "mkt-act-5", userId: "sales5", employeeCode: "SE-032", employeeName: "Imran Kabir", territory: "Narayanganj", activityType: "LEAD_CREATED", source: "LEAD", occurredAt: businessTime(0, 8, 35), submittedAt: businessTime(0, 8, 35), leadId: "lead-7", subjectName: "Narayanganj Kidney Centre", productIds: ["prd-d17l"], purpose: "New field prospect", verification: "SYSTEM_VERIFIED", referenceType: "Lead", referenceId: "lead-7", referenceNumber: "LEAD-2026-037", createdByUserId: "sales5" },
  { id: "mkt-act-6", userId: "sales2", employeeCode: "SE-014", employeeName: "Shamima Sultana", territory: "Dhaka Central", activityType: "GENERAL_NOTE", source: "MANUAL", occurredAt: businessTime(-2, 13), submittedAt: businessTime(-1, 8, 30), customerId: "cus-insaf", subjectName: "Insaf Barakah Foundation Hospital", purpose: "Procurement cycle note", remarks: "The next tender document is expected in the first week of September.", verification: "UNVERIFIED", createdByUserId: "sales2" },
  { id: "mkt-act-7", userId: "sales1", employeeCode: "SE-001", employeeName: "Rafiq Ahmed", territory: "Dhaka North", activityType: "DOCTOR_MEETING", source: "MANUAL", occurredAt: businessTime(-3, 11), submittedAt: businessTime(-3, 11, 12), customerId: "cus-kuwait", subjectName: "Kuwait Bangladesh Friendship Government Hospital", productIds: ["prd-d17h"], purpose: "Dialyzer clinical feedback", remarks: "Reviewed high-flux requirements and requested model-specific documentation for the next committee meeting.", nextFollowUpAt: businessTime(2, 10), verification: "MANUAL", createdByUserId: "sales1" },
  { id: "mkt-act-8", userId: "sales1", employeeCode: "SE-001", employeeName: "Rafiq Ahmed", territory: "Dhaka North", activityType: "TENDER_FOLLOW_UP", source: "MANUAL", occurredAt: businessTime(-6, 14), submittedAt: businessTime(-6, 14, 8), leadId: "lead-2", subjectName: "Careline Medical Services", productIds: ["prd-av16", "prd-av17"], purpose: "Tender document follow-up", remarks: "Confirmed requested quantities and the deadline for the commercial offer.", verification: "MANUAL", createdByUserId: "sales1" },
  { id: "mkt-act-9", userId: "sales2", employeeCode: "SE-014", employeeName: "Shamima Sultana", territory: "Dhaka Central", activityType: "PROCUREMENT_MEETING", source: "MANUAL", occurredAt: businessTime(-4, 10, 30), submittedAt: businessTime(-4, 10, 44), customerId: "cus-labaid", subjectName: "Labaid Specialized Hospital", productIds: ["prd-cat"], purpose: "Quarterly purchase planning", remarks: "Procurement shared the tentative catheter requirement and requested delivery lead-time confirmation.", nextFollowUpAt: businessTime(1, 11), verification: "MANUAL", createdByUserId: "sales2" },
  { id: "mkt-act-10", userId: "sales2", employeeCode: "SE-014", employeeName: "Shamima Sultana", territory: "Dhaka Central", activityType: "COLLECTION_VISIT", source: "MANUAL", occurredAt: businessTime(-7, 12), submittedAt: businessTime(-7, 12, 20), customerId: "cus-insaf", subjectName: "Insaf Barakah Foundation Hospital", purpose: "Outstanding payment follow-up", remarks: "Accounts desk confirmed that the payment voucher is awaiting final approval.", verification: "MANUAL", createdByUserId: "sales2" },
  { id: "mkt-act-11", userId: "sales3", employeeCode: "SE-021", employeeName: "Sabbir Hossain", territory: "Mirpur", activityType: "PRODUCT_DEMONSTRATION", source: "MANUAL", occurredAt: businessTime(-5, 15), submittedAt: businessTime(-5, 15, 10), leadId: "lead-5", subjectName: "Mirpur Kidney Foundation", productIds: ["prd-bts"], purpose: "Blood-line set demonstration", remarks: "Demonstrated connector layout and color-coded line identification to the dialysis team.", verification: "MANUAL", createdByUserId: "sales3" },
  { id: "mkt-act-12", userId: "sales3", employeeCode: "SE-021", employeeName: "Sabbir Hossain", territory: "Mirpur", activityType: "SERVICE_FOLLOW_UP", source: "MANUAL", occurredAt: businessTime(-10, 9, 45), submittedAt: businessTime(-10, 10), customerId: "cus-popular", subjectName: "Popular Medicine & Departmental Store", purpose: "Packaging feedback", remarks: "Recorded the customer's packaging concern and shared it with warehouse operations for review.", verification: "MANUAL", createdByUserId: "sales3" },
  { id: "mkt-act-13", userId: "sales4", employeeCode: "SE-027", employeeName: "Nabila Chowdhury", territory: "Dhaka South", activityType: "DEALER_VISIT", source: "MANUAL", occurredAt: businessTime(-3, 16), submittedAt: businessTime(-3, 16, 18), leadId: "lead-6", subjectName: "South City Hospital", productIds: ["prd-d16h", "prd-bts"], purpose: "Distribution and delivery discussion", remarks: "Discussed phased delivery quantities and dealer support requirements.", nextFollowUpAt: businessTime(2, 14), verification: "MANUAL", createdByUserId: "sales4" },
  { id: "mkt-act-14", userId: "sales4", employeeCode: "SE-027", employeeName: "Nabila Chowdhury", territory: "Dhaka South", activityType: "TRAINING_SESSION", source: "MANUAL", occurredAt: businessTime(-12, 11), submittedAt: businessTime(-12, 11, 35), customerId: "cus-pg", subjectName: "PG Hospital", productIds: ["prd-d17h", "prd-bts"], purpose: "Product handling orientation", remarks: "Completed a short orientation covering product identification, storage and documentation handover.", verification: "MANUAL", createdByUserId: "sales4" },
  { id: "mkt-act-15", userId: "sales5", employeeCode: "SE-032", employeeName: "Imran Kabir", territory: "Narayanganj", activityType: "MARKET_SURVEY", source: "MANUAL", occurredAt: businessTime(-4, 13, 15), submittedAt: businessTime(-4, 14), subjectName: "Narayanganj dialysis market", purpose: "Competitor and demand review", remarks: "Visited three medical supply points and recorded prevailing dialyzer demand and lead-time concerns.", verification: "MANUAL", createdByUserId: "sales5" },
  { id: "mkt-act-16", userId: "sales5", employeeCode: "SE-032", employeeName: "Imran Kabir", territory: "Narayanganj", activityType: "OFFICE_COORDINATION", source: "MANUAL", occurredAt: businessTime(-1, 17, 20), submittedAt: businessTime(-1, 17, 28), subjectName: "Sales office coordination", purpose: "Quotation document preparation", remarks: "Coordinated product documents and pricing inputs for the next customer follow-up.", verification: "MANUAL", createdByUserId: "sales5" }
];

export const marketingFollowUps: MarketingFollowUp[] = [
  { id: "follow-1", assignedUserId: "sales1", leadId: "lead-1", subjectName: "North Point Dialysis Centre", dueAt: businessTime(0, 15), purpose: "Confirm clinical documentation review", status: "PENDING", createdAt: businessTime(-3, 10) },
  { id: "follow-2", assignedUserId: "sales1", leadId: "lead-2", subjectName: "Careline Medical Services", dueAt: businessTime(-1, 14), purpose: "Review quotation and monthly volume", status: "PENDING", createdAt: businessTime(-5, 12) },
  { id: "follow-3", assignedUserId: "sales2", leadId: "lead-3", subjectName: "Metro Clinical Hospital", dueAt: businessTime(1, 11), purpose: "Share catheter packaging details", status: "PENDING", createdAt: businessTime(0, 9, 45) },
  { id: "follow-4", assignedUserId: "sales2", customerId: "cus-labaid", subjectName: "Labaid Specialized Hospital", dueAt: businessTime(-2, 11), purpose: "Confirm accounts review outcome", status: "COMPLETED", completedAt: businessTime(-2, 11, 35), outcome: "Cheque processing initiated", nextFollowUpAt: businessTime(2, 11), createdAt: businessTime(-4, 15) },
  { id: "follow-5", assignedUserId: "sales3", leadId: "lead-5", subjectName: "Mirpur Kidney Foundation", dueAt: businessTime(0, 16, 30), purpose: "Schedule blood-line presentation", status: "PENDING", createdAt: businessTime(-2, 12) },
  { id: "follow-6", assignedUserId: "sales3", leadId: "lead-4", subjectName: "Uttara Renal Care", dueAt: businessTime(3, 12), purpose: "Collect sample evaluation", status: "PENDING", createdAt: businessTime(-1, 15) },
  { id: "follow-7", assignedUserId: "sales4", leadId: "lead-6", subjectName: "South City Hospital", dueAt: businessTime(2, 14), purpose: "Confirm phased delivery terms", status: "PENDING", createdAt: businessTime(-1, 17) },
  { id: "follow-8", assignedUserId: "sales5", leadId: "lead-7", subjectName: "Narayanganj Kidney Centre", dueAt: businessTime(1, 10), purpose: "Initial qualification call", status: "PENDING", createdAt: businessTime(0, 8, 35) }
];

export const dailyMarketingPlans: DailyMarketingPlan[] = [
  { id: "daily-sales1", userId: "sales1", date: businessDay(), plannedVisits: [{ id: "dp-1", customerId: "cus-kuwait", subjectName: "Kuwait Moitri Hospital", plannedTime: "09:30", purpose: "Demand review", completed: true }, { id: "dp-2", customerId: "cus-popular", subjectName: "Popular Medicine & Departmental Store", plannedTime: "12:00", purpose: "Stock and collection follow-up", completed: false }, { id: "dp-3", leadId: "lead-1", subjectName: "North Point Dialysis Centre", plannedTime: "15:00", purpose: "Clinical document follow-up", completed: false }], notes: "Prioritize dialysis accounts in Uttara.", status: "SUBMITTED" },
  { id: "daily-sales2", userId: "sales2", date: businessDay(), plannedVisits: [{ id: "dp-4", customerId: "cus-labaid", subjectName: "Labaid Specialized Hospital", plannedTime: "10:00", purpose: "Payment follow-up", completed: true }, { id: "dp-5", leadId: "lead-3", subjectName: "Metro Clinical Hospital", plannedTime: "14:30", purpose: "Catheter requirement review", completed: false }], status: "SUBMITTED" }
];

export const monthlyMarketingPlans: MonthlyMarketingPlan[] = [
  { id: "monthly-sales1", userId: "sales1", month: businessDay().slice(0, 7), territory: "Dhaka North", prioritySubjects: ["North Point Dialysis Centre", "Kuwait Moitri Hospital", "Popular Medicine"], productIds: ["prd-d17h", "prd-bts"], plannedActivities: 48, notes: "Dialysis consumables and due recovery.", status: "APPROVED" },
  { id: "monthly-sales2", userId: "sales2", month: businessDay().slice(0, 7), territory: "Dhaka Central", prioritySubjects: ["Labaid Specialized Hospital", "Metro Clinical Hospital"], productIds: ["prd-cat", "prd-d17h"], plannedActivities: 42, notes: "Institutional procurement follow-up.", status: "SUBMITTED" }
];

export const marketingTargets: EmployeeMarketingTarget[] = [
  { id: "target-sales1", userId: "sales1", month: businessDay().slice(0, 7), salesTargetBdt: "650000.00", newCustomerTarget: 4, visitTarget: 22, collectionTargetBdt: "500000.00", createdByUserId: "u-sales-manager", createdAt: businessTime(-25, 9) },
  { id: "target-sales2", userId: "sales2", month: businessDay().slice(0, 7), salesTargetBdt: "800000.00", newCustomerTarget: 5, visitTarget: 24, collectionTargetBdt: "650000.00", createdByUserId: "u-sales-manager", createdAt: businessTime(-25, 9) },
  { id: "target-sales3", userId: "sales3", month: businessDay().slice(0, 7), salesTargetBdt: "500000.00", newCustomerTarget: 4, visitTarget: 20, collectionTargetBdt: "350000.00", createdByUserId: "u-sales-manager", createdAt: businessTime(-25, 9) },
  { id: "target-sales4", userId: "sales4", month: businessDay().slice(0, 7), salesTargetBdt: "550000.00", newCustomerTarget: 4, visitTarget: 20, collectionTargetBdt: "400000.00", createdByUserId: "u-sales-manager", createdAt: businessTime(-25, 9) },
  { id: "target-sales5", userId: "sales5", month: businessDay().slice(0, 7), salesTargetBdt: "400000.00", newCustomerTarget: 3, visitTarget: 18, collectionTargetBdt: "250000.00", createdByUserId: "u-sales-manager", createdAt: businessTime(-25, 9) }
];

export const marketingScoreRules: MarketingScoreRule[] = [
  { id: "score-customer", event: "NEW_QUALIFIED_CUSTOMER", label: "New qualified customer", points: 5, active: true },
  { id: "score-visit", event: "VERIFIED_CUSTOMER_VISIT", label: "Verified customer visit", points: 10, active: true },
  { id: "score-lead", event: "QUALIFIED_LEAD", label: "Qualified lead", points: 10, active: true },
  { id: "score-quote", event: "QUOTATION_SUBMITTED", label: "Quotation submitted", points: 15, active: true },
  { id: "score-order", event: "ORDER_RECEIVED", label: "Order received", points: 30, active: true },
  { id: "score-collection", event: "PAYMENT_COLLECTED", label: "Payment collected", points: 20, active: true },
  { id: "score-follow", event: "FOLLOW_UP_COMPLETED", label: "Follow-up completed", points: 5, active: true }
];

export const products: Product[] = [
  { id: "prd-d17h", code: "DIAL-17H", family: "Dialyzer", variant: "1.7H", name: "Dialyzer 1.7H", unit: "pcs", hsCode: "9018.90", standardSalePrice: "690.00", active: true, imageUrl: "/products/dialyzer.jpg" },
  { id: "prd-d17l", code: "DIAL-17L", family: "Dialyzer", variant: "1.7L", name: "Dialyzer 1.7L", unit: "pcs", hsCode: "9018.90", standardSalePrice: "690.00", active: true, imageUrl: "/products/dialyzer.jpg" },
  { id: "prd-d15h", code: "DIAL-15H", family: "Dialyzer", variant: "1.5H", name: "Dialyzer 1.5H", unit: "pcs", hsCode: "9018.90", standardSalePrice: "700.00", active: true, imageUrl: "/products/dialyzer.jpg" },
  { id: "prd-d15l", code: "DIAL-15L", family: "Dialyzer", variant: "1.5L", name: "Dialyzer 1.5L", unit: "pcs", hsCode: "9018.90", standardSalePrice: "700.00", active: true, imageUrl: "/products/dialyzer.jpg" },
  { id: "prd-d16h", code: "DIAL-16H", family: "Dialyzer", variant: "1.6H", name: "Dialyzer 1.6H", unit: "pcs", hsCode: "9018.90", standardSalePrice: "690.00", active: true, imageUrl: "/products/dialyzer.jpg" },
  { id: "prd-d16l", code: "DIAL-16L", family: "Dialyzer", variant: "1.6L", name: "Dialyzer 1.6L", unit: "pcs", hsCode: "9018.90", standardSalePrice: "690.00", active: true, imageUrl: "/products/dialyzer.jpg" },
  { id: "prd-bts", code: "BTS-001", family: "Blood Line", variant: "Standard", name: "Blood Line Sets", unit: "set", hsCode: "9018.90", standardSalePrice: "230.00", active: true, imageUrl: "/products/blood-tubing-set.png" },
  { id: "prd-av16", code: "AVF-16G", family: "AV Fistula", variant: "16G", name: "AV Fistula 16G", unit: "pcs", hsCode: "9018.32", standardSalePrice: "60.00", active: true, imageUrl: "/products/av-fistula-needle.jpg" },
  { id: "prd-av17", code: "AVF-17G", family: "AV Fistula", variant: "17G", name: "AV Fistula 17G", unit: "pcs", hsCode: "9018.32", standardSalePrice: "60.00", active: true, imageUrl: "/products/av-fistula-needle.jpg" },
  { id: "prd-cat", code: "CATH-7F13", family: "Catheter", variant: "7Fr-13cm", name: "Central Venous Catheter 7Fr-13cm", unit: "pcs", hsCode: "9018.39", standardSalePrice: "1300.00", active: true, imageUrl: "/products/iv-catheter.jpg" }
];

export const productAliases = [
  { id: "alias-1", aliasText: "Dialyzer 1.7 High Flux", productId: "prd-d17h", productName: "Dialyzer 1.7H", source: "Sales_Ledger_1.2.1.xlsx", active: true },
  { id: "alias-2", aliasText: "Bloodline Set", productId: "prd-bts", productName: "Blood Line Sets", source: "Sales_Ledger_1.2.1.xlsx", active: true },
  { id: "alias-3", aliasText: "A.V. Fistula 16", productId: "prd-av16", productName: "AV Fistula 16G", source: "Sales_Ledger_1.2.1.xlsx", active: true }
];

export const suppliers: Supplier[] = [
  { id: "sup-renhe", name: "Guangzhou Renhe Medical Technology", country: "China", contactPerson: "Liu Wen", phone: "+86 20 5550 1840", email: "export@renhe-med.cn", paymentTerms: "LC at sight", active: true },
  { id: "sup-aoxin", name: "Shanghai Aoxin Medical Supply", country: "China", contactPerson: "Chen Yu", phone: "+86 21 8810 2260", email: "sales@aoxin-med.cn", paymentTerms: "30% TT / 70% before shipment", active: true },
  { id: "sup-safe", name: "Qingdao SafeHand Medical", country: "China", contactPerson: "Mei Zhang", phone: "+86 532 4418 0930", email: "trade@safehand.cn", paymentTerms: "LC 60 days", active: true }
];

function uploadedDocument(input: {
  id: string;
  entityType: DocumentRecord["entityType"];
  entityId: string;
  documentType: string;
  fileName: string;
  createdAt: string;
  createdByUserId?: string;
  createdByName?: string;
  mimeType?: string;
  sizeBytes?: number;
  sensitive?: boolean;
}): DocumentRecord {
  return {
    id: input.id,
    entityType: input.entityType,
    entityId: input.entityId,
    documentType: input.documentType,
    source: "UPLOADED",
    fileName: input.fileName,
    mimeType: input.mimeType ?? "application/pdf",
    sizeBytes: input.sizeBytes ?? 183200,
    previewUrl: `/api/documents/${input.id}/content`,
    sensitive: input.sensitive ?? false,
    createdByUserId: input.createdByUserId ?? "u-import",
    createdByName: input.createdByName ?? "Tanvir Hasan",
    createdAt: input.createdAt
  };
}

function importDocument(input: { id: string; type: string; name: string; uploadedAt: string; sensitive?: boolean }): ImportDocument {
  const common = uploadedDocument({ id: input.id, entityType: "import", entityId: "imp-77612", documentType: input.type, fileName: input.name, createdAt: input.uploadedAt, sensitive: input.sensitive });
  return { ...common, importId: "imp-77612", type: input.type, name: input.name, uploadedAt: input.uploadedAt, uploadedBy: common.createdByName, status: "Available" };
}

const lcItems = [
  { id: "ii-77612-1", productId: "prd-d17h", productCode: "DIAL-17H", productName: "Dialyzer 1.7H", quantity: "10500", unit: "pcs", currency: "USD", fobUnitForeign: "3.20", exchangeRate: "122.50", fobTotalBdt: "4116000.00", cbmPerCarton: "0.080", cartonCount: "210", totalCbm: "16.80", grossWeight: "4200", netWeight: "3885", hsCode: "9018.90" },
  { id: "ii-77612-2", productId: "prd-bts", productCode: "BTS-001", productName: "Blood Line Sets", quantity: "10500", unit: "set", currency: "USD", fobUnitForeign: "0.78", exchangeRate: "122.50", fobTotalBdt: "1003275.00", cbmPerCarton: "0.107", cartonCount: "160", totalCbm: "17.12", grossWeight: "2950", netWeight: "2690", hsCode: "9018.90" },
  { id: "ii-77612-3", productId: "prd-av16", productCode: "AVF-16G", productName: "AV Fistula 16G", quantity: "5000", unit: "pcs", currency: "USD", fobUnitForeign: "0.18", exchangeRate: "122.50", fobTotalBdt: "110250.00", cbmPerCarton: "0.050", cartonCount: "100", totalCbm: "5.00", grossWeight: "620", netWeight: "560", hsCode: "9018.32" }
];

export const imports: ImportCase[] = [
  {
    id: "imp-77612", draftReference: "IMP-2026-001", primaryReference: "LC-77612", supplierId: "sup-renhe", supplierName: "Guangzhou Renhe Medical Technology", poNumber: "PO-2026-001", poDate: "2026-05-18", piNumber: "PI-RH-26061", piDate: "2026-05-21", paymentMode: "LC", lcNumber: "LC-77612", bank: "City Bank PLC", currency: "USD", exchangeRate: "122.50", rateDate: "2026-06-02", rateSource: "Bank statement", expectedShipmentDate: "2026-07-18", blNumber: "CN-9982", containerNumber: "MSCU-7391024", containerType: "40 FT", vesselName: "COSCO Shipping Star", etd: "2026-07-20", eta: "2026-08-18", status: "Costing", milestone: "Costing", costingStatus: "In Progress", warehouseStatus: "Not Ready", notes: "Customs assessment received. Cost lines are being reconciled before warehouse receiving.", items: lcItems,
    costs: [
      { id: "cost-frt", name: "China-Bangladesh Sea Freight", category: "Freight", amountForeign: "3000.00", currency: "USD", exchangeRate: "122.50", amountBdt: "367500.00", allocationMethod: "CBM", appliesToItemIds: [], vendor: "COSCO Shipping", paymentDate: "2026-07-18", notes: "Container freight allocated by product CBM.", attachmentName: "freight-invoice.pdf", attachment: uploadedDocument({ id: "doc-cost-frt", entityType: "import-cost", entityId: "cost-frt", documentType: "Freight Invoice", fileName: "freight-invoice.pdf", createdAt: "2026-08-19T09:00:00.000Z", createdByUserId: "u-super", createdByName: "Sadia Karim", sensitive: true }), enteredBy: "Sadia Karim", createdAt: "2026-08-19T09:00:00.000Z" },
      { id: "cost-duty-d", name: "Customs Duty - Dialyzer", category: "Customs Duty", amountForeign: "525000.00", currency: "BDT", exchangeRate: "1", amountBdt: "525000.00", allocationMethod: "PRODUCT_SPECIFIC", appliesToItemIds: ["ii-77612-1"], vendor: "Bangladesh Customs", notes: "Final assessed amount entered manually.", enteredBy: "Sadia Karim", createdAt: "2026-08-19T09:15:00.000Z" },
      { id: "cost-duty-b", name: "Customs Duty - Blood Line", category: "Customs Duty", amountForeign: "410000.00", currency: "BDT", exchangeRate: "1", amountBdt: "410000.00", allocationMethod: "PRODUCT_SPECIFIC", appliesToItemIds: ["ii-77612-2"], vendor: "Bangladesh Customs", notes: "Final assessed amount entered manually.", enteredBy: "Sadia Karim", createdAt: "2026-08-19T09:20:00.000Z" },
      { id: "cost-duty-a", name: "Customs Duty - AV Fistula", category: "Customs Duty", amountForeign: "92000.00", currency: "BDT", exchangeRate: "1", amountBdt: "92000.00", allocationMethod: "PRODUCT_SPECIFIC", appliesToItemIds: ["ii-77612-3"], vendor: "Bangladesh Customs", notes: "Final assessed amount entered manually.", enteredBy: "Sadia Karim", createdAt: "2026-08-19T09:25:00.000Z" },
      { id: "cost-bank", name: "Bank LC Opening Fee", category: "Bank", amountForeign: "85000.00", currency: "BDT", exchangeRate: "1", amountBdt: "85000.00", allocationMethod: "FOB_VALUE", appliesToItemIds: [], vendor: "City Bank PLC", enteredBy: "Sadia Karim", createdAt: "2026-08-19T09:30:00.000Z" },
      { id: "cost-ins", name: "Marine Insurance", category: "Insurance", amountForeign: "42500.00", currency: "BDT", exchangeRate: "1", amountBdt: "42500.00", allocationMethod: "FOB_VALUE", appliesToItemIds: [], vendor: "Green Delta Insurance", enteredBy: "Sadia Karim", createdAt: "2026-08-19T09:35:00.000Z" },
      { id: "cost-cf", name: "C&F Cost", category: "Port / C&F", amountForeign: "120000.00", currency: "BDT", exchangeRate: "1", amountBdt: "120000.00", allocationMethod: "FOB_VALUE", appliesToItemIds: [], vendor: "Port Link C&F", enteredBy: "Sadia Karim", createdAt: "2026-08-19T09:40:00.000Z" },
      { id: "cost-gate", name: "Gate Fee", category: "Port / C&F", amountForeign: "3566.00", currency: "BDT", exchangeRate: "1", amountBdt: "3566.00", allocationMethod: "FOB_VALUE", appliesToItemIds: [], enteredBy: "Sadia Karim", createdAt: "2026-08-19T09:45:00.000Z" },
      { id: "cost-port", name: "Port Utility", category: "Port / C&F", amountForeign: "28000.00", currency: "BDT", exchangeRate: "1", amountBdt: "28000.00", allocationMethod: "FOB_VALUE", appliesToItemIds: [], enteredBy: "Sadia Karim", createdAt: "2026-08-19T09:50:00.000Z" },
      { id: "cost-local", name: "Local Covered Van", category: "Local Transport", amountForeign: "60000.00", currency: "BDT", exchangeRate: "1", amountBdt: "60000.00", allocationMethod: "CBM", appliesToItemIds: [], vendor: "Chattogram Logistics", enteredBy: "Sadia Karim", createdAt: "2026-08-19T10:00:00.000Z" },
      { id: "cost-labour", name: "Unloading Labour", category: "Labour", amountForeign: "18000.00", currency: "BDT", exchangeRate: "1", amountBdt: "18000.00", allocationMethod: "QUANTITY", appliesToItemIds: [], enteredBy: "Sadia Karim", createdAt: "2026-08-19T10:05:00.000Z" }
    ],
    documents: [
      importDocument({ id: "doc-pi", type: "PI", name: "PI-RH-26061.pdf", uploadedAt: "2026-05-21" }),
      importDocument({ id: "doc-lc", type: "LC", name: "LC-77612-swift.pdf", uploadedAt: "2026-06-02" }),
      importDocument({ id: "doc-bl", type: "Bill of Lading", name: "CN-9982.pdf", uploadedAt: "2026-07-21" }),
      importDocument({ id: "doc-assess", type: "Customs Assessment", name: "customs-assessment-77612.pdf", uploadedAt: "2026-08-19", sensitive: true })
    ], createdAt: "2026-05-18T08:00:00.000Z", updatedAt: "2026-08-19T10:05:00.000Z"
  },
  {
    id: "imp-draft-2", draftReference: "IMP-2026-002", primaryReference: "IMP-2026-002", supplierId: "sup-aoxin", supplierName: "Shanghai Aoxin Medical Supply", poNumber: "PO-2026-006", poDate: "2026-08-15", piNumber: "PI-AOX-26088", piDate: "2026-08-17", paymentMode: "LC", currency: "USD", exchangeRate: "122.75", rateDate: "2026-08-17", rateSource: "Provisional bank quote", expectedShipmentDate: "2026-10-10", status: "PI Received", milestone: "PI Received", costingStatus: "Not Started", warehouseStatus: "Not Ready", notes: "LC application preparation in progress.", items: [{ id: "ii-draft-1", productId: "prd-d15h", productCode: "DIAL-15H", productName: "Dialyzer 1.5H", quantity: "8000", unit: "pcs", currency: "USD", fobUnitForeign: "3.15", exchangeRate: "122.75", fobTotalBdt: "3093300.00", cbmPerCarton: "0.08", cartonCount: "160", totalCbm: "12.80", hsCode: "9018.90" }], costs: [], documents: [], createdAt: "2026-08-15T08:00:00.000Z", updatedAt: "2026-08-17T11:00:00.000Z"
  },
  {
    id: "imp-tt-8", draftReference: "IMP-2026-003", primaryReference: "TT-26008", supplierId: "sup-safe", supplierName: "Qingdao SafeHand Medical", poNumber: "PO-2026-004", poDate: "2026-07-03", piNumber: "PI-QSH-26031", piDate: "2026-07-05", paymentMode: "TT", ttReference: "TT-26008", bank: "Eastern Bank PLC", currency: "USD", exchangeRate: "121.80", rateDate: "2026-07-07", rateSource: "Bank statement", blNumber: "BL-QD-8821", containerNumber: "TLLU-228901", vesselName: "Wan Hai 512", etd: "2026-08-02", eta: "2026-08-28", status: "Shipped", milestone: "Shipped", costingStatus: "Not Started", warehouseStatus: "Not Ready", items: [{ id: "ii-tt-1", productId: "prd-av17", productCode: "AVF-17G", productName: "AV Fistula 17G", quantity: "25000", unit: "pcs", currency: "USD", fobUnitForeign: "0.19", exchangeRate: "121.80", fobTotalBdt: "578550.00", cbmPerCarton: "0.05", cartonCount: "250", totalCbm: "12.50", hsCode: "9018.32" }], costs: [], documents: [], createdAt: "2026-07-03T08:00:00.000Z", updatedAt: "2026-08-02T08:00:00.000Z"
  }
];

export const stockBatches: StockBatch[] = [
  { id: "bat-d17-old", productId: "prd-d17h", productCode: "DIAL-17H", productName: "Dialyzer 1.7H", sourceImportId: "opening-stock", sourceReference: "LEGACY-LC-77102", sourceType: "Opening Stock", lotNumber: "LOT-D17H-2509", batchNumber: "BAT-D17H-2509", manufacturingDate: "2025-09-10", expiryDate: "2028-09-09", receivedDate: "2025-11-18", quantityReceived: "1800", quantityAvailable: "450", warehouse: "MIPRO Main Warehouse", location: "Rack A-01", landedCostPerUnit: "438.25" },
  { id: "bat-d17-new", productId: "prd-d17h", productCode: "DIAL-17H", productName: "Dialyzer 1.7H", sourceImportId: "imp-old-2", sourceReference: "LC-77508", lotNumber: "LOT-D17H-2603", batchNumber: "BAT-D17H-2603", manufacturingDate: "2026-03-12", expiryDate: "2029-03-11", receivedDate: "2026-05-20", quantityReceived: "2200", quantityAvailable: "1720", warehouse: "MIPRO Main Warehouse", location: "Rack A-02", landedCostPerUnit: "452.80" },
  { id: "bat-bts-old", productId: "prd-bts", productCode: "BTS-001", productName: "Blood Line Sets", sourceImportId: "imp-old-1", sourceReference: "LC-77102", lotNumber: "LOT-BTS-2510", batchNumber: "BAT-BTS-2510", manufacturingDate: "2025-10-04", expiryDate: "2027-10-03", receivedDate: "2025-11-18", quantityReceived: "6000", quantityAvailable: "1350", warehouse: "MIPRO Main Warehouse", location: "Rack B-01", landedCostPerUnit: "158.40" },
  { id: "bat-bts-new", productId: "prd-bts", productCode: "BTS-001", productName: "Blood Line Sets", sourceImportId: "imp-old-2", sourceReference: "LC-77508", lotNumber: "LOT-BTS-2604", batchNumber: "BAT-BTS-2604", manufacturingDate: "2026-04-11", expiryDate: "2028-04-10", receivedDate: "2026-05-20", quantityReceived: "7200", quantityAvailable: "6200", warehouse: "MIPRO Main Warehouse", location: "Rack B-02", landedCostPerUnit: "164.15" },
  { id: "bat-av16", productId: "prd-av16", productCode: "AVF-16G", productName: "AV Fistula 16G", sourceImportId: "imp-old-3", sourceReference: "LC-77311", lotNumber: "LOT-AV16-2601", batchNumber: "BAT-AV16-2601", manufacturingDate: "2026-01-20", expiryDate: "2029-01-19", receivedDate: "2026-03-15", quantityReceived: "10000", quantityAvailable: "7480", warehouse: "MIPRO Main Warehouse", location: "Rack C-01", landedCostPerUnit: "42.20" },
  { id: "bat-cat", productId: "prd-cat", productCode: "CATH-7F13", productName: "Central Venous Catheter 7Fr-13cm", sourceImportId: "imp-old-4", sourceReference: "TT-25118", lotNumber: "LOT-CATH-2508", batchNumber: "BAT-CATH-2508", manufacturingDate: "2025-08-10", expiryDate: "2027-02-10", receivedDate: "2025-10-12", quantityReceived: "850", quantityAvailable: "210", warehouse: "MIPRO Main Warehouse", location: "Rack D-01", landedCostPerUnit: "890.00" }
];

export const stockMovements: StockMovement[] = [
  { id: "mov-1", date: "2026-05-20", productId: "prd-d17h", productName: "Dialyzer 1.7H", batchId: "bat-d17-new", batchNumber: "BAT-D17H-2603", type: "Receive", quantity: "2200", reference: "LC-77508", createdBy: "Aminul Islam" },
  { id: "mov-2", date: "2026-07-15", productId: "prd-d17h", productName: "Dialyzer 1.7H", batchId: "bat-d17-old", batchNumber: "BAT-D17H-2509", type: "Dispatch", quantity: "120", reference: "DC-2026-031", createdBy: "Aminul Islam" },
  { id: "mov-3", date: "2026-07-21", productId: "prd-bts", productName: "Blood Line Sets", batchId: "bat-bts-old", batchNumber: "BAT-BTS-2510", type: "Dispatch", quantity: "90", reference: "DC-2026-034", createdBy: "Aminul Islam" },
  { id: "mov-4", date: "2026-08-09", productId: "prd-d17h", productName: "Dialyzer 1.7H", batchId: "bat-d17-old", batchNumber: "BAT-D17H-2509", type: "Dispatch", quantity: "60", reference: "DC-2026-036", createdBy: "Aminul Islam" },
  { id: "mov-5", date: "2026-08-09", productId: "prd-bts", productName: "Blood Line Sets", batchId: "bat-bts-old", batchNumber: "BAT-BTS-2510", type: "Dispatch", quantity: "30", reference: "DC-2026-036", createdBy: "Aminul Islam" }
];

export const receipts: WarehouseReceipt[] = [];

export const customers: Customer[] = [
  { id: "cus-ark", name: "ARK Hospital", type: "Hospital", contactPerson: "Purchase Department", phone: "+880 1712 410011", address: "Dhaka", territory: "Dhaka North", assignedSalesUserId: "sales1", paymentTerms: "30 days", creditLimit: "500000.00", currentDue: "0.00", totalSales: "367000.00", totalCollected: "367000.00", active: true },
  { id: "cus-popular", name: "Popular Medicine & Departmental Store", type: "Pharmacy", contactPerson: "Manager", phone: "+880 1811 220035", email: "purchase@popular.example", address: "Uttara, Dhaka", latitude: 23.8759, longitude: 90.3795, territory: "Dhaka North", assignedSalesUserId: "sales1", paymentTerms: "Cash / 15 days", creditLimit: "250000.00", currentDue: "27900.00", totalSales: "86937.00", totalCollected: "59037.00", active: true },
  { id: "cus-kuwait", name: "Kuwait Moitri Hospital", type: "Hospital", contactPerson: "Medical Store", phone: "+880 1715 881220", email: "store@kuwaitmoitri.example", address: "Uttara, Dhaka", latitude: 23.8702, longitude: 90.4031, territory: "Dhaka North", assignedSalesUserId: "sales1", paymentTerms: "30 days", creditLimit: "400000.00", currentDue: "0.00", totalSales: "27600.00", totalCollected: "27600.00", active: true },
  { id: "cus-bismillah", name: "Bismillah Surgical", type: "Dealer", contactPerson: "Proprietor", phone: "+880 1912 771122", address: "Mitford, Dhaka", territory: "Dhaka Central", assignedSalesUserId: "sales2", paymentTerms: "Cash", creditLimit: "300000.00", currentDue: "0.00", totalSales: "121200.00", totalCollected: "121200.00", active: true },
  { id: "cus-labaid", name: "Labaid Specialized Hospital", type: "Hospital", contactPerson: "Supply Chain", phone: "+880 1714 330010", email: "supply@labaid.example", address: "Dhanmondi, Dhaka", latitude: 23.7392, longitude: 90.3830, territory: "Dhaka Central", assignedSalesUserId: "sales2", paymentTerms: "45 days", creditLimit: "900000.00", currentDue: "186500.00", totalSales: "945000.00", totalCollected: "758500.00", active: true },
  { id: "cus-insaf", name: "Insaf Barakah Foundation Hospital", type: "Hospital", contactPerson: "Purchase Office", phone: "+880 1718 332214", address: "Moghbazar, Dhaka", territory: "Dhaka Central", assignedSalesUserId: "sales2", paymentTerms: "30 days", creditLimit: "600000.00", currentDue: "69000.00", totalSales: "422000.00", totalCollected: "353000.00", active: true }
];

export const customerOpeningBalances: CustomerOpeningBalance[] = [
  { id: "opening-cus-labaid", customerId: "cus-labaid", customerName: "Labaid Specialized Hospital", date: "2026-01-01", historicalSales: "945000.00", historicalCollected: "608500.00", openingDue: "336500.00", reference: "SALES-LEDGER-OPENING-2026", remarks: "Verified opening position before collections entered in the ERP period.", createdBy: "Sadia Karim", createdAt: "2026-08-23T09:00:00.000Z" }
];

export const quotations: Quotation[] = [
  { id: "quo-1", quotationNumber: "QT-2026-041", leadId: "lead-2", date: "2026-08-18", customerId: "cus-popular", customerName: "Popular Medicine & Departmental Store", ownerId: "sales1", validityDays: 15, paymentTerms: "Cash / 15 days", remarks: "Delivery within three working days.", status: "Sent", lines: [{ id: "ql-1", productId: "prd-d17h", productCode: "DIAL-17H", productName: "Dialyzer 1.7H", quantity: "60", unitPrice: "690.00", discount: "0.00", lineTotal: "41400.00" }, { id: "ql-2", productId: "prd-bts", productCode: "BTS-001", productName: "Blood Line Sets", quantity: "30", unitPrice: "230.00", discount: "0.00", lineTotal: "6900.00" }], subtotal: "48300.00", discountTotal: "0.00", total: "48300.00" },
  { id: "quo-2", quotationNumber: "QT-2026-038", date: "2026-08-14", customerId: "cus-labaid", customerName: "Labaid Specialized Hospital", ownerId: "sales2", validityDays: 30, paymentTerms: "45 days", status: "Accepted", lines: [{ id: "ql-3", productId: "prd-d17h", productCode: "DIAL-17H", productName: "Dialyzer 1.7H", quantity: "180", unitPrice: "685.00", discount: "1800.00", lineTotal: "121500.00" }], subtotal: "123300.00", discountTotal: "1800.00", total: "121500.00" }
];

export const orders: SalesOrder[] = [
  { id: "so-1", orderNumber: "SO-2026-033", quotationId: "quo-2", date: "2026-08-15", customerId: "cus-labaid", customerName: "Labaid Specialized Hospital", customerAddressSnapshot: "Dhanmondi, Dhaka", customerPhoneSnapshot: "+880 1714 330010", customerContactSnapshot: "Supply Chain", ownerId: "sales2", paymentConditions: "45 days", deliveryInstruction: "Deliver to central medical store", paymentConfirmation: "Credit approved under 45-day terms", requestedDeliveryDate: "2026-08-25", orderReceivedByName: "Farhana Akter", orderReceivedByDesignation: "Sales Manager", orderGivenBy: "Labaid Supply Chain", headOfSalesSignoff: "Pending signature", coeSignoff: "Pending signature", mdSignoff: "Pending signature", amountReceived: "0.00", due: "121500.00", status: "Ready", lines: quotations[1].lines, total: "121500.00" },
  { id: "so-2", orderNumber: "SO-2026-035", date: "2026-08-08", customerId: "cus-ark", customerName: "ARK Hospital", customerAddressSnapshot: "Dhaka", customerPhoneSnapshot: "+880 1712 410011", customerContactSnapshot: "Purchase Department", ownerId: "sales1", paymentConditions: "Bank transfer on delivery", deliveryInstruction: "Deliver to the hospital receiving counter", requestedDeliveryDate: "2026-08-09", amountReceived: "47700.00", due: "0.00", status: "Delivered", lines: [{ id: "sol-2", productId: "prd-d17h", productCode: "DIAL-17H", productName: "Dialyzer 1.7H", quantity: "60", unitPrice: "680.00", discount: "0.00", lineTotal: "40800.00" }, { id: "sol-3", productId: "prd-bts", productCode: "BTS-001", productName: "Blood Line Sets", quantity: "30", unitPrice: "230.00", discount: "0.00", lineTotal: "6900.00" }], total: "47700.00" }
];

export const deliveries: Delivery[] = [
  { id: "del-1", challanNumber: "DC-2026-031", orderId: "so-old-1", customerId: "cus-popular", customerName: "Popular Medicine & Departmental Store", date: "2026-07-15", remarks: "Delivered to receiving counter", receiverName: "Store Officer", status: "Delivered", lines: [{ id: "dl-1", productId: "prd-d17h", productCode: "DIAL-17H", productName: "Dialyzer 1.7H", quantity: "120", unitPrice: "690.00", discount: "0.00", lineTotal: "82800.00", batchId: "bat-d17-old", batchNumber: "BAT-D17H-2509" }] },
  { id: "del-2", challanNumber: "DC-2026-036", orderId: "so-2", customerId: "cus-ark", customerName: "ARK Hospital", date: "2026-08-09", remarks: "Delivered against confirmed hospital order", receiverName: "Medical Store Officer", status: "Delivered", lines: [{ id: "dl-2", productId: "prd-d17h", productCode: "DIAL-17H", productName: "Dialyzer 1.7H", quantity: "60", unitPrice: "680.00", discount: "0.00", lineTotal: "40800.00", batchId: "bat-d17-old", batchNumber: "BAT-D17H-2509" }, { id: "dl-3", productId: "prd-bts", productCode: "BTS-001", productName: "Blood Line Sets", quantity: "30", unitPrice: "230.00", discount: "0.00", lineTotal: "6900.00", batchId: "bat-bts-old", batchNumber: "BAT-BTS-2510" }] }
];

export const collections: Collection[] = [
  { id: "col-1", receiptNumber: "MR-2026-051", customerId: "cus-ark", customerName: "ARK Hospital", orderId: "so-2", date: "2026-08-10", amount: "47700.00", paymentMode: "Bank Transfer", accountId: "acc-city", referenceNumber: "CITY-TRX-88112", remarks: "Full settlement of SO-2026-035 after delivery", ownerId: "sales1", status: "Posted" },
  { id: "col-2", receiptNumber: "MR-2026-052", customerId: "cus-labaid", customerName: "Labaid Specialized Hospital", date: "2026-08-17", amount: "150000.00", paymentMode: "Cheque", accountId: "acc-city", referenceNumber: "CHQ-773310", remarks: "Part collection", ownerId: "sales2", status: "Posted" },
  { id: "col-3", receiptNumber: "MR-2026-053", customerId: "cus-popular", customerName: "Popular Medicine & Departmental Store", date: "2026-08-20", amount: "28050.00", paymentMode: "bKash", accountId: "acc-bkash", referenceNumber: "BK-8H22P", remarks: "June due received", ownerId: "sales1", status: "Posted" }
];

export const accounts: CashBankAccount[] = [
  { id: "acc-cash", name: "Office Cash", type: "Cash", balance: "185420.00", active: true },
  { id: "acc-city", name: "City Bank PLC", type: "Bank", accountNumber: "**** 7761", balance: "4275000.00", active: true },
  { id: "acc-ebl", name: "Eastern Bank PLC", type: "Bank", accountNumber: "**** 2608", balance: "2180000.00", active: true },
  { id: "acc-bkash", name: "MIPRO bKash Merchant", type: "Mobile Banking", accountNumber: "01*********", balance: "92500.00", active: true }
];

export const expenseCategories = ["Office Entertainment", "Administration", "Stationery", "Printing & Photocopy", "Office Transport", "Travel", "TA", "DA", "Salary", "Rent", "Utilities", "Internet & Telephone", "Mobile / Communication", "Courier", "Fuel", "Repair & Maintenance", "Cleaning / Housekeeping", "Marketing", "Training", "Staff Welfare", "Professional / Legal", "Regulatory / License", "Bank Charges", "Miscellaneous / Other"].map((name, index) => ({ id: `ec-${index + 1}`, name, active: true }));

export const expenses: Expense[] = [
  { id: "exp-1", date: "2026-08-01", categoryId: "ec-1", categoryName: "Office Entertainment", subtype: "General", amount: "135.00", paidFromAccountId: "acc-cash", expenseFor: "Office", expenseForId: "head-office", expenseForName: "Head Office", enteredByUserId: "u-accounts", enteredByName: "Nusrat Jahan", remarks: "Tea and refreshments", status: "Posted" },
  { id: "exp-2", date: "2026-08-02", categoryId: "ec-2", categoryName: "Administration", subtype: "General", amount: "200.00", paidFromAccountId: "acc-cash", expenseFor: "Office", expenseForId: "head-office", expenseForName: "Head Office", enteredByUserId: "u-accounts", enteredByName: "Nusrat Jahan", remarks: "Office labour cost", status: "Posted" },
  { id: "exp-3", date: "2026-08-02", categoryId: "ec-5", categoryName: "Office Transport", subtype: "General", amount: "310.00", paidFromAccountId: "acc-cash", expenseFor: "Warehouse", expenseForId: "wh-main", expenseForName: "MIPRO Main Warehouse", enteredByUserId: "u-accounts", enteredByName: "Nusrat Jahan", remarks: "Local customer delivery support", status: "Posted" },
  { id: "exp-4", date: "2026-08-05", categoryId: "ec-7", categoryName: "TA", subtype: "TA/DA", amount: "2500.00", paidFromAccountId: "acc-bkash", expenseFor: "Employee", expenseForId: "sales1", expenseForName: "Rafiq Ahmed", employeeId: "sales1", employee: "Rafiq Ahmed", employeeCode: "SE-001", designation: "Sales Executive", department: "Sales", enteredByUserId: "u-accounts", enteredByName: "Nusrat Jahan", taAmount: "1800.00", daAmount: "700.00", remarks: "Mymensingh customer visit", status: "Posted" },
  { id: "exp-5", date: "2026-08-10", categoryId: "ec-10", categoryName: "Rent", subtype: "General", amount: "45000.00", paidFromAccountId: "acc-city", expenseFor: "Office", expenseForId: "head-office", expenseForName: "Head Office", enteredByUserId: "u-accounts", enteredByName: "Nusrat Jahan", remarks: "Office monthly rent", status: "Posted" },
  { id: "exp-6", date: "2026-08-12", categoryId: "ec-11", categoryName: "Utilities", subtype: "General", amount: "12850.00", paidFromAccountId: "acc-city", expenseFor: "Office", expenseForId: "head-office", expenseForName: "Head Office", enteredByUserId: "u-accounts", enteredByName: "Nusrat Jahan", remarks: "Office electricity and water", attachmentName: "office-utility-receipt.png", attachment: uploadedDocument({ id: "doc-exp-6", entityType: "expense", entityId: "exp-6", documentType: "Expense Receipt", fileName: "office-utility-receipt.png", mimeType: "image/png", sizeBytes: 1967263, createdAt: "2026-08-12", createdByUserId: "u-accounts", createdByName: "Nusrat Jahan" }), status: "Posted" },
  { id: "exp-7", date: "2026-08-15", categoryId: "ec-18", categoryName: "Marketing", subtype: "General", amount: "3850.00", paidFromAccountId: "acc-cash", expenseFor: "Employee", expenseForId: "sales2", expenseForName: "Shamima Sultana", employeeId: "sales2", employee: "Shamima Sultana", employeeCode: "SE-014", designation: "Sales Executive", department: "Sales", enteredByUserId: "u-accounts", enteredByName: "Nusrat Jahan", remarks: "Clinical presentation material and sample labels", status: "Posted" },
  { id: "exp-8", date: "2026-08-18", categoryId: "ec-15", categoryName: "Fuel", subtype: "General", amount: "2200.00", paidFromAccountId: "acc-cash", expenseFor: "Warehouse", expenseForId: "wh-main", expenseForName: "MIPRO Main Warehouse", enteredByUserId: "u-warehouse", enteredByName: "Aminul Islam", remarks: "Local distribution vehicle fuel", status: "Posted" },
  { id: "exp-9", date: "2026-08-20", categoryId: "ec-19", categoryName: "Training", subtype: "General", amount: "7500.00", paidFromAccountId: "acc-city", expenseFor: "Company / General", expenseForId: "company", expenseForName: "MIPRO HealthCare Corporation", enteredByUserId: "u-accounts", enteredByName: "Nusrat Jahan", remarks: "Product compliance refresher session", status: "Posted" },
  { id: "exp-10", date: "2026-08-22", categoryId: "ec-23", categoryName: "Bank Charges", subtype: "General", amount: "1150.00", paidFromAccountId: "acc-city", expenseFor: "Company / General", expenseForId: "company", expenseForName: "MIPRO HealthCare Corporation", enteredByUserId: "u-accounts", enteredByName: "Nusrat Jahan", remarks: "Operational bank service charge", status: "Posted" }
];

export const accountTransactions: AccountTransaction[] = [
  { id: "trx-open-city", date: "2026-08-01", accountId: "acc-city", accountName: "City Bank PLC", direction: "In", amount: "4075000.00", sourceType: "Opening Balance", sourceId: "opening", description: "Opening balance" },
  { id: "trx-col-1", date: "2026-08-10", accountId: "acc-city", accountName: "City Bank PLC", direction: "In", amount: "47700.00", sourceType: "Collection", sourceId: "col-1", description: "ARK Hospital collection" },
  { id: "trx-col-2", date: "2026-08-17", accountId: "acc-city", accountName: "City Bank PLC", direction: "In", amount: "150000.00", sourceType: "Collection", sourceId: "col-2", description: "Labaid collection" },
  { id: "trx-exp-5", date: "2026-08-10", accountId: "acc-city", accountName: "City Bank PLC", direction: "Out", amount: "45000.00", sourceType: "Expense", sourceId: "exp-5", description: "Office monthly rent" }
];

export const decisions: BusinessDecision[] = [
  { id: "dec-cost-default", title: "Common cost allocation default", question: "Should common bank, insurance and C&F charges default to FOB value?", currentBehavior: "Every common cost line requires an explicit allocation choice; FOB Value is only suggested.", status: "Pending Client Confirmation", blocks: ["Automatic common-cost default"], sourceReference: "Meeting 1 allocation discussion" },
  { id: "dec-transport", title: "Local transport allocation", question: "Should local covered-van transport default to CBM?", currentBehavior: "Local Transport presets default to CBM; an authorized user may explicitly choose another basis for an exceptional invoice.", status: "Confirmed", blocks: [], resolutionValue: "CBM", resolutionNotes: "Treat local covered-van transport like sea freight by product volume.", confirmedBy: "Client", confirmedAt: "2026-08-23T00:00:00.000Z", sourceReference: "Latest Meeting 1 discussion" },
  { id: "dec-fifo", title: "FIFO issue sequence", question: "Should dispatch recommend the oldest matching eligible batch?", currentBehavior: "Oldest non-expired matching stock is allocated first; bypass requires capability and reason.", status: "Confirmed", blocks: [], resolutionValue: "FIFO_WITH_EXPIRY_AWARENESS", resolutionNotes: "FIFO is authoritative while expiry remains visible and expired stock is excluded.", confirmedBy: "Client", confirmedAt: "2026-08-23T00:00:00.000Z", sourceReference: "Latest Meeting 1 discussion" },
  { id: "dec-invoice", title: "Invoice requirement", question: "Is an invoice mandatory, optional, or generated from order/challan?", currentBehavior: "Quotation, order, challan and collection operate without a mandatory invoice.", status: "Pending Client Confirmation", blocks: ["Invoice generation"] },
  { id: "dec-accounting", title: "Accounting depth", question: "Should MIPRO ERP replace formal accounting software?", currentBehavior: "Only operational cash, bank, expense, collection and due ledgers are enabled.", status: "Pending Client Confirmation", blocks: ["General Ledger", "Trial Balance", "Balance Sheet"] },
  { id: "dec-warehouse", title: "Additional warehouses", question: "How many active warehouse locations are required?", currentBehavior: "One MIPRO Main Warehouse is active.", status: "Pending Client Confirmation", blocks: ["Multi-warehouse transfers"] },
  { id: "dec-price", title: "Selling-price approval", question: "Which price or discount requires manager approval?", currentBehavior: "Sales can propose a price; no automatic floor is enforced.", status: "Pending Client Confirmation", blocks: ["Automatic special-price approval"] },
  { id: "dec-tax", title: "Sales VAT and tax", question: "What VAT/tax rules apply to sales documents?", currentBehavior: "No sales tax is calculated or printed.", status: "Pending Client Confirmation", blocks: ["Sales tax automation"] },
  { id: "dec-finalize", title: "Cost finalization authority", question: "Who may finalize or reopen landed cost besides the owner?", currentBehavior: "Only Super Admin can finalize or reopen before receipt. Reopening after any warehouse receipt is blocked.", status: "Pending Client Confirmation", blocks: ["Delegated finalization", "Post-receipt valuation adjustment"], sourceReference: "Simplified plan and update1 integrity audit" }
];

export const warehouseConfig: WarehouseConfig = {
  id: "wh-main",
  name: "MIPRO Main Warehouse",
  address: "Uttara, Dhaka, Bangladesh",
  contactPerson: "Aminul Islam",
  phone: "+880 1711 000005",
  locations: ["Rack A-01", "Rack A-02", "Rack B-01", "Rack B-02", "Rack C-01", "Rack D-01"],
  active: true
};

export const costPresets: CostPreset[] = [
  { id: "preset-freight", name: "Ocean / Air Freight", category: "Freight", suggestedAllocationMethod: "CBM", requiresExplicitChoice: true, active: true },
  { id: "preset-duty", name: "Assessed Customs Duty", category: "Customs Duty", suggestedAllocationMethod: "PRODUCT_SPECIFIC", requiresExplicitChoice: true, active: true },
  { id: "preset-bank", name: "Bank Charge", category: "Bank Charge", suggestedAllocationMethod: "FOB_VALUE", requiresExplicitChoice: true, active: true },
  { id: "preset-local", name: "Local Transport", category: "Local Transport", suggestedAllocationMethod: "CBM", requiresExplicitChoice: false, active: true }
];

export const printConfiguration: PrintConfiguration = {
  defaultIdentityId: "mipro",
  identities: [
    { id: "mipro", displayName: "MIPRO Healthcare", companyName: "MIPRO HEALTHCARE CORPORATION", address: "Flat-B2, House-26, Road-06, Sector-09, Uttara, Dhaka-1230", phone: "+88 018 05 050780", email: "ledtrackers@gmail.com", website: "www.miprobd.com", logoUrl: "/mipro-logo.png", backgroundImageUrl: "/mipro-letterhead.jpg", footerText: "PRECISION IN HEALTHCARE", authorizedSignatory: "Authorized Signatory", safeArea: { topMm: 39, rightMm: 19, bottomMm: 24, leftMm: 24 } },
    { id: "led-trackers", displayName: "LED Trackers", companyName: "LED TRACKERS", address: "Flat-B2, House-26, Road-06, Sector-09, Uttara, Dhaka-1230", phone: "+88 018 05 050780", email: "ledtrackers@gmail.com", website: "www.miprobd.com", logoUrl: "/mipro-logo.png", backgroundImageUrl: "/led-letterhead.jpg", footerText: "PRECISION IN HEALTHCARE", authorizedSignatory: "Authorized Signatory", safeArea: { topMm: 39, rightMm: 19, bottomMm: 24, leftMm: 24 } }
  ],
  defaultLetterheadMode: "Digital"
};

export const auditEvents: AuditEvent[] = [
  { id: "audit-1", timestamp: "2026-08-19T10:05:00.000Z", userId: "u-super", userName: "Sadia Karim", role: "Super Admin", action: "Cost line added", entityType: "Import", entityId: "imp-77612", summary: "Unloading Labour added with Quantity allocation." },
  { id: "audit-2", timestamp: "2026-08-20T12:20:00.000Z", userId: "u-accounts", userName: "Nusrat Jahan", role: "Accounts", action: "Collection posted", entityType: "Collection", entityId: "col-3", summary: "Tk 28,050 posted to MIPRO bKash Merchant." },
  { id: "audit-3", timestamp: "2026-07-15T09:45:00.000Z", userId: "u-warehouse", userName: "Aminul Islam", role: "Warehouse Manager", action: "Stock dispatched", entityType: "Delivery", entityId: "del-1", summary: "120 Dialyzer 1.7H dispatched from oldest eligible batch." }
];
