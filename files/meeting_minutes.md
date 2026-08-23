# Project Meeting Minutes
**Project:** Custom ERP & Sales Mobile App (Import & Distribution)
**Module:** Import Flow Costing & Marketing/Sales Flow

---

## Meeting 1: Import Flow & Costing Mechanics

### 1. Costing & Landed Cost Calculation
The core requirement is to accurately calculate the exact "Landed Cost" per unit for imported medical items (e.g., Dialyzers, Blood Tubing Sets). The system must distribute aggregate costs down to the individual piece level to ensure accurate profit/loss tracking.

*   **Freight/Shipping Costs (CBM-based):** Sea freight charges (e.g., $3000 for a container) must be distributed among items based on their volume/CBM (Cubic Meters). The system needs an algorithm to handle this auto-distribution depending on the items' sizes and quantities in the container.
*   **Customs Duty Fee (HS Code-based):** Duty fees vary significantly by product type based on HS codes (e.g., Bloodline might be 43%, Dialyzer 7.5%). The admin will input the total duty assessed by customs for each product category, and the system must divide this by the product quantity to find the per-piece duty cost.
*   **Utility & Port Costs:** Common costs like CNF (Clearing & Forwarding), Gate Fees, Port Utility, and Local Transport (trucking to the warehouse) apply generally to the entire LC (Letter of Credit) shipment. These must be distributed either by quantity or by product value (percentage of total shipment cost) across all items.
*   **Bank & LC Fees:** Bank processing fees and insurance costs associated with opening the LC should also be factored into the shipment's overall utility costing.

### 2. Inventory Management (FIFO/LIFO)
*   **Batch & Expiry Tracking:** Items are sensitive medical devices. Upon warehouse entry, items must be logged with Manufacturing Date, Expiry Date, and Lot Number.
*   **Dispatch Logic:** The system must strictly track and enforce FIFO (First In, First Out) to ensure older batches are sold before newer ones. 
*   **AI/Smart Notifications:** The system should notify management if a sales rep is attempting LIFO (Last In, First Out) when older stock is still available, preventing expiry losses.

### 3. Expenditure Tracking
*   **Monthly Expenditures:** Operational costs such as Office Rent, Warehouse Rent, Employee Salaries, and Office Utility Bills should be maintained in a separate Monthly Expenditure/Accounts module, distinct from the per-item landing cost.

### 4. Admin vs. User Access
*   **Cost Privacy:** The actual landing cost components are highly confidential. Only Super Admins (or specifically authorized personnel) should view or edit cost inputs and profit margins. Field sales staff must not have access to these real cost metrics.

---

## Meeting 2: Marketing, Sales Flow & Mobile App Features

### 1. Employee Tracking & GPS
*   **Attendance & Location:** The mobile app must capture check-in and check-out times along with GPS location data.
*   **Market Visits:** The app must track client visits (hospitals/clinics), logging the location and time of the visit.

### 2. Sales Planning & Reporting
*   **Work Plans:** Sales representatives must be able to input Monthly Plans (e.g., submitted on the 30th of the prior month) and Daily Route Plans.
*   **Visit Feedback:** After a visit, reps must input outcomes (e.g., Green/Yellow status, settled deals, pending actions).
*   **Performance Dashboard:** Management requires a dashboard tracking active employees, daily visits, new leads, follow-ups, quotations sent, active orders, and sales collection per employee.

### 3. Quotation & Order Generation
*   **Quotation Creation:** Sales reps will generate quotations from their mobile app. The quotation must include item names, quantities, and customized pricing/discounts.
*   **Document Formats:** Quotations should have two output formats:
    *   *Digital/Virtual Format:* A PDF generated with the company's digital letterhead/background.
    *   *Physical Print Format:* A blank format adjusted to print perfectly on the company's pre-printed physical letterhead paper (offset margins).
*   **Order Conversion:** Once a quotation is accepted, the rep will place the order. The system tracks the funnel: Quotation -> Placed Order -> Delivery Challan -> Payment Collection.

### 4. Delivery & Payments
*   **Delivery Challans:** When goods are dispatched, a Delivery Challan is generated with remarks (e.g., "Collect Cash on Delivery"). It requires sign-offs from the client/receiver.
*   **Payment Collection:** The system must record the mode of payment (Cash, Mobile Banking/bKash, Bank Check, Credit) and link it directly to the company's designated bank accounts (e.g., City Bank).

### 5. Development Next Steps
*   **Frontend Demo:** The developer will finalize the frontend UI/UX logic for both the ERP and the Sales App next week for review.
*   **Backend & Database:** Following frontend approval, database structuring and backend integration will commence. A new, optimized database may be provisioned if the current host's resources (speed) are insufficient, though user traffic is expected to be low.
