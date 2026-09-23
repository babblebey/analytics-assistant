-- agent/sandbox/workspace/schema.sql
-- Reference only: table shapes the analyst can read before writing queries.
CREATE TABLE orders     (id INTEGER, customer_id INTEGER, amount_cents INTEGER, created_at TEXT);
CREATE TABLE customers  (id INTEGER, name TEXT, plan TEXT);