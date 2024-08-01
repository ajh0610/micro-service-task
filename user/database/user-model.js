//This file is creating a connection with the postgres database

const {Client} = require('pg');

const User = new Client({
    user: process.env.DATABASE_USER_NAME,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
})


User.connect(function(err) {
    if (err) throw err;
    console.log("Connected to Postgres Server");
});

module.exports = User;