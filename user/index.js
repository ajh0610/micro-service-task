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

    const validationObject = signupSchema.safeParse(req.body);
    if(!validationObject.success){
        return res.status(400).json(validationObject?.error.errors);
    }
    const {first_name, last_name, email, password} = req.body;
    try{
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

    const validationObject = loginSchema.safeParse(req.body);
    if(!validationObject.success){
        return res.status(400).json(validationObject?.error.errors);
    }

    const {email, password} = req.body;

    try{

        const selectQuery = `SELECT * FROM users WHERE email = $1;`
        const values = [email];

        const result = await User.query(selectQuery, values);

        if(result.rows.length===0){
            return res.status(401).json({
                message: "User not found!"
            })
        }
        const user = result.rows[0];
        console.log(user);
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if(!isPasswordCorrect){
            return res.status(401).json({
                message: "Incorrect Password, Please try again!"
            })
        }

        const jwtToken = jwt.sign({
            id: user.id, 
            first_name: user.first_name, 
            last_name: user.last_name, 
            email: user.email}, 
            JWT_SECRET, 
            {expiresIn: '24h'}
        );

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