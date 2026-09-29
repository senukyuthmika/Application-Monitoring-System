const pool = require("./db");

pool.query("SELECT NOW()", (err, result) => {

    if (err) {
        console.log("Database connection failed");
        console.log(err);
    }
    else {
        console.log("Database connected");
        console.log(result.rows);
    }

});