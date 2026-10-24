import { sql } from "drizzle-orm";
import type { User } from "../../src/types/index.js";
import { hasCapability } from "../../src/lib/permissions/effectiveAccess.js";
import { between, count, dim, money, qty, raw, text, type Query, type Spec } from "./common.js";
import { expiryBands } from "../../src/domains/inventory/expiry.js";

export function inventorySpec(id: string, user: User, q: Query): Spec | undefined {
  const dimensions = { product: dim("product_id", "product"), family: dim("family"), status: dim("status") };
  const canCost = hasCapability(user, "view_sensitive_cost");
  if (id === "stock-movement") return {
    base: sql`select m.date,m.id,m.reference,m.type status,b.product_id,p.code,p.name product,p.family,p.unit,b.batch_number batch,b.lot_number lot,b.expiry_date expiry,m.quantity,m.value_bdt value,m.created_by_name actor from erp_private.stock_movements m join erp_private.stock_batches b on b.id=m.batch_id join erp_private.products p on p.id=b.product_id where ${between(sql`m.date`,q)}`,
    dimensions, result: raw("select * from scoped order by date,reference,id"), basis: "Immutable receipt/dispatch postings inside the selected period. Quantity and cost are the saved posting amounts, not recomputed display unit costs.", inventoryJournal: true,
    columns: [text("date", "Date"), text("reference", "Reference"), text("status", "Movement"), text("code", "Code"), text("product", "Product"), text("unit", "Unit"), text("batch", "Batch"), text("lot", "LOT"), text("expiry", "Expiry"), qty("quantity", "Quantity"), ...(canCost ? [money("value", "Movement Cost", false)] : []), text("actor", "Posted By")]
  };
  if (["current-stock", "expiry-report"].includes(id)) return {
    base: sql`select b.id,b.product_id,p.code,p.name product,p.family,p.unit,b.batch_number batch,b.lot_number lot,b.source_reference reference,b.received_date received,b.expiry_date expiry,b.warehouse,b.location,
      case when b.expiry_date<${q.to}::date then 'Expired' when b.expiry_date<=${q.to}::date+${expiryBands[0].days}::integer then '1 Month Alert' when b.expiry_date<=${q.to}::date+${expiryBands[1].days}::integer then '3 Month Alert' when b.expiry_date<=${q.to}::date+${expiryBands[2].days}::integer then '6 Month Alert' else 'Normal' end status,
      coalesce((select sum(case when m.type='Receive' then m.quantity when m.type='Dispatch' then -m.quantity end) from erp_private.stock_movements m where m.batch_id=b.id and m.date<=${q.to}::date),0) quantity,
      coalesce((select sum(case when m.type='Receive' then m.value_bdt when m.type='Dispatch' then -m.value_bdt end) from erp_private.stock_movements m where m.batch_id=b.id and m.date<=${q.to}::date),0) value
      from erp_private.stock_batches b join erp_private.products p on p.id=b.product_id where b.received_date<=${q.to}::date`,
    dimensions, result: sql`select * from scoped where quantity>0 ${id === "expiry-report" ? raw("and status<>'Normal'") : raw("")} order by expiry,received,id`, inventoryJournal: true,
    basis: "Physical on-hand position reconstructed from saved stock journals through the end date. Expired stock remains physically on hand but is not eligible for dispatch; expiry bands use the same 31/92/183-day boundaries as Inventory, measured from the end date.",
    columns: [text("code", "Code"), text("product", "Product"), text("unit", "Unit"), text("reference", "Import Reference"), text("lot", "LOT"), text("batch", "Batch"), text("received", "Received"), text("expiry", "Expiry"), text("status", "Expiry Status"), text("location", "BIN"), qty("quantity", "On Hand"), ...(canCost ? [money("value", "Inventory Value")] : [])]
  };
  if (["product-list", "stock-summary", "item-details"].includes(id)) return {
    base: sql`select p.id product_id,p.code,p.name product,p.family,p.variant,p.unit,p.hs_code hs_code,p.standard_sale_price price,case when p.active then 'Active' else 'Inactive' end status,
      coalesce((select sum(case when m.type='Receive' then m.quantity when m.type='Dispatch' then -m.quantity end) from erp_private.stock_movements m join erp_private.stock_batches b on b.id=m.batch_id where b.product_id=p.id and m.date<=${q.to}::date),0) quantity,
      coalesce((select sum(case when m.type='Receive' then m.value_bdt when m.type='Dispatch' then -m.value_bdt end) from erp_private.stock_movements m join erp_private.stock_batches b on b.id=m.batch_id where b.product_id=p.id and m.date<=${q.to}::date),0) value,
      (select count(*) from erp_private.stock_batches b where b.product_id=p.id and b.received_date<=${q.to}::date and coalesce((select sum(case when m.type='Receive' then m.quantity when m.type='Dispatch' then -m.quantity end) from erp_private.stock_movements m where m.batch_id=b.id and m.date<=${q.to}::date),0)>0) batches,
      (select min(b.expiry_date) from erp_private.stock_batches b where b.product_id=p.id and b.received_date<=${q.to}::date and coalesce((select sum(case when m.type='Receive' then m.quantity when m.type='Dispatch' then -m.quantity end) from erp_private.stock_movements m where m.batch_id=b.id and m.date<=${q.to}::date),0)>0) expiry
      from erp_private.products p`,
    dimensions, result: raw("select * from scoped order by code,product_id"), inventoryJournal: true,
    basis: "Current canonical product directory, with physical stock/value reconstructed through the end date. Product names, active status and standard selling prices are current master data, not historical price snapshots.",
    columns: [text("code", "Code"), text("product", "Product"), text("family", "Family"), text("variant", "Variant"), text("unit", "Unit"), text("status", "Status"), qty("quantity", "On Hand"), count("batches", "Stocked Batches"), text("expiry", "Nearest Expiry"), ...(id === "item-details" && user.role !== "Warehouse Manager" ? [money("price", "Current Standard Price", false)] : []), ...(canCost ? [money("value", "Inventory Value")] : [])]
  };
  return undefined;
}
