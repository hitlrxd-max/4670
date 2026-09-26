import { boolean, date, index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const branches = pgTable('branches', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  code: text('code').notNull().unique(),
  address: text('address'),
  phone: text('phone'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const academicYears = pgTable('academic_years', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  startsOn: date('starts_on'),
  endsOn: date('ends_on'),
  isCurrent: boolean('is_current').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const students = pgTable('students', {
  id: uuid('id').defaultRandom().primaryKey(),
  fullName: text('full_name').notNull(),
  registrationNumber: text('registration_number').notNull().unique(),
  seatNumber: text('seat_number'),
  branchId: uuid('branch_id').references(() => branches.id),
  academicYearId: uuid('academic_year_id').references(() => academicYears.id),
  stage: text('stage'),
  grade: text('grade'),
  className: text('class_name'),
  dateOfBirth: date('date_of_birth'),
  gender: text('gender'),
  guardianName: text('guardian_name'),
  guardianPhone: text('guardian_phone'),
  address: text('address'),
  status: text('status').notNull().default('active'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({ nameSearch: index('students_full_name_idx').on(table.fullName) }))

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: uuid('entity_id'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const schema = { branches, academicYears, students, auditLogs }
