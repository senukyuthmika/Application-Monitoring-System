-- ==========================================
-- Application Monitoring System Database
-- ==========================================


-- 1. Users Table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- 2. Applications Table
CREATE TABLE applications (
    application_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    url VARCHAR(255) NOT NULL,
    type VARCHAR(50),
    monitoring_frequency INTEGER DEFAULT 60,
    status VARCHAR(20) DEFAULT 'UNKNOWN',
    owner_id INTEGER,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_application_owner
    FOREIGN KEY(owner_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE
);



-- 3. Monitoring Results Table
CREATE TABLE monitoring_results (

    monitoring_id SERIAL PRIMARY KEY,

    application_id INTEGER NOT NULL,

    status VARCHAR(20),

    response_code INTEGER,

    response_time FLOAT,

    error_message TEXT,

    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


    CONSTRAINT fk_monitoring_application
    FOREIGN KEY(application_id)
    REFERENCES applications(application_id)
    ON DELETE CASCADE
);



-- 4. Performance Metrics Table
CREATE TABLE performance_metrics (

    metric_id SERIAL PRIMARY KEY,

    application_id INTEGER NOT NULL,

    cpu_usage FLOAT,

    memory_usage FLOAT,

    response_time FLOAT,

    request_count INTEGER,

    error_rate FLOAT,

    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


    CONSTRAINT fk_metrics_application
    FOREIGN KEY(application_id)
    REFERENCES applications(application_id)
    ON DELETE CASCADE
);



-- 5. Application Logs Table
CREATE TABLE application_logs (

    log_id SERIAL PRIMARY KEY,

    application_id INTEGER NOT NULL,

    log_level VARCHAR(20),

    message TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


    CONSTRAINT fk_logs_application
    FOREIGN KEY(application_id)
    REFERENCES applications(application_id)
    ON DELETE CASCADE
);



-- 6. Alert Rules Table
CREATE TABLE alert_rules (

    rule_id SERIAL PRIMARY KEY,

    application_id INTEGER NOT NULL,

    rule_type VARCHAR(50),

    threshold_value FLOAT,

    severity VARCHAR(20),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


    CONSTRAINT fk_rule_application
    FOREIGN KEY(application_id)
    REFERENCES applications(application_id)
    ON DELETE CASCADE
);



-- 7. Alerts Table
CREATE TABLE alerts (

    alert_id SERIAL PRIMARY KEY,

    application_id INTEGER NOT NULL,

    rule_id INTEGER,

    alert_type VARCHAR(50),

    message TEXT,

    severity VARCHAR(20),

    status VARCHAR(20) DEFAULT 'OPEN',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    resolved_at TIMESTAMP,


    CONSTRAINT fk_alert_application
    FOREIGN KEY(application_id)
    REFERENCES applications(application_id)
    ON DELETE CASCADE,


    CONSTRAINT fk_alert_rule
    FOREIGN KEY(rule_id)
    REFERENCES alert_rules(rule_id)
);



-- 8. Notifications Table
CREATE TABLE notifications (

    notification_id SERIAL PRIMARY KEY,

    alert_id INTEGER NOT NULL,

    receiver INTEGER,

    notification_type VARCHAR(20),

    delivery_status VARCHAR(20),

    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


    CONSTRAINT fk_notification_alert
    FOREIGN KEY(alert_id)
    REFERENCES alerts(alert_id)
    ON DELETE CASCADE,


    CONSTRAINT fk_notification_receiver
    FOREIGN KEY(receiver)
    REFERENCES users(user_id)
);



-- ==========================================
-- Indexes for Faster Searching
-- ==========================================


CREATE INDEX idx_monitoring_application
ON monitoring_results(application_id);


CREATE INDEX idx_alert_application
ON alerts(application_id);


CREATE INDEX idx_logs_application
ON application_logs(application_id);