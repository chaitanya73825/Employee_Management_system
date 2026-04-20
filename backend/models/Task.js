const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    projectId: { type: String, required: true }, // Store as string if using string IDs across contexts
    title: { type: String, required: true },
    description: { type: String, default: "" },
    deadline: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['todo', 'in-progress', 'pending-approval', 'done'], default: 'todo' },
    assignedEmployeeId: { type: String, default: null } 
}, {
    timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
