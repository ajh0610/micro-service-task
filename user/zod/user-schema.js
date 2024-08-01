const z = require('zod');


const signupSchema = z.object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    email: z.string().email('Invalid Email Address')
});

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
})


module.exports = {
    signupSchema,
    loginSchema
};