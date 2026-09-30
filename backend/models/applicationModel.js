const pool = require("../config/db");


// Create Application
const createApplication = async (application) => {

    const {
    name,
    description,
    url,
    type,
    monitoring_interval,
    owner_id
} = application;


    const result = await pool.query(
        `
        INSERT INTO applications
        (
            name,
            description,
            url,
            type,
            monitoring_interval,
            owner_id
        )

        VALUES($1,$2,$3,$4,$5,$6)

        RETURNING *
        `,
        [
            name,
            description,
            url,
            type,
            monitoring_interval,
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
        status
    } = application;


    const result = await pool.query(
        `
        UPDATE applications
        SET
            name=$1,
            description=$2,
            url=$3,
            type=$4,
            monitoring_interval=$5,
            status=$6

        WHERE application_id=$7

        RETURNING *
        `,
        [
            name,
            description,
            url,
            type,
            monitoring_interval,
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
