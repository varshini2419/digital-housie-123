const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const ensureDefaultAdmin = async () => {
    try {
        const username = 'varshini';
        const existing = await Admin.findOne({ username });
        if (!existing) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('varshini@123', salt);
            await Admin.create({
                username: 'varshini',
                password: hashedPassword,
                role: 'superadmin'
            });
            console.log('[Auth] Default admin account "varshini" initialized.');
        }
    } catch (err) {
        console.error('[Auth] Error ensuring default admin account:', err.message);
    }
};

exports.ensureDefaultAdmin = ensureDefaultAdmin;

exports.setupAdmin = async (req, res) => {
    try {
        const username = req.body?.username || 'varshini';
        const password = req.body?.password || 'varshini@123';
        const role = req.body?.role || 'superadmin';

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const admin = await Admin.findOneAndUpdate(
            { username },
            { username, password: hashedPassword, role },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );

        res.status(201).json({ 
            message: `Admin configured successfully. Username: ${username}`, 
            username: admin.username,
            role: admin.role 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const payload = {
            admin: {
                id: admin.id,
                role: admin.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, role: admin.role, username: admin.username });
            }
        );
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
