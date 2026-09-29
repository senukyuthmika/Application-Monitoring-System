const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {
    findUserByEmail
} = require("../models/userModel");



// Login Controller

const login = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // Find user by email

        const user = await findUserByEmail(email);


        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }


        // Compare entered password with database password

        const isPasswordValid =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!isPasswordValid) {

            return res.status(401).json({
                message: "Invalid password"
            });

        }



        // Create JWT token

        const token = jwt.sign(

            {
                user_id: user.user_id,
                role: user.role
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "1h"
            }

        );



        res.status(200).json({

            message: "Login successful",

            token,

            user: {

                id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role

            }

        });


    }
    catch(error) {


        console.log(error);

        res.status(500).json({

            message: "Server error"

        });

    }

};



module.exports = {
    login
};