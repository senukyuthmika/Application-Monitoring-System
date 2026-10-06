const pool = require("../config/db");

const getMonitoringIntervalColumn = async () => {

    const result = await pool.query(
        `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'applications'
        AND column_name IN ('monitoring_interval', 'monitoring_frequency')
        ORDER BY CASE
            WHEN column_name = 'monitoring_interval' THEN 1
            ELSE 2
        END
        LIMIT 1
        `
    );

    return result.rows[0]?.column_name || "monitoring_interval";

};

// Create Application
const createApplication = async (application) => {

    const {
    name,
    description,
    url,
    type,
    monitoring_interval,
    monitoring_frequency,
    status,
    owner_id
} = application;

    const intervalColumn = await getMonitoringIntervalColumn();
    const intervalValue = monitoring_interval || monitoring_frequency || 60;


    const result = await pool.query(
        `
        INSERT INTO applications
        (
            name,
            description,
            url,
            type,
            ${intervalColumn},
            status,
            owner_id
        )

        VALUES($1,$2,$3,$4,$5,$6,$7)

        RETURNING *
        `,
        [
            name,
            description,
            url,
            type,
            intervalValue,
            status || "ACTIVE",
            owner_id
        ]
    );


    return result.rows[0];

};


// Get all applications
const getApplications = async () => {

    const result = await pool.query(
        `
        SELECT *
        FROM applications
        ORDER BY application_id
        `
    );

    return result.rows;

};



// Get application by ID
const getApplicationById = async (id) => {

    const result = await pool.query(
        `
        SELECT *
        FROM applications
        WHERE application_id = $1
        `,
        [id]
    );

    return result.rows[0];

};



// Update Application
const updateApplication = async (id, application) => {

    const {
        name,
        description,
        url,
        type,
        monitoring_interval,
        monitoring_frequency,
        status
    } = application;

    const intervalColumn = await getMonitoringIntervalColumn();
    const intervalValue = monitoring_interval || monitoring_frequency || 60;


    const result = await pool.query(
        `
        UPDATE applications
        SET
            name=$1,
            description=$2,
            url=$3,
            type=$4,
            ${intervalColumn}=$5,
            status=$6

        WHERE application_id=$7

        RETURNING *
        `,
        [
            name,
            description,
            url,
            type,
            intervalValue,
            status,
            id
        ]
    );


    return result.rows[0];

};



// Delete Application
const deleteApplication = async (id) => {

    const result = await pool.query(
        `
        DELETE FROM applications
        WHERE application_id=$1
        RETURNING *
        `,
        [id]
    );


    return result.rows[0];

};



module.exports = {

    createApplication,
    getApplications,
    getApplicationById,
    updateApplication,
    deleteApplication

};
