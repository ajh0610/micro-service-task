const z = require('zod');
// This is the input validation for the backend inputs by using an open source library called zod.



// Schema structure for the signup input object
const signupSchema = z.object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    email: z.string().email('Invalid Email Address')
});

// Schema structure for the login input object
const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
})


module.exports = {
    signupSchema,
    loginSchema
};