// const express = require('express');
// const session = require('express-session');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const bcrypt = require('bcryptjs');
// const path = require('path');

// const app = express();

// // MongoDB connection
// mongoose.connect('mongodb+srv://movi:movi@movi.muqtx3v.mongodb.net/movi', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// }).then(() => {
//     console.log('Connected to MongoDB');
// }).catch(err => {
//     console.error('MongoDB connection error:', err);
// });
// // User schema and model
// const userSchema = new mongoose.Schema({
//     username: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     amount: { type: Number, default: 0 },
//     profitBalance: { type: Number, default: 0 }
// });

// userSchema.methods.deposit = function(amount) {
//     this.amount += amount;
//     // Add logic to update profit balance if needed
// };

// const User = mongoose.model('User', userSchema);

// // Deposit schema and model
// const depositSchema = new mongoose.Schema({
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//     amount: Number,
//     profitBalance: { type: Number, default: 0 },
//     timestamp: { type: Date, default: Date.now }
// });

// const Deposit = mongoose.model('Deposit', depositSchema);

// app.use(express.json());
// app.use(cors({
//     origin: 'https://your-client-app-domain.com', // Update with your client's domain
//     credentials: true
// }));

// app.use(session({
//     secret: process.env.SESSION_SECRET || 'hot dog',
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
//         maxAge: 1000 * 60 * 60 * 24 // 1 day
//     }
// }));

// // Serve static files from the "public" directory
// app.use(express.static(path.join(__dirname, 'public')));

// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// // Middleware to protect routes
// const requireAuth = async (req, res, next) => {
//     if (!req.session.userId) {
//         return res.status(401).json({ error: 'Unauthorized' });
//     }
//     try {
//         const user = await User.findById(req.session.userId);
//         if (!user) {
//             return res.status(401).json({ error: 'Unauthorized' });
//         }
//         next();
//     } catch (error) {
//         console.error('Error during authentication:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };

// // Registration endpoint
// app.post('/api/register', async (req, res) => {
//     const { username, email, password } = req.body;
//     try {
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const user = new User({ username, email, password: hashedPassword });
//         await user.save();
//         res.status(201).json({ message: 'User registered successfully' });
//     } catch (error) {
//         console.error('Error during registration:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// // Login endpoint
// app.post('/api/login', async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         const user = await User.findOne({ email });
//         if (user && await bcrypt.compare(password, user.password)) {
//             req.session.userId = user._id;
//             res.status(200).json({ message: 'Login successful' });
//         } else {
//             res.status(401).json({ error: 'Invalid credentials' });
//         }
//     } catch (error) {
//         console.error('Error during login:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// // Logout endpoint
// app.post('/api/logout', (req, res) => {
//     req.session.destroy((err) => {
//         if (err) {
//             return res.status(500).json({ error: 'Failed to log out' });
//         }
//         res.clearCookie('connect.sid');
//         res.status(200).json({ message: 'Logged out successfully' });
//     });
// });

// // Check authentication endpoint
// app.get('/api/check-authentication', requireAuth, (req, res) => {
//     res.status(200).json({ authenticated: true });
// });

// // Deposit endpoint
// app.post('/api/deposit', requireAuth, async (req, res) => {
//     const { amount } = req.body;
//     try {
//         const deposit = new Deposit({ userId: req.session.userId, amount });
//         await deposit.save();
        
//         // Fetch the latest deposit info
//         const latestDeposit = await Deposit.findOne({ userId: req.session.userId }).sort({ timestamp: -1 });
//         if (latestDeposit) {
//             const secondsPassed = Math.floor((Date.now() - latestDeposit.timestamp) / 1000);
//             const profitEarned = latestDeposit.amount * (Math.pow(1.3, secondsPassed / (24 * 60 * 60)) - 1);
//             const profitBalance = latestDeposit.profitBalance + profitEarned;
//             res.status(201).json({ message: 'Deposit saved successfully', amount: latestDeposit.amount, profitBalance });
//         } else {
//             res.status(201).json({ message: 'Deposit saved successfully', amount: 0, profitBalance: 0 });
//         }
//     } catch (error) {
//         console.error('Error during deposit:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// // Get deposit info endpoint

// app.get('/api/deposit', requireAuth, async (req, res) => {
//     try {
//         const latestDeposit = await Deposit.findOne({ userId: req.session.userId }).sort({ timestamp: -1 });
//         if (latestDeposit) {
//             const secondsPassed = Math.floor((Date.now() - latestDeposit.timestamp) / 1000);
//             const profitEarned = latestDeposit.amount * (Math.pow(1.3, secondsPassed / (24 * 60 * 60)) - 1);
//             const profitBalance = latestDeposit.profitBalance + profitEarned;
//             res.json({ amount: latestDeposit.amount, profitBalance });
//         } else {
//             res.json({ amount: 0, profitBalance: 0 });
//         }
//     } catch (error) {
//         console.error('Error fetching deposit:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// // Route to get user information if authenticated
// app.get('/api/user', requireAuth, async (req, res) => {
//     try {
//         const user = await User.findById(req.session.userId, 'username email');
//         if (user) {
//             res.json(user);
//         } else {
//             res.status(404).json({ error: 'User not found' });
//         }
//     } catch (error) {
//         console.error('Error fetching user info:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// // Start the server
// const PORT = process.env.PORT || 8000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });
