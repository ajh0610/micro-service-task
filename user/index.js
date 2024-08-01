const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require("cors");
require('dotenv').config();
const {loginSchema, signupSchema} = require("./zod/user-schema");

const app = express();
const User = require('./database/user-model');

const PORT = process.env.USER_AUTH_PORT;
const JWT_SECRET = process.env.JWT_SECRET;
app.use(cors());
app.use(express.json());


app.post('/signup', async (req, res) => {

    // Vaildating the input body using Zod schema if the input is not correct then return the response

    const validationObject = signupSchema.safeParse(req.body);
    if(!validationObject.success){
        return res.status(400).json(validationObject?.error.errors);
    }
    const {first_name, last_name, email, password} = req.body;

    try{
        // Hashing the password and inserting the value.
        const hashedPassword = await bcrypt.hash(password, 10);
        const insertQuery = `INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4)`;
        const values = [first_name, last_name, email, hashedPassword];
        const result = await User.query(insertQuery, values);
        res.status(201).json({
            message: "User created sucessfully!"
        });
    }catch(e){
        console.error(e);
        res.status(500).json({
            message: "Error in creating user, Please try again!",
            error: e
        })
    }
})

app.post('/login', async (req, res)=>{

    // Validating the input body for the login.

    const validationObject = loginSchema.safeParse(req.body);
    if(!validationObject.success){
        return res.status(400).json(validationObject?.error.errors);
    }

    const {email, password} = req.body;

    try{
        // Selecting all the rows where the email matches the input email
        const selectQuery = `SELECT * FROM users WHERE email = $1;`
        const values = [email];

        const result = await User.query(selectQuery, values);

        // If no such email is found then returing user not found

        if(result.rows.length===0){
            return res.status(401).json({
                message: "User not found!"
            })
        }
        const user = result.rows[0];
        
        // Comparing the password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        // If password does not match then returing the response.

        if(!isPasswordCorrect){
            return res.status(401).json({
                message: "Incorrect Password, Please try again!"
            })
        }

        // Signig a JWT token for the user details that expires in 24 hrs
        const jwtToken = jwt.sign({
            id: user.id, 
            first_name: user.first_name, 
            last_name: user.last_name, 
            email: user.email}, 
            JWT_SECRET, 
            {expiresIn: '24h'}
        );

        // Responding with the jwt token.

        res.status(200).json({
            message: "User Verified",
            token: jwtToken
        })
    } catch(e){
        console.log(e);
        res.status(500).json({
            message: "Error logging in!"
        })
    }
})


app.listen(PORT, () => {
  console.log(`User microservice listening on port ${PORT}`)
})