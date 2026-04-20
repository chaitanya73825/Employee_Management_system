const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./db');
const { createDefaultAdmin, login } = require('./controllers/authController');
const { createUser, getUsers, promoteToHR, assignHRToEmployee } = require('./controllers/userController');
const Project = require('./models/Project');
const Task = require('./models/Task');
const Message = require('./models/Message');
const Notification = require('./models/Notification');
const Leave = require('./models/Leave');
const Finance = require('./models/Finance');

const app = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// Auth
app.post('/api/login', login);

// Users
app.post('/api/register', createUser); // Admin creates users
app.get('/api/users', getUsers);
app.put('/api/users/:userId/promote', promoteToHR);
app.put('/api/users/:employeeId/assign-hr', assignHRToEmployee);

// --- Core API Routes ---


// Messages
app.get('/api/messages/:u1/:u2', async (req, res) => {
    try {
        const { u1, u2 } = req.params;
        
        // Validate ObjectIds
        if (!mongoose.Types.ObjectId.isValid(u1) || !mongoose.Types.ObjectId.isValid(u2)) {
            console.error(`Invalid IDs: u1=${u1}, u2=${u2}`);
            return res.status(200).json([]); // Return empty messages for invalid IDs
        }

        console.log(`Fetching messages between ${u1} and ${u2}`);
        
        const messages = await Message.find({
            $or: [
                { sender: u1, receiver: u2 },
                { sender: u2, receiver: u1 }
            ]
        }).sort({ createdAt: 1 });
        
        res.status(200).json(messages);
    } catch (err) {
        console.error('Error fetching messages:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/messages', async (req, res) => {
    try {
        console.log('Sending message:', req.body);
        const { sender, receiver, content } = req.body;
        
        if (!sender || !receiver || !content) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const msg = new Message({ sender, receiver, content });
        await msg.save();
        res.status(201).json(msg);
    } catch (err) {
        console.error('Error sending message:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/messages/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const messages = await Message.find({
            $or: [{ sender: userId }, { receiver: userId }]
        }).sort({ createdAt: -1 });
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Notifications
app.get('/api/notifications/:userId', async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 }).limit(20);
        res.status(200).json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/notifications/read-all/:userId', async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.params.userId, isRead: false }, { isRead: true });
        res.status(200).json({ message: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/notifications/:id/read', async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.status(200).json({ message: 'Marked as read' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Projects
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await Project.find();
        res.status(200).json(projects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/projects/seed', async (req, res) => {
    try {
        const count = await Project.countDocuments();
        if (count === 0) {
            const initial = [
                { name: "Alpha Protocol Redesign", estimatedValue: 45000, deadline: "2026-05-15", status: "available", bidAttempts: 0, guaranteedWinAttempt: 2 },
                { name: "Nexus API Gateway", estimatedValue: 80000, deadline: "2026-06-01", status: "available", bidAttempts: 0, guaranteedWinAttempt: 1 },
                { name: "Legacy System Migration", estimatedValue: 120000, deadline: "2026-07-20", status: "available", bidAttempts: 0, guaranteedWinAttempt: 3 },
            ];
            await Project.insertMany(initial);
            return res.status(200).json({ message: "Seeded projects successfully" });
        }
        res.status(200).json({ message: "Projects already exist" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/projects/:id', async (req, res) => {
    try {
        const oldProject = await Project.findById(req.params.id);
        const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
        
        // Notify HR on assignment
        if (req.body.assignedHR && req.body.status === "in_progress" && oldProject.status !== "in_progress") {
            const hrUser = await mongoose.model('User').findOne({ name: req.body.assignedHR, role: 'hr' });
            if (hrUser) {
                await new Notification({
                    userId: hrUser._id,
                    message: `Admin assigned you a new project: ${project.name}`,
                    type: 'project_assigned'
                }).save();
            }
        }

        // Notify Admin on HR Submission
        if (req.body.status === "pending_admin" && oldProject.status !== "pending_admin") {
            const adminUser = await mongoose.model('User').findOne({ role: 'admin' });
            if (adminUser) {
                await new Notification({
                    userId: adminUser._id,
                    message: `HR ${project.assignedHR} submitted project for review: ${project.name}`,
                    type: 'project_submitted'
                }).save();
            }
        }

        // Notify HR on Admin Finalization
        if (req.body.status === "completed" && oldProject.status !== "completed") {
            const hrUser = await mongoose.model('User').findOne({ name: project.assignedHR, role: 'hr' });
            if (hrUser) {
                await new Notification({
                    userId: hrUser._id,
                    message: `Admin finalized your project: ${project.name}. Revenue recorded.`,
                    type: 'project_finalized'
                }).save();
            }
        }

        res.status(200).json(project);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.status(200).json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/tasks', async (req, res) => {
    try {
        const task = new Task(req.body);
        await task.save();

        // Notify Employee
        if (task.assignedEmployeeId) {
            await new Notification({
                userId: task.assignedEmployeeId,
                message: `You have been assigned a new task: ${task.title}`,
                type: 'task_assigned'
            }).save();
        }

        res.status(201).json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/tasks/:id', async (req, res) => {
    try {
        const oldTask = await Task.findById(req.params.id);
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });

        // Trigget Notifications based on status change
        if (req.body.status && req.body.status !== oldTask.status) {
            // Task Submission -> Notify HR
            if (req.body.status === 'pending-approval') {
                const project = await Project.findById(task.projectId);
                if (project && project.assignedHR) {
                    const hrUser = await mongoose.model('User').findOne({ name: project.assignedHR, role: 'hr' });
                    if (hrUser) {
                        await new Notification({
                            userId: hrUser._id,
                            message: `Task submitted for review: ${task.title}`,
                            type: 'task_submitted'
                        }).save();
                    }
                }
            }

            // Task Rejection -> Notify Employee
            if (req.body.status === 'in-progress' && oldTask.status === 'pending-approval') {
                 await new Notification({
                    userId: task.assignedEmployeeId,
                    message: `Task rejected by HR: ${task.title}. Please review and resubmit.`,
                    type: 'task_rejected'
                }).save();
            }

            // Task Approval -> Notify Employee
            if (req.body.status === 'done' && oldTask.status === 'pending-approval') {
                 await new Notification({
                    userId: task.assignedEmployeeId,
                    message: `Task Approved: ${task.title}. Great job!`,
                    type: 'task_approved'
                }).save();
            }
        }

        res.status(200).json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Leaves
app.post('/api/leaves', async (req, res) => {
    try {
        const { userId, hrId, type, startDate, endDate, days, reason, userName } = req.body;
        const leave = new Leave({ userId, hrId, type, startDate, endDate, days, reason, userName, status: 'pending' });
        await leave.save();

        // Notify HR
        if (hrId) {
            await new Notification({
                userId: hrId,
                message: `${userName} requested ${type} (${days} days)`,
                type: 'leave_requested'
            }).save();
        }

        res.status(201).json(leave);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/leaves/user/:userId', async (req, res) => {
    try {
        const leaves = await Leave.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.status(200).json(leaves);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/leaves/hr/:hrId', async (req, res) => {
    try {
        const leaves = await Leave.find({ hrId: req.params.hrId }).sort({ createdAt: -1 });
        res.status(200).json(leaves);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/leaves/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const oldLeave = await Leave.findById(req.params.id);
        const leave = await Leave.findByIdAndUpdate(req.params.id, { status }, { new: true });

        // Notify Employee
        await new Notification({
            userId: leave.userId,
            message: `Leave Request (${leave.type}): ${status.toUpperCase()}`,
            type: status === 'approved' ? 'leave_approved' : 'leave_rejected'
        }).save();

        res.status(200).json(leave);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Finances
app.get('/api/finances', async (req, res) => {
    try {
        let finance = await Finance.findOne();
        if (!finance) {
            finance = new Finance({ revenue: 0, totalSalaries: 0, otPaid: 0, net: 0 });
            await finance.save();
        }
        res.status(200).json(finance);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/finances', async (req, res) => {
    try {
        let finance = await Finance.findOne();
        if (!finance) {
            finance = new Finance(req.body);
        } else {
            Object.assign(finance, req.body);
        }
        await finance.save();
        res.status(200).json(finance);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await connectDB();
    await createDefaultAdmin();
    
    // Seed initial projects if empty
    try {
        const count = await Project.countDocuments();
        if (count === 0) {
            const initial = [
                { name: "Alpha Protocol Redesign", estimatedValue: 45000, deadline: "2026-05-15", status: "available", bidAttempts: 0, guaranteedWinAttempt: 2 },
                { name: "Nexus API Gateway", estimatedValue: 80000, deadline: "2026-06-01", status: "available", bidAttempts: 0, guaranteedWinAttempt: 1 },
                { name: "Legacy System Migration", estimatedValue: 120000, deadline: "2026-07-20", status: "available", bidAttempts: 0, guaranteedWinAttempt: 3 },
            ];
            await Project.insertMany(initial);
            console.log("Seeded default projects successfully");
        }
    } catch (err) {
        console.error("Seeding error:", err.message);
    }
});
