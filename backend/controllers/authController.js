const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createDefaultAdmin = async () => {
    try {
        const adminExists = await User.findOne({ role: 'admin' });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('chaitu@admin', 10);
            const admin = new User({
                name: 'System Admin',
                email: 'chaitu@admin.in',
                password: hashedPassword,
                role: 'admin'
            });
            await admin.save();
            console.log('Default Admin created successfully.');
        } else {
            console.log('Admin user already exists.');
        }
    } catch (error) {
        console.error('Error creating default admin:', error);
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Check your credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Check your credentials' });
        }

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                employeeId: user.employeeId,
                name: user.name,
                email: user.email,
                role: user.role,
                hrId: user.hrId
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createDefaultAdmin,
    login
};
