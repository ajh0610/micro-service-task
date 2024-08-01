const {z} = require('zod');

const tasksSchema = z.object({
    title: z.string().min(1, 'Title must be provided'),
    description: z.string().min(1, 'Description must be provided'),
    status: z.enum(['pending', 'in-progress', 'completed'], 'Status must be one of: pending, in-progress, completed'),
    due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Due date must be in YYYY-MM-DD format" }),
    created_by: z.number()
});

const taskStatusSchema = z.enum(['pending', 'in-progress', 'completed'], 'Status must be one of: pending, in-progress, completed')

module.exports = {
    tasksSchema,
    taskStatusSchema
}