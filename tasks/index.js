const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const app = express();
require('dotenv').config();
const Task = require('./database/task-model');
const {tasksSchema, taskStatusSchema} = require('./zod/task-schema');
const {Queue} = require('bullmq');

const mailingQueue = new Queue('mailing-queue',{
    connection:{
        host: process.env.BULLMQ_HOST ,
        port: process.env.BULLMQ_PORT
    }
})

async function queueEmail(data) {
    try {
        const res = await mailingQueue.add('email to user', data);
        console.log(`Email queued with job ID: ${res.id}`);
    } catch (error) {
        console.error('Failed to queue email:', error);
    }
}

const PORT = process.env.TASK_SERVICE_PORT;
app.use(cors());
app.use(express.json());

app.post('/', async (req, res) => {

    const token = req.headers.authorization;
    const parsedToken = token.split(' ')[1];
    const decodedToken = jwt.decode(parsedToken);

    const taskBody = {...req.body, created_by: parseInt(decodedToken.id)};
    
    const validateBody = tasksSchema.safeParse(taskBody);

    if(!validateBody.success){
        return res.status(401).json(validateBody?.error.errors);
    }
    try{

        const dueDate = new Date(taskBody.due_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (isNaN(dueDate.getTime()) || dueDate < today) {
            return res.status(400).json({ message: "Due date must be a valid date and cannot be in the past" });
        }

        const insertQuery = `INSERT INTO tasks (title, description, status, due_date, created_by) VALUES ($1, $2, $3, $4, $5);`;
        const values = [taskBody.title, taskBody.description, taskBody.status, dueDate, taskBody.created_by];
        const result = await Task.query(insertQuery, values);
        
        const mailObject = {
            to: decodedToken.email,
            subject: `New Task Created: ${taskBody.title}`,
            html: `Hello ${decodedToken.first_name} ${decodedToken.last_name}, <br/> A new task has been created: <br/> Title: ${taskBody.title} <br/> Description: ${taskBody.description} <br/> Status: ${taskBody.status} <br/> Due Date: ${taskBody.due_date} <br/>Thanks!`
        };

        await queueEmail(mailObject);
    
        res.status(201).json({
            message: "Task created succesfully!"
        })
    }catch(e){

        console.error(e);
        res.status(500).json({
            message: "Error in creating the tasks, Please try again!"
        })

    }
})

app.get('/', async (req, res) => {
    // The tasks could be filtered by created_by and status,
    const {created_by, status} = req.query;
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.query.limit) || 10; // Default to 10 results per page if not provided
    const offset = (page - 1) * limit;

    const statusValidation = taskStatusSchema.safeParse(status);
    
    if(!statusValidation.success){
        return res.status(401).json(statusValidation.error.errors);
    }

    try {
        let selectQuery = `SELECT * FROM tasks`;
        const conditions = [];
        conditions.push(`is_deleted = false`);
        if (created_by) conditions.push(`created_by = ${created_by}`);
        if (status) conditions.push(`status = '${status}'`);

        if (conditions.length > 0) {
            selectQuery += ' WHERE ' + conditions.join(' AND ');
        }

        selectQuery += ` LIMIT ${limit} OFFSET ${offset}`;

        const result = await Task.query(selectQuery);
        
        res.status(200).json(result);

    } catch (e) {
        console.error(e);
        res.status(500).json({
            message: "Error in fetching tasks!"
        });
    }
});

app.patch('/delete', async (req, res)=>{

    const deleteId = req.query.id;

    try{
        const deleteQuery = `UPDATE tasks SET is_deleted = true WHERE id = ${deleteId}`

        const result = await Task.query(deleteQuery);

        if(result.rowCount == 0){
            return res.status(404).json({
                message: "Task not found!"
            })
        }

        res.status(200).json({
            message: "Task deleted succesfully"
        })
    } catch(e){
        console.error(e);
        res.status(500).json({
            message: "Error in deleting the task!"
        })
    }
})

app.patch('/updatestatus', async (req, res)=>{

    const taskId = req.query.id;
    const taskStatus = req.query.taskStatus;

    const statusValidation = taskStatusSchema.safeParse(taskStatus);   
    if(!statusValidation.success){
        return res.status(401).json(statusValidation.error.errors);
    }

    try{

        const updateQuery = `UPDATE tasks SET status = '${taskStatus}' WHERE id = ${taskId};`;
        console.log(updateQuery);
        const result = await Task.query(updateQuery);
        
        if(result.rowCount == 0){
            return res.status(404).json({
                message: "Task not found!"
            })
        }
        res.status(200).json({
            message: "Task updated succesfully!"
        })

    } catch(e){
        console.error(e);
        res.status(500).json({
            message: "Error in updating the task!"
        })
    }
})

app.listen(PORT, ()=>{
    console.log(`Task microservice listening on port ${PORT}`)
})