import assert from "node:assert/strict";
import test from "node:test";
import type { ReportTable } from "../erp.types";
import { appendReportFilters, filterReportRows, readReportFilters, reportFilterOptions } from "./reportFilters";

const table: ReportTable = {
  id: "sales-order-register",
  title: "Sales Order Register",
  columns: [
    { key: "order", label: "Order" },
    { key: "customer", label: "Customer" },
    { key: "salesperson", label: "Salesperson" },
    { key: "status", label: "Status" }
  ],
  rows: [
    { order: "SO-001", customer: "Labaid", salesperson: "Rafiq", status: "Open" },
    { order: "SO-002", customer: "Popular", salesperson: "Rafiq", status: "Delivered" },
    { order: "SO-003", customer: "Labaid", salesperson: "Shamima", status: "Open" }
  ]
};

test("report filters combine dimensions without changing source rows", () => {
  const filtered = filterReportRows(table, { customer: "Labaid", salesperson: "Rafiq", status: "Open" });
  assert.deepEqual(filtered.map((row) => row.order), ["SO-001"]);
  assert.equal(table.rows.length, 3);
});

test("report filter options are unique and sorted", () => {
  assert.deepEqual(reportFilterOptions(table, "customer"), ["Labaid", "Popular"]);
});

test("report filters round-trip through print and deep-link query parameters", () => {
  const params = new URLSearchParams();
  appendReportFilters(params, { customer: "Labaid", status: "Open" });
  assert.deepEqual(readReportFilters(params), { customer: "Labaid", status: "Open" });
});
