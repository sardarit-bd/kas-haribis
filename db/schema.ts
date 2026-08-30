import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const questions = sqliteTable('questions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  reference: text('reference').notNull().unique(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  topic: text('topic').notNull(),
  question: text('question').notNull(),
  status: text('status').notNull().default('New'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});

export const donations = sqliteTable('donations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  donorName: text('donor_name').notNull(),
  email: text('email').notNull(),
  amountCents: integer('amount_cents').notNull(),
  dedication: text('dedication'),
  anonymous: integer('anonymous', { mode: 'boolean' }).notNull().default(false),
  status: text('status').notNull().default('Pending'),
  createdAt: text('created_at').notNull(),
});

export const sponsors = sqliteTable('sponsors', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  companyName: text('company_name').notNull(),
  adType: text('ad_type').notNull(),
  description: text('description'),
  phone: text('phone'),
  imageKey: text('image_key'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
});

export const banks = sqliteTable('banks', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  status: text('status').notNull(),
  summary: text('summary').notNull(),
  comment: text('comment').notNull().default(''),
  lastUpdated: text('last_updated').notNull().default(''),
  fullReport: text('full_report').notNull().default(''),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
});

export const bankResearchSubmissions = sqliteTable(
  'bank_research_submissions',
  {
    id: text('id').primaryKey(),
    reference: text('reference').notNull().unique(),
    researcherEmail: text('researcher_email').notNull(),
    researcherName: text('researcher_name').notNull().default(''),
    title: text('title').notNull(),
    institutionType: text('institution_type').notNull().default(''),
    statusRecommendation: text('status_recommendation')
      .notNull()
      .default('unknown'),
    website: text('website').notNull().default(''),
    summary: text('summary').notNull().default(''),
    publicComment: text('public_comment').notNull().default(''),
    lastUpdated: text('last_updated').notNull().default(''),
    fullReport: text('full_report').notNull().default(''),
    sourceUrls: text('source_urls').notNull().default(''),
    ownershipDetails: text('ownership_details').notNull().default(''),
    iskaDetails: text('iska_details').notNull().default(''),
    internalNotes: text('internal_notes').notNull().default(''),
    logoKey: text('logo_key').notNull().default(''),
    logoName: text('logo_name').notNull().default(''),
    reportKey: text('report_key').notNull().default(''),
    reportName: text('report_name').notNull().default(''),
    workflowStatus: text('workflow_status').notNull().default('Draft'),
    reviewNotes: text('review_notes').notNull().default(''),
    reviewerEmail: text('reviewer_email').notNull().default(''),
    reviewerName: text('reviewer_name').notNull().default(''),
    reviewedAt: text('reviewed_at').notNull().default(''),
    publishedBankId: text('published_bank_id').notNull().default(''),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    submittedAt: text('submitted_at').notNull().default(''),
    approvedAt: text('approved_at').notNull().default(''),
  },
);

export const bankResearchers = sqliteTable('bank_researchers', {
  email: text('email').primaryKey(),
  name: text('name').notNull().default(''),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
});

export const adminStaffAccess = sqliteTable('admin_staff_access', {
  email: text('email').primaryKey(),
  name: text('name').notNull().default(''),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  permissions: text('permissions').notNull().default('[]'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const bankResearcherCredentials = sqliteTable(
  'bank_researcher_credentials',
  {
    email: text('email').primaryKey(),
    codeSalt: text('code_salt').notNull(),
    codeHash: text('code_hash').notNull(),
    accessType: text('access_type').notNull().default('permanent'),
    expiresAt: text('expires_at').notNull().default(''),
    updatedAt: text('updated_at').notNull(),
  },
);

export const bankResearchReviewers = sqliteTable('bank_research_reviewers', {
  email: text('email').primaryKey(),
  name: text('name').notNull().default(''),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
});

export const bankReportCodes = sqliteTable('bank_report_codes', {
  id: text('id').primaryKey(),
  bankId: text('bank_id').notNull(),
  codeHash: text('code_hash').notNull().unique(),
  codeHint: text('code_hint').notNull(),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
});

export const bankReportAccess = sqliteTable('bank_report_access', {
  token: text('token').primaryKey(),
  bankId: text('bank_id').notNull(),
  paymentId: text('payment_id'),
  method: text('method').notNull(),
  createdAt: text('created_at').notNull(),
});

export const heterAccessCodes = sqliteTable('heter_access_codes', {
  id: text('id').primaryKey(),
  documentId: text('document_id').notNull(),
  codeHash: text('code_hash').notNull().unique(),
  codeHint: text('code_hint').notNull(),
  label: text('label').notNull().default(''),
  codeType: text('code_type').notNull(),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  useCount: integer('use_count').notNull().default(0),
  createdAt: text('created_at').notNull(),
  lastUsedAt: text('last_used_at'),
});

export const heterCodeDownloads = sqliteTable('heter_code_downloads', {
  token: text('token').primaryKey(),
  documentId: text('document_id').notNull(),
  codeId: text('code_id').notNull(),
  createdAt: text('created_at').notNull(),
});

export const businesses = sqliteTable('businesses', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull().default(''),
  description: text('description').notNull().default(''),
  address: text('address').notNull().default(''),
  city: text('city').notNull().default(''),
  state: text('state').notNull().default(''),
  zip: text('zip').notNull().default(''),
  phone: text('phone').notNull().default(''),
  email: text('email').notNull().default(''),
  website: text('website').notNull().default(''),
  logoUrl: text('logo_url').notNull().default(''),
  iskaAuthority: text('iska_authority').notNull().default(''),
  iskaDetails: text('iska_details').notNull().default(''),
  verificationStatus: text('verification_status').notNull().default('Verified'),
  lastVerified: text('last_verified').notNull().default(''),
  publicNotes: text('public_notes').notNull().default(''),
  internalNotes: text('internal_notes').notNull().default(''),
  sourceUrl: text('source_url').notNull().default(''),
  published: integer('published', { mode: 'boolean' }).notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const loanServices = sqliteTable('loan_services', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  contactName: text('contact_name').notNull().default(''),
  serviceType: text('service_type').notNull().default(''),
  description: text('description').notNull().default(''),
  specialties: text('specialties').notNull().default(''),
  address: text('address').notNull().default(''),
  city: text('city').notNull().default(''),
  state: text('state').notNull().default(''),
  zip: text('zip').notNull().default(''),
  serviceArea: text('service_area').notNull().default(''),
  phone: text('phone').notNull().default(''),
  email: text('email').notNull().default(''),
  website: text('website').notNull().default(''),
  logoUrl: text('logo_url').notNull().default(''),
  rabbinicalOversight: text('rabbinical_oversight').notNull().default(''),
  kosherDetails: text('kosher_details').notNull().default(''),
  verificationStatus: text('verification_status').notNull().default('Verified'),
  lastVerified: text('last_verified').notNull().default(''),
  publicNotes: text('public_notes').notNull().default(''),
  internalNotes: text('internal_notes').notNull().default(''),
  published: integer('published', { mode: 'boolean' }).notNull().default(true),
  featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const articles = sqliteTable('articles', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  hebrewTitle: text('hebrew_title').notNull().default(''),
  publicationDate: text('publication_date').notNull().default(''),
  author: text('author').notNull().default('Kav Haribis'),
  summary: text('summary').notNull().default(''),
  pdfUrl: text('pdf_url').notNull().default(''),
  coverUrl: text('cover_url').notNull().default(''),
  pageCount: integer('page_count').notNull().default(2),
  published: integer('published', { mode: 'boolean' }).notNull().default(true),
  featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const educationalResources = sqliteTable('educational_resources', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  resourceType: text('resource_type').notNull().default('Coloring Page'),
  audience: text('audience').notNull().default(''),
  fileKey: text('file_key').notNull().default(''),
  fileName: text('file_name').notNull().default(''),
  fileType: text('file_type').notNull().default(''),
  published: integer('published', { mode: 'boolean' }).notNull().default(true),
  featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const savingsAccounts = sqliteTable('savings_accounts', {
  id: text('id').primaryKey(),
  institutionName: text('institution_name').notNull(),
  accountName: text('account_name').notNull().default(''),
  description: text('description').notNull().default(''),
  apy: text('apy').notNull().default(''),
  minimumDeposit: text('minimum_deposit').notNull().default(''),
  monthlyFee: text('monthly_fee').notNull().default(''),
  fdicStatus: text('fdic_status').notNull().default(''),
  kosherStatus: text('kosher_status').notNull().default('Reviewed'),
  kosherDetails: text('kosher_details').notNull().default(''),
  lastReviewed: text('last_reviewed').notNull().default(''),
  openAccountUrl: text('open_account_url').notNull().default(''),
  website: text('website').notNull().default(''),
  logoUrl: text('logo_url').notNull().default(''),
  publicNotes: text('public_notes').notNull().default(''),
  internalNotes: text('internal_notes').notNull().default(''),
  published: integer('published', { mode: 'boolean' }).notNull().default(true),
  featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const investmentOpportunities = sqliteTable('investment_opportunities', {
  id: text('id').primaryKey(),
  opportunityName: text('opportunity_name').notNull(),
  sponsorName: text('sponsor_name').notNull().default(''),
  investmentType: text('investment_type').notNull().default(''),
  description: text('description').notNull().default(''),
  minimumInvestment: text('minimum_investment').notNull().default(''),
  returnInformation: text('return_information').notNull().default(''),
  investmentTerm: text('investment_term').notNull().default(''),
  location: text('location').notNull().default(''),
  availabilityStatus: text('availability_status').notNull().default('Open'),
  kosherStatus: text('kosher_status').notNull().default('Reviewed'),
  rabbinicalOversight: text('rabbinical_oversight').notNull().default(''),
  kosherDetails: text('kosher_details').notNull().default(''),
  lastReviewed: text('last_reviewed').notNull().default(''),
  riskDisclosure: text('risk_disclosure').notNull().default(''),
  contactName: text('contact_name').notNull().default(''),
  phone: text('phone').notNull().default(''),
  email: text('email').notNull().default(''),
  opportunityUrl: text('opportunity_url').notNull().default(''),
  logoUrl: text('logo_url').notNull().default(''),
  publicNotes: text('public_notes').notNull().default(''),
  internalNotes: text('internal_notes').notNull().default(''),
  published: integer('published', { mode: 'boolean' }).notNull().default(true),
  featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const ribbisAlerts = sqliteTable('ribbis_alerts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  alertDate: text('alert_date').notNull().default(''),
  category: text('category').notNull().default('General Alert'),
  severity: text('severity').notNull().default('Important'),
  alertStatus: text('alert_status').notNull().default('Active'),
  reviewedBy: text('reviewed_by').notNull().default('Kav Haribis'),
  expiresAt: text('expires_at').notNull().default(''),
  summary: text('summary').notNull().default(''),
  fullDetails: text('full_details').notNull().default(''),
  actionLabel: text('action_label').notNull().default(''),
  actionUrl: text('action_url').notNull().default(''),
  published: integer('published', { mode: 'boolean' }).notNull().default(true),
  featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const alertTips = sqliteTable('alert_tips', {
  id: text('id').primaryKey(),
  reference: text('reference').notNull().unique(),
  name: text('name').notNull().default(''),
  email: text('email').notNull().default(''),
  phone: text('phone').notNull().default(''),
  topic: text('topic').notNull().default(''),
  organization: text('organization').notNull().default(''),
  tip: text('tip').notNull(),
  sourceUrl: text('source_url').notNull().default(''),
  status: text('status').notNull().default('New'),
  notes: text('notes').notNull().default(''),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const alertSubscribers = sqliteTable('alert_subscribers', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull().default(''),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
});

export const members = sqliteTable('members', {
  email: text('email').primaryKey(),
  name: text('name').notNull().default(''),
  phone: text('phone').notNull().default(''),
  newsletter: integer('newsletter', { mode: 'boolean' })
    .notNull()
    .default(true),
  ribbisAlerts: integer('ribbis_alerts', { mode: 'boolean' })
    .notNull()
    .default(true),
  discounts: integer('discounts', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const memberOrders = sqliteTable('member_orders', {
  id: text('id').primaryKey(),
  memberEmail: text('member_email').notNull(),
  orderReference: text('order_reference').notNull().default(''),
  itemSummary: text('item_summary').notNull().default(''),
  totalCents: integer('total_cents').notNull().default(0),
  status: text('status').notNull().default('Pending'),
  createdAt: text('created_at').notNull(),
});
