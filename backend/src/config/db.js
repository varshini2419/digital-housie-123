const mongoose = require('mongoose');

const connectDB = async () => {
    let uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/housie';
    try {
        await mongoose.connect(uri);
        console.log('MongoDB Connected successfully...');
        
        // Auto-initialize default admin account if not present
        const { ensureDefaultAdmin } = require('../controllers/adminController');
        await ensureDefaultAdmin();
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message);
        // Fallback to local MongoDB if primary remote connection failed
        if (uri !== 'mongodb://127.0.0.1:27017/housie') {
            console.log('Attempting fallback to local MongoDB (mongodb://127.0.0.1:27017/housie)...');
            try {
                await mongoose.connect('mongodb://127.0.0.1:27017/housie');
                console.log('Connected to local MongoDB fallback...');
                const { ensureDefaultAdmin } = require('../controllers/adminController');
                await ensureDefaultAdmin();
                return;
            } catch (fallbackErr) {
                console.error('Local MongoDB fallback also failed:', fallbackErr.message);
            }
        }
        process.exit(1);
    }
};

module.exports = connectDB;
