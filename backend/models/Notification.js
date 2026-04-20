const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Recipient ID (from AuthContext)
    message: { type: String, required: true },
    type: { 
        type: String, 
        enum: ['task_assigned', 'project_assigned', 'task_submitted', 'task_rejected', 'task_approved'], 
        required: true 
    },
    isRead: { type: Boolean, default: false },
    link: { type: String }, // Optional path to navigate to
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
