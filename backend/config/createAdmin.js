const bcrypt = require("bcrypt");
const pool = require("./db");


const createAdmin = async()=>{

    const password =
    await bcrypt.hash(
        "admin123",
        10
    );


    await pool.query(
        `
        INSERT INTO users
        (name,email,password,role)

        VALUES($1,$2,$3,$4)
        `,
        [
            "System Admin",
            "admin@gmail.com",
            password,
            "ADMIN"
        ]
    );


    console.log("Admin created");

    process.exit();

};


createAdmin();