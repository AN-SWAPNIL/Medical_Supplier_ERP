import type { PersistentReport } from "./persistentContracts.js";

// Keep the detailed export contract; group related facts for readable screen/A4 columns.
export function reportPresentation(report:PersistentReport):PersistentReport {
  if(!["employee-activity","daily-marketing"].includes(report.id))return report;
  return {...report,columns:[
    {key:"activity_time",label:"Date / Time (Dhaka)",format:"text"},
    {key:"activity_employee",label:"Employee / ID",format:"text"},
    {key:"activity_record",label:"Activity / Reference",format:"text"},
    {key:"subject",label:"Customer / Lead",format:"text"},
    {key:"activity_details",label:"Purpose / Outcome",format:"text"},
    {key:"activity_status",label:"Source / Status",format:"text"}
  ],rows:report.rows.map((row)=>({...row,
    activity_time:[row.date,row.occurred?`Occurred: ${row.occurred}`:"",row.submitted?`Submitted: ${row.submitted}`:""].filter(Boolean).join("\n"),
    activity_employee:[row.employee_label,row.territory].filter(Boolean).join("\n"),
    activity_record:[row.activity,row.reference].filter(Boolean).join("\n"),
    activity_details:[row.purpose,row.remarks].filter(Boolean).join("\n"),
    activity_status:[row.verification==="MANUAL"?"Self-reported":row.verification==="SYSTEM_VERIFIED"?"System record":row.verification,row.status,row.reason].filter(Boolean).join("\n")
  }))};
}
