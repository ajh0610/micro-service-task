const {Client} = require('pg');

const Task = new Client({
    user: process.env.DATABASE_USER_NAME,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
})


Task.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

module.exports = Task;