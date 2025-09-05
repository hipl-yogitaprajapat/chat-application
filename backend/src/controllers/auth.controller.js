import bcrypt from "bcrypt";
import { generateToken } from "../lib/utils.js"
import User from "../models/user.model.js";

export const signup = async (req, res) => {
    // console.log("Received body:", req.body); 
    const { firstName, lastName, company, email, password } = req.body;
    try {
        if (!firstName || !lastName || !company || !email || !password ) {
            return res.status(400).json({ message: "All fields are required", success: false })
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 character", success: false })
        }

        const user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "Email is already exist", success: false })

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            firstName,
            lastName,
            company,
            email,
            password: hashPassword
        })

        if (newUser) {
            // generateToken(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                // _id: newUser._id,
                // firstName: newUser.firstName,
                // lastName: newUser.lastName,
                // company: newUser.company,
                // email: newUser.email,
                message: "Registration successfully",
                success: true
            })

        } else {
            res.status(400).json({ message: "Invalid user data", success: false })
        }

    } catch (error) {
        console.log("error in signup controller", error.message);
        res.status(500).json({ message: "Internal server error", success: false })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required", success: false })
        }
        const user = await User.findOne({ email });

        if (!user) {
            res.status(400).json({ message: "Invaild Credentials", success: false })
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            res.status(400).json({ message: "Invaild Credentials", success: false })
        }
        const jwtToken = generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            company: user.company,
            // email: user.email,
            message: "Login successfully",
            success: true,
            jwtToken,
            // name: user.firstName ,
        })

    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ message: "Internal server error", success: false })

    }
}

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user)
    } catch (error) {
        console.log("Error in CheckAuth contoller", error.message);
        res.status(500).json({ message: "Internal server error" })

    }
}