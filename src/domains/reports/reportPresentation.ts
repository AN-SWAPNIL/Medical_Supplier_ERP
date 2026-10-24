import type { PersistentReport } from "./persistentContracts.js";

// Keep the detailed export contract; group related facts for readable screen/A4 columns.
export function reportPresentation(report:PersistentReport):PersistentReport {
  if(report.id==="visit-verification")return {...report,columns:[
    {key:"visit_record",label:"Visit / Server Time (Dhaka)",format:"text"},
    {key:"employee_label",label:"Employee / ID",format:"text"},
    {key:"visit_contact",label:"Customer / Purpose / Outcome",format:"text"},
    {key:"location_detail",label:"Location Evidence",format:"text"},
    {key:"evidence",label:"Photo Evidence",format:"text"},
    {key:"visit_review",label:"Status / Manager Review",format:"text"}
  ],rows:report.rows.map((row)=>({...row,visit_record:[row.reference,row.timing].filter(Boolean).join("\n"),visit_contact:[row.subject,row.details].filter(Boolean).join("\n"),visit_review:[row.status,row.review_detail].filter(Boolean).join("\n"),location_detail:row.location_detail?.replaceAll("_"," ")}))};
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
    activity_status:[row.verification==="MANUAL"?"Self-reported":row.verification==="SYSTEM_VERIFIED"?"System record":row.verification==="EVIDENCE_ASSISTED"?"Check-in evidence (not proof)":row.verification,row.status,row.reason].filter(Boolean).join("\n")
  }))};
}
