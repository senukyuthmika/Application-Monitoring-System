const pool = require("../config/db");
const monitoringService = require("../services/monitoringService");


// Run monitoring check

const checkApplication = async (req,res)=>{

    try{

        const applicationId = req.params.id;


        // Get application details

        const result = await pool.query(
            `
            SELECT *
            FROM applications
            WHERE application_id=$1
            `,
            [applicationId]
        );


        if(result.rows.length === 0){

            return res.status(404).json({
                message:"Application not found"
            });

        }


        const application = result.rows[0];


        // Run health check

        const monitoringResult =
            await monitoringService.checkApplication(
                application
            );


        res.json({

            message:"Monitoring check completed",

            result: monitoringResult

        });


    }catch(error){

        console.log(error);

        res.status(500).json({
            message:"Monitoring failed"
        });

    }

};

const getDashboard = async (req, res) => {
    try {
        const summary = await pool.query(
            `
            WITH latest AS (
                SELECT DISTINCT ON (application_id)
                    application_id,
                    status,
                    response_time,
                    checked_at
                FROM monitoring_history
                ORDER BY application_id, checked_at DESC
            )
            SELECT
                COUNT(a.application_id)::int AS total_applications,
                COUNT(*) FILTER (WHERE latest.status = 'UP')::int AS up_applications,
                COUNT(*) FILTER (WHERE latest.status = 'DOWN')::int AS down_applications,
                COALESCE(ROUND(AVG(latest.response_time)::numeric, 2), 0)::float AS avg_response_time
            FROM applications a
            LEFT JOIN latest ON latest.application_id = a.application_id
            `
        );

        const alerts = await pool.query(
            `
            SELECT COUNT(*)::int AS active_alerts
            FROM alerts
            WHERE status = 'OPEN'
            `
        );

        const chart = await pool.query(
            `
            SELECT
                TO_CHAR(checked_at, 'HH24:MI') AS label,
                ROUND(AVG(response_time)::numeric, 2)::float AS response_time
            FROM monitoring_history
            WHERE checked_at >= NOW() - INTERVAL '1 day'
            GROUP BY label
            ORDER BY MIN(checked_at)
            LIMIT 24
            `
        );

        res.json({
            ...summary.rows[0],
            active_alerts: alerts.rows[0].active_alerts,
            response_time_chart: chart.rows
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
};

const getMonitoringHistory = async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT
                mh.history_id,
                mh.application_id,
                a.name AS application_name,
                mh.status,
                mh.response_time,
                mh.status_code,
                mh.checked_at
            FROM monitoring_history mh
            JOIN applications a ON a.application_id = mh.application_id
            ORDER BY mh.checked_at DESC
            LIMIT 100
            `
        );

        res.json(result.rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to fetch monitoring history" });
    }
};

const getAlerts = async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT
                al.alert_id,
                al.application_id,
                a.name AS application_name,
                al.alert_type,
                al.message,
                al.severity,
                al.status,
                al.created_at,
                al.resolved_at
            FROM alerts al
            JOIN applications a ON a.application_id = al.application_id
            ORDER BY al.created_at DESC
            LIMIT 100
            `
        );

        res.json(result.rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to fetch alerts" });
    }
};

const resolveAlert = async (req, res) => {
    try {
        const result = await pool.query(
            `
            UPDATE alerts
            SET status = 'RESOLVED',
                resolved_at = CURRENT_TIMESTAMP
            WHERE alert_id = $1
            RETURNING *
            `,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Alert not found" });
        }

        res.json({
            message: "Alert resolved successfully",
            alert: result.rows[0]
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to resolve alert" });
    }
};

const getLogs = async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT
                l.log_id,
                l.application_id,
                a.name AS application_name,
                l.log_level,
                l.message,
                l.created_at
            FROM application_logs l
            JOIN applications a ON a.application_id = l.application_id
            ORDER BY l.created_at DESC
            LIMIT 100
            `
        );

        res.json(result.rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to fetch logs" });
    }
};



module.exports = {
    checkApplication,
    getDashboard,
    getMonitoringHistory,
    getAlerts,
    resolveAlert,
    getLogs
};
