const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    estimatedValue: { type: Number, required: true },
    deadline: { type: String, required: true }, // Store as string to match frontend's input behavior
    status: { 
        type: String, 
        enum: ['available', 'won', 'in_progress', 'pending_admin', 'ready', 'completed'], 
        default: 'available' 
    },
    assignedHR: { type: String, default: null }, // Matches HR name
    botBids: [{ type: Number }],
    adminBid: { type: Number },
    bidAttempts: { type: Number, default: 0 },
    guaranteedWinAttempt: { type: Number, default: 1 }
}, {
    timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);
