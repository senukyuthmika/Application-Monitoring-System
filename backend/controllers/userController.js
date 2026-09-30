const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");

const createUser = async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            role = "USER"
        } = req.body;

        if (!name || !email || !password) {

            return res.status(400).json({
                message: "Name, email and password are required"
            });

        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userModel.createUser(
            name,
            email,
            hashedPassword,
            role
        );

        res.status(201).json({
            message: "User created successfully",
            user
        });

    } catch (error) {

        console.log(error);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "Email already exists"
            });
        }

        res.status(500).json({
            message: "Failed to create user"
        });

    }

};

const getUsers = async (req, res) => {

    try {

        const users = await userModel.getUsers();

        res.json(users);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Failed to fetch users"
        });

    }

};

const deleteUser = async (req, res) => {

    try {

        if (Number(req.params.id) === req.user.user_id) {
            return res.status(400).json({
                message: "You cannot delete your own account"
            });
        }

        const user = await userModel.deleteUser(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            message: "User deleted successfully",
            user
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Failed to delete user"
        });

    }

};

module.exports = {
    createUser,
    getUsers,
    deleteUser
};
