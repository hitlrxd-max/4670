CREATE TYPE "public"."inventory_transaction_type" AS ENUM('in', 'out');
CREATE TYPE "public"."employee_contract_status" AS ENUM('active', 'expired', 'cancelled');

CREATE TABLE "inventory_items" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar(255) NOT NULL,
  "code" varchar(100) NOT NULL,
  "category" varchar(150),
  "unit" varchar(50) NOT NULL,
  "quantity" numeric(12, 2) DEFAULT '0' NOT NULL,
  "minimum_quantity" numeric(12, 2) DEFAULT '0' NOT NULL,
  "unit_cost" numeric(12, 2),
  "branch_id" uuid NOT NULL,
  "created_by" uuid,
  "is_archived" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "inventory_items_branch_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id"),
  CONSTRAINT "inventory_items_quantity_check" CHECK ("quantity" >= 0),
  CONSTRAINT "inventory_items_minimum_quantity_check" CHECK ("minimum_quantity" >= 0),
  CONSTRAINT "inventory_items_unit_cost_check" CHECK ("unit_cost" IS NULL OR "unit_cost" >= 0)
);
CREATE UNIQUE INDEX "inventory_items_code_branch_idx" ON "inventory_items" USING btree ("code", "branch_id");
CREATE INDEX "inventory_items_branch_idx" ON "inventory_items" USING btree ("branch_id");

CREATE TABLE "inventory_transactions" (
  "id" serial PRIMARY KEY NOT NULL,
  "item_id" integer NOT NULL,
  "branch_id" integer NOT NULL,
  "type" "inventory_transaction_type" NOT NULL,
  "quantity" numeric(12, 2) NOT NULL,
  "transaction_date" date NOT NULL,
  "reference" varchar(255),
  "notes" text,
  "created_by" integer,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "inventory_transactions_item_fk" FOREIGN KEY ("item_id") REFERENCES "public"."inventory_items"("id"),
  CONSTRAINT "inventory_transactions_branch_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id"),
  CONSTRAINT "inventory_transactions_quantity_check" CHECK ("quantity" > 0)
);
CREATE INDEX "inventory_transactions_item_date_idx" ON "inventory_transactions" USING btree ("item_id", "transaction_date");
CREATE INDEX "inventory_transactions_branch_idx" ON "inventory_transactions" USING btree ("branch_id");

CREATE TABLE "employee_contracts" (
  "id" serial PRIMARY KEY NOT NULL,
  "employee_id" uuid NOT NULL,
  "branch_id" integer NOT NULL,
  "contract_number" varchar(100) NOT NULL,
  "contract_type" varchar(100) NOT NULL,
  "start_date" date NOT NULL,
  "end_date" date,
  "salary" numeric(12, 2),
  "notes" text,
  "status" "employee_contract_status" DEFAULT 'active' NOT NULL,
  "created_by" integer,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "employee_contracts_employee_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id"),
  CONSTRAINT "employee_contracts_branch_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id"),
  CONSTRAINT "employee_contracts_created_by_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id"),
  CONSTRAINT "employee_contracts_salary_check" CHECK ("salary" IS NULL OR "salary" >= 0),
  CONSTRAINT "employee_contracts_dates_check" CHECK ("end_date" IS NULL OR "end_date" >= "start_date")
);
CREATE UNIQUE INDEX "employee_contracts_number_branch_idx" ON "employee_contracts" USING btree ("contract_number", "branch_id");
CREATE INDEX "employee_contracts_branch_idx" ON "employee_contracts" USING btree ("branch_id");

