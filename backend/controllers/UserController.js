const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
    try {
        const {name, email, password, role}= req.body;
        // check user exist or not
        const IsUserExist = await User.findOne({email});
        if(IsUserExist) return res.status(400).json({message:"User already exisit"})
        //Secure password 
        const hashedPassword= await bcrypt.hash(password, 10);
        //Create user
        const user = await User.create({name, email, password: hashedPassword, role});
        //sign token
        const token = jwt.sign({email, id: user._id}, process.env.JWT_SECRET, {expiresIn: "1h"}); 
        res.status(201).json({message:"User registered successfully", user, token});
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Could not register user"});
    }
};

const login = async (req, res) => {
    try {
        const {email, password}= req.body;
        //check user exist or not
        const user = await User.findOne({email});
        if(!user) return res.status(400).json({message:"User not found"});
        //check password
        const isPasswordMatched = await bcrypt.compare(password, user.password);
        if(!isPasswordMatched) return res.status(400).json({message:"Invalid credentials"});
        //sign token
        const token = jwt.sign( {email, id: user._id}, process.env.JWT_SECRET, {expiresIn: "1h"}); 
        res.status(200).json({message:"User logged in successfully", user, token});
        
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Could not login user"});
    }
};

const getMe = (req, res) => {
    try {
        const user = req.user;
        res.status(200).json({message:"User found successfully", user});
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Could not find user"});
    }
};

module.exports = {
    register,
    login,
    getMe
};
