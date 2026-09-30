const cron = require("node-cron");

const pool = require("../config/db");

const monitoringService = require("../services/monitoringService");


// Run every 60 seconds

cron.schedule("*/60 * * * * *", async () => {

    console.log("Running monitoring check...");


    try {

        // Get all applications

        const result = await pool.query(
            `
            SELECT *
            FROM applications
            WHERE status = 'ACTIVE'
            `
        );


        const applications = result.rows;


        for(const application of applications){


            const monitoringResult =
                await monitoringService.checkApplication(
                    application
                );


            console.log(
                monitoringResult
            );


        }


    }
    catch(error){

        console.log(
            "Monitoring job error:",
            error.message
        );

    }


});
