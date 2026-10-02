CREATE TABLE IF NOT EXISTS inventory_items (
  id SERIAL PRIMARY KEY,
  branch_id INTEGER NOT NULL REFERENCES branches(id),
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100),
  category VARCHAR(150),
  unit VARCHAR(50) NOT NULL DEFAULT 'قطعة',
  quantity NUMERIC(12,2) NOT NULL DEFAULT 0,
  min_quantity NUMERIC(12,2) NOT NULL DEFAULT 0,
  unit_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id SERIAL PRIMARY KEY,
  item_id INTEGER NOT NULL REFERENCES inventory_items(id),
  branch_id INTEGER NOT NULL REFERENCES branches(id),
  transaction_type VARCHAR(20) NOT NULL,
  quantity NUMERIC(12,2) NOT NULL,
  unit_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  transaction_date DATE NOT NULL,
  reference VARCHAR(150),
  notes TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS employee_contracts (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id),
  contract_number VARCHAR(100) NOT NULL,
  contract_type VARCHAR(100),
  start_date DATE NOT NULL,
  end_date DATE,
  salary NUMERIC(12,2),
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS inventory_items_branch_idx ON inventory_items(branch_id);
CREATE INDEX IF NOT EXISTS inventory_transactions_item_idx ON inventory_transactions(item_id);
CREATE INDEX IF NOT EXISTS employee_contracts_employee_idx ON employee_contracts(employee_id);
