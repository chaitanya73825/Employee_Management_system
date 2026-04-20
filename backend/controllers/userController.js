const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createUser = async (req, res) => {
    try {
        const { name, employeeId, email, password } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        if (employeeId) {
            const existingEmp = await User.findOne({ employeeId });
            if (existingEmp) return res.status(400).json({ message: 'Employee ID already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            employeeId,
            email,
            password: hashedPassword,
            role: 'employee'
        });

        await newUser.save();
        res.status(201).json({ message: 'User created successfully', user: { id: newUser._id, employeeId: newUser.employeeId, name: newUser.name, email: newUser.email, role: 'employee' } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const promoteToHR = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'hr') {
            return res.status(400).json({ message: 'User is already HR' });
        }

        user.role = 'hr';
        await user.save();

        res.status(200).json({ message: 'User promoted to HR', user: { id: user._id, name: user.name, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const assignHRToEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { hrId } = req.body;

        const employee = await User.findById(employeeId);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        const hr = await User.findById(hrId);
        if (!hr || hr.role !== 'hr') return res.status(400).json({ message: 'Invalid HR ID or User is not HR' });

        employee.hrId = hrId;
        await employee.save();

        res.status(200).json({ message: 'HR assigned to employee successfully', user: { id: employee._id, name: employee.name, hrId: employee.hrId } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createUser,
    getUsers,
    promoteToHR,
    assignHRToEmployee
};
