import {
  pgTable,
  pgEnum,
  serial,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  numeric,
  date,
  time,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// ============================================================
// ENUMS
// ============================================================
export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "finance",
  "student_affairs",
  "hr",
  "archive",
])

export const attendanceStatusEnum = pgEnum("attendance_status", [
  "present",
  "absent",
  "late",
  "excused",
])

export const employeeAttendanceStatusEnum = pgEnum("employee_attendance_status", [
  "present",
  "absent",
  "late",
  "left_early",
])

export const paymentMethodEnum = pgEnum("payment_method", [
  "cash",
  "bank_transfer",
  "card",
  "check",
  "other",
])

export const documentDirectionEnum = pgEnum("document_direction", ["incoming", "outgoing"])

// ============================================================
// PHASE 1: BRANCHES, USERS, ACADEMIC YEARS, AUDIT LOG
// ============================================================

export const branches = pgTable("branches", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  status: varchar("status", { length: 20 }).notNull().default("active"), // active | inactive
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const academicYears = pgTable("academic_years", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 20 }).notNull().unique(), // e.g. 2025/2026
  startDate: date("start_date"),
  endDate: date("end_date"),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    role: userRoleEnum("role").notNull(),
    branchId: integer("branch_id").references(() => branches.id),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email),
  })
)

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 100 }).notNull(),
  entityId: integer("entity_id"),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// ============================================================
// PHASE 2 (prepared now so FKs exist): STUDENTS
// ============================================================

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  enrollmentNumber: varchar("enrollment_number", { length: 50 }).notNull().unique(),
  seatNumber: varchar("seat_number", { length: 50 }),
  branchId: integer("branch_id")
    .references(() => branches.id)
    .notNull(),
  academicYearId: integer("academic_year_id")
    .references(() => academicYears.id)
    .notNull(),
  stage: varchar("stage", { length: 100 }), // المرحلة
  grade: varchar("grade", { length: 100 }), // الصف
  classroom: varchar("classroom", { length: 100 }), // الفصل
  birthDate: date("birth_date"),
  gender: varchar("gender", { length: 10 }), // male | female
  guardianName: varchar("guardian_name", { length: 255 }),
  guardianPhone: varchar("guardian_phone", { length: 50 }),
  address: text("address"),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  notes: text("notes"),
  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// ============================================================
// PHASE 3: FINANCIAL SYSTEM
// ============================================================

export const studentFees = pgTable("student_fees", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .references(() => students.id)
    .notNull(),
  academicYearId: integer("academic_year_id")
    .references(() => academicYears.id)
    .notNull(),
  branchId: integer("branch_id")
    .references(() => branches.id)
    .notNull(),
  totalFees: numeric("total_fees", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const discounts = pgTable("discounts", {
  id: serial("id").primaryKey(),
  studentFeeId: integer("student_fee_id")
    .references(() => studentFees.id)
    .notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  reason: text("reason"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  operationNumber: varchar("operation_number", { length: 50 }).notNull().unique(),
  studentId: integer("student_id")
    .references(() => students.id)
    .notNull(),
  academicYearId: integer("academic_year_id")
    .references(() => academicYears.id)
    .notNull(),
  branchId: integer("branch_id")
    .references(() => branches.id)
    .notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  paymentDate: date("payment_date").notNull(),
  notes: text("notes"),
  employeeId: integer("employee_id").references(() => users.id),
  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
  paymentId: integer("payment_id")
    .references(() => payments.id)
    .notNull(),
  studentId: integer("student_id")
    .references(() => students.id)
    .notNull(),
  branchId: integer("branch_id")
    .references(() => branches.id)
    .notNull(),
  academicYearId: integer("academic_year_id")
    .references(() => academicYears.id)
    .notNull(),
  totalFees: numeric("total_fees", { precision: 12, scale: 2 }).notNull(),
  discountAmount: numeric("discount_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  paidAmount: numeric("paid_amount", { precision: 12, scale: 2 }).notNull(),
  remainingAmount: numeric("remaining_amount", { precision: 12, scale: 2 }).notNull(),
  employeeId: integer("employee_id").references(() => users.id),
  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// ============================================================
// PHASE 4: EXPENSES
// ============================================================

export const expenseCategories = pgTable("expense_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
})

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  branchId: integer("branch_id")
    .references(() => branches.id)
    .notNull(),
  categoryId: integer("category_id").references(() => expenseCategories.id),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  expenseDate: date("expense_date").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  employeeId: integer("employee_id").references(() => users.id),
  notes: text("notes"),
  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// ============================================================
// PHASE 5: ATTENDANCE
// ============================================================

export const studentAttendance = pgTable(
  "student_attendance",
  {
    id: serial("id").primaryKey(),
    studentId: integer("student_id")
      .references(() => students.id)
      .notNull(),
    branchId: integer("branch_id")
      .references(() => branches.id)
      .notNull(),
    academicYearId: integer("academic_year_id")
      .references(() => academicYears.id)
      .notNull(),
    date: date("date").notNull(),
    status: attendanceStatusEnum("status").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueDaily: uniqueIndex("student_attendance_unique_daily").on(table.studentId, table.date),
  })
)

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  employeeCode: varchar("employee_code", { length: 50 }).notNull().unique(),
  position: varchar("position", { length: 150 }),
  department: varchar("department", { length: 150 }),
  branchId: integer("branch_id")
    .references(() => branches.id)
    .notNull(),
  phone: varchar("phone", { length: 50 }),
  hireDate: date("hire_date"),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  qualifications: text("qualifications"),
  notes: text("notes"),
  userId: integer("user_id").references(() => users.id),
  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const employeeAttendance = pgTable(
  "employee_attendance",
  {
    id: serial("id").primaryKey(),
    employeeId: integer("employee_id")
      .references(() => employees.id)
      .notNull(),
    branchId: integer("branch_id")
      .references(() => branches.id)
      .notNull(),
    date: date("date").notNull(),
    status: employeeAttendanceStatusEnum("status").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueDaily: uniqueIndex("employee_attendance_unique_daily").on(table.employeeId, table.date),
  })
)

// ============================================================
// PHASE 6: TEACHERS / SUBJECTS / CLASSES / SCHEDULES
// ============================================================

export const teachers = pgTable("teachers", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id")
    .references(() => employees.id)
    .notNull(),
})

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  stage: varchar("stage", { length: 100 }),
  grade: varchar("grade", { length: 100 }),
})

export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  grade: varchar("grade", { length: 100 }),
  branchId: integer("branch_id")
    .references(() => branches.id)
    .notNull(),
  academicYearId: integer("academic_year_id")
    .references(() => academicYears.id)
    .notNull(),
})

export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id")
    .references(() => teachers.id)
    .notNull(),
  subjectId: integer("subject_id")
    .references(() => subjects.id)
    .notNull(),
  classId: integer("class_id")
    .references(() => classes.id)
    .notNull(),
  dayOfWeek: varchar("day_of_week", { length: 20 }).notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
})

// ============================================================
// PHASE 7: DOCUMENTS & ARCHIVE
// ============================================================

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  fileUrl: text("file_url").notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileType: varchar("file_type", { length: 100 }),
  fileSize: integer("file_size"),
  entityType: varchar("entity_type", { length: 100 }),
  entityId: integer("entity_id"),
  uploadedBy: integer("uploaded_by").references(() => users.id),
  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const archiveDocuments = pgTable("archive_documents", {
  id: serial("id").primaryKey(),
  direction: documentDirectionEnum("direction").notNull(), // incoming | outgoing
  docNumber: varchar("doc_number", { length: 100 }).notNull(),
  docDate: date("doc_date").notNull(),
  entity: varchar("entity", { length: 255 }).notNull(), // الجهة
  subject: varchar("subject", { length: 255 }).notNull(),
  description: text("description"),
  branchId: integer("branch_id")
    .references(() => branches.id)
    .notNull(),
  createdBy: integer("created_by").references(() => users.id),
  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const decisions = pgTable("decisions", {
  id: serial("id").primaryKey(),
  decisionNumber: varchar("decision_number", { length: 100 }).notNull(),
  decisionDate: date("decision_date").notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  details: text("details"),
  branchId: integer("branch_id")
    .references(() => branches.id)
    .notNull(),
  createdBy: integer("created_by").references(() => users.id),
  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const correspondence = pgTable("correspondence", {
  id: serial("id").primaryKey(),
  refNumber: varchar("ref_number", { length: 100 }).notNull(),
  refDate: date("ref_date").notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  details: text("details"),
  branchId: integer("branch_id")
    .references(() => branches.id)
    .notNull(),
  createdBy: integer("created_by").references(() => users.id),
  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// ============================================================
// PHASE 8: INVENTORY & EMPLOYEE CONTRACTS
// ============================================================

export const inventoryItems = pgTable(
  "inventory_items",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    code: varchar("code", { length: 100 }).notNull(),
    category: varchar("category", { length: 150 }),
    unit: varchar("unit", { length: 50 }).notNull(),
    quantity: numeric("quantity", { precision: 12, scale: 2 }).notNull().default("0"),
    minimumQuantity: numeric("minimum_quantity", { precision: 12, scale: 2 }).notNull().default("0"),
    unitCost: numeric("unit_cost", { precision: 12, scale: 2 }),
    branchId: integer("branch_id").references(() => branches.id).notNull(),
    createdBy: integer("created_by").references(() => users.id),
    isArchived: boolean("is_archived").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    codeBranchIdx: uniqueIndex("inventory_items_code_branch_idx").on(table.code, table.branchId),
    branchIdx: index("inventory_items_branch_idx").on(table.branchId),
  })
)

export const inventoryTransactionTypeEnum = pgEnum("inventory_transaction_type", ["in", "out"])

export const inventoryTransactions = pgTable(
  "inventory_transactions",
  {
    id: serial("id").primaryKey(),
    itemId: integer("item_id").references(() => inventoryItems.id).notNull(),
    branchId: integer("branch_id").references(() => branches.id).notNull(),
    type: inventoryTransactionTypeEnum("type").notNull(),
    quantity: numeric("quantity", { precision: 12, scale: 2 }).notNull(),
    transactionDate: date("transaction_date").notNull(),
    reference: varchar("reference", { length: 255 }),
    notes: text("notes"),
    createdBy: integer("created_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    itemDateIdx: index("inventory_transactions_item_date_idx").on(table.itemId, table.transactionDate),
    branchIdx: index("inventory_transactions_branch_idx").on(table.branchId),
  })
)

export const employeeContractStatusEnum = pgEnum("employee_contract_status", ["active", "expired", "cancelled"])

export const employeeContracts = pgTable(
  "employee_contracts",
  {
    id: serial("id").primaryKey(),
    employeeId: integer("employee_id").references(() => employees.id).notNull(),
    branchId: integer("branch_id").references(() => branches.id).notNull(),
    contractNumber: varchar("contract_number", { length: 100 }).notNull(),
    contractType: varchar("contract_type", { length: 100 }).notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    salary: numeric("salary", { precision: 12, scale: 2 }),
    notes: text("notes"),
    status: employeeContractStatusEnum("status").notNull().default("active"),
    createdBy: integer("created_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    contractNumberIdx: uniqueIndex("employee_contracts_number_branch_idx").on(table.contractNumber, table.branchId),
    branchIdx: index("employee_contracts_branch_idx").on(table.branchId),
  })
)

// ============================================================
// RELATIONS
// ============================================================

export const branchesRelations = relations(branches, ({ many }) => ({
  users: many(users),
  students: many(students),
  employees: many(employees),
}))

export const usersRelations = relations(users, ({ one }) => ({
  branch: one(branches, { fields: [users.branchId], references: [branches.id] }),
}))

export const studentsRelations = relations(students, ({ one, many }) => ({
  branch: one(branches, { fields: [students.branchId], references: [branches.id] }),
  academicYear: one(academicYears, {
    fields: [students.academicYearId],
    references: [academicYears.id],
  }),
  fees: many(studentFees),
  payments: many(payments),
}))

export const paymentsRelations = relations(payments, ({ one }) => ({
  student: one(students, { fields: [payments.studentId], references: [students.id] }),
  branch: one(branches, { fields: [payments.branchId], references: [branches.id] }),
}))

export const invoicesRelations = relations(invoices, ({ one }) => ({
  payment: one(payments, { fields: [invoices.paymentId], references: [payments.id] }),
  student: one(students, { fields: [invoices.studentId], references: [students.id] }),
}))
