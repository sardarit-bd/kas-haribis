export async function ensureCertificationApplications(db: any) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS certification_applications (id TEXT PRIMARY KEY,reference TEXT NOT NULL UNIQUE,company_name TEXT NOT NULL,contact_name TEXT NOT NULL,email TEXT NOT NULL,phone TEXT,website TEXT,investment_type TEXT,offering_name TEXT,minimum_investment TEXT,structure_details TEXT NOT NULL,investor_profile TEXT,current_heter_iska TEXT,desired_timeline TEXT,response_method TEXT,status TEXT NOT NULL DEFAULT 'New',notes TEXT,attachment_key TEXT,attachment_name TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL)`,
    )
    .run();
}
