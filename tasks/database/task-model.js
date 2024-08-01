const {Pool} = require('pg');

const Task = new Pool({
    user: process.env.DATABASE_USER_NAME,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
})


Task.connect(function(err) {
    if (err) console.log(err);
    console.log("Connected!");
});

module.exports = Task;