import express from 'express';
import bcrypt from 'bcryptjs'; // Fixed typo here (removed the 'y')
import User from '../../models/user.model.js';
const router = express.Router();

// ==========================================
// LOGIN ROUTE
// ==========================================
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' })
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' })
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // --- FIXED: You need to send a response back on success! ---
        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (err) {
        res.status(500).json({ message: 'internal server error' })
    }
})

// ==========================================
// REGISTER ROUTE
// ==========================================
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Enter all your fields' })
    }
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' })
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        })
        
        const savedUser = await User.create(newUser)
        
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: savedUser._id, // Fixed: changed ._index to ._id
                username: savedUser.username,
                email: savedUser.email
            }
        });

    } catch (err) {
        res.status(500).json({ message: `Server error from register: ${err.message}` })
    }
})

export default router;