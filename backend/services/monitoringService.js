const axios = require("axios");
const pool = require("../config/db");

const createAlert = async (client, application, message, severity = "HIGH") => {
    const existingAlert = await client.query(
        `
        SELECT alert_id
        FROM alerts
        WHERE application_id = $1
        AND status = 'OPEN'
        AND alert_type = 'AVAILABILITY'
        ORDER BY created_at DESC
        LIMIT 1
        `,
        [application.application_id]
    );

    if (existingAlert.rows.length > 0) {
        return existingAlert.rows[0];
    }

    const alert = await client.query(
        `
        INSERT INTO alerts (
            application_id,
            alert_type,
            message,
            severity,
            status
        )
        VALUES ($1, 'AVAILABILITY', $2, $3, 'OPEN')
        RETURNING *
        `,
        [application.application_id, message, severity]
    );

    await client.query(
        `
        INSERT INTO application_logs (
            application_id,
            log_level,
            message
        )
        VALUES ($1, 'ERROR', $2)
        `,
        [application.application_id, message]
    );

    return alert.rows[0];
};

const resolveOpenAlerts = async (client, application) => {
    await client.query(
        `
        UPDATE alerts
        SET status = 'RESOLVED',
            resolved_at = CURRENT_TIMESTAMP
        WHERE application_id = $1
        AND status = 'OPEN'
        AND alert_type = 'AVAILABILITY'
        `,
        [application.application_id]
    );
};

// Check application health

const checkApplication = async (application) => {

    const startTime = Date.now();

    let status = "DOWN";
    let responseTime = null;
    let statusCode = null;


    let errorMessage = null;

    try {

        const response = await axios.get(
            application.url,
            {
                timeout: 5000
            }
        );


        responseTime = Date.now() - startTime;

        statusCode = response.status;

        status = response.status >= 200 && response.status < 400 ? "UP" : "DOWN";


    } catch(error) {


        responseTime = Date.now() - startTime;


        if(error.response){

            statusCode = error.response.status;

        }

        errorMessage = error.message;

    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await client.query(
            `
            INSERT INTO monitoring_history (
                application_id,
                status,
                response_time,
                status_code
            )
            VALUES($1,$2,$3,$4)
            `,
            [
                application.application_id,
                status,
                responseTime,
                statusCode
            ]
        );

        await client.query(
            `
            UPDATE applications
            SET status = $1
            WHERE application_id = $2
            `,
            [
                status,
                application.application_id
            ]
        );

        await client.query(
            `
            INSERT INTO monitoring_results (
                application_id,
                status,
                response_code,
                response_time,
                error_message
            )
            VALUES($1,$2,$3,$4,$5)
            `,
            [
                application.application_id,
                status,
                statusCode,
                responseTime,
                errorMessage
            ]
        );

        await client.query(
            `
            INSERT INTO performance_metrics (
                application_id,
                response_time,
                error_rate
            )
            VALUES($1,$2,$3)
            `,
            [
                application.application_id,
                responseTime,
                status === "UP" ? 0 : 100
            ]
        );

        await client.query(
            `
            INSERT INTO application_logs (
                application_id,
                log_level,
                message
            )
            VALUES ($1, $2, $3)
            `,
            [
                application.application_id,
                status === "UP" ? "INFO" : "ERROR",
                status === "UP"
                    ? `${application.name} responded with status ${statusCode}`
                    : `${application.name} is DOWN: ${errorMessage || "Health check failed"}`
            ]
        );

        if (status === "DOWN") {
            await createAlert(
                client,
                application,
                `${application.name} is unavailable. ${errorMessage || "No successful response received."}`
            );
        } else {
            await resolveOpenAlerts(client, application);
        }

        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }


    return {
        application: application.name,
        applicationId: application.application_id,
        status,
        responseTime,
        statusCode,
        errorMessage
    };

};



module.exports = {
    checkApplication
};
