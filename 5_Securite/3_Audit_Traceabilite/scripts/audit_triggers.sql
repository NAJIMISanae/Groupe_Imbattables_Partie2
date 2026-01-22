-- 3.2 Audit & Traçabilité - DigitalBank
-- Table audit_logs + triggers + fonction de consultation

-- 1) Table d'audit
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id SERIAL PRIMARY KEY,
    user_name TEXT,
    action VARCHAR(100),
    table_name VARCHAR(50),
    record_id INT,
    timestamp TIMESTAMP DEFAULT NOW(),
    ip_address VARCHAR(45)
);

-- 2) Fonction générique pour logger (UPDATE/DELETE)
CREATE OR REPLACE FUNCTION log_accounts_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs(user_name, action, table_name, record_id, ip_address)
    VALUES (
        current_user,
        TG_OP || '_ACCOUNT',
        TG_TABLE_NAME,
        COALESCE(NEW.account_id, OLD.account_id),
        inet_client_addr()::text
    );

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 3) Triggers sur accounts : UPDATE et DELETE
DROP TRIGGER IF EXISTS trg_accounts_update ON accounts;
CREATE TRIGGER trg_accounts_update
AFTER UPDATE ON accounts
FOR EACH ROW
EXECUTE FUNCTION log_accounts_changes();

DROP TRIGGER IF EXISTS trg_accounts_delete ON accounts;
CREATE TRIGGER trg_accounts_delete
AFTER DELETE ON accounts
FOR EACH ROW
EXECUTE FUNCTION log_accounts_changes();

-- 4) Traçabilité des consultations sensibles customers via une fonction "proxy"
CREATE OR REPLACE FUNCTION view_customer_sensitive(p_customer_id INT)
RETURNS TABLE (
    customer_id INT,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    address TEXT
) AS $$
BEGIN
    INSERT INTO audit_logs(user_name, action, table_name, record_id, ip_address)
    VALUES (
        current_user,
        'VIEW_CUSTOMER',
        'customers',
        p_customer_id,
        inet_client_addr()::text
    );

    RETURN QUERY
    SELECT
      c.customer_id,
      c.email::text,
      c.first_name::text,
      c.last_name::text,
      c.phone::text,
      c.address::text
    FROM customers c
    WHERE c.customer_id = p_customer_id;
END;
$$ LANGUAGE plpgsql;

-- 5) Option recommandé : empêcher le SELECT direct sur customers
-- (tu peux commenter si ton prof ne veut pas bloquer)
REVOKE SELECT ON customers FROM PUBLIC;
GRANT EXECUTE ON FUNCTION view_customer_sensitive(INT) TO PUBLIC;
