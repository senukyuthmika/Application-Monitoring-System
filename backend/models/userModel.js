const pool = require("../config/db");


// Create new user
const createUser = async (
    name,
    email,
    password,
    role
) => {

    const result = await pool.query(
        `
        INSERT INTO users
        (name, email, password, role)

        VALUES ($1, $2, $3, $4)

        RETURNING user_id, name, email, role, created_at
        `,
        [
            name,
            email,
            password,
            role
        ]
    );

    return result.rows[0];
};



// Find user using email (for login)
const findUserByEmail = async(email)=>{

    const result = await pool.query(
        `
        SELECT *
        FROM users
        WHERE email = $1
        `,
        [email]
    );

    return result.rows[0];

};



module.exports = {
    createUser,
    findUserByEmail
};