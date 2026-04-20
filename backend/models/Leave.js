const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hrId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    days: { type: Number, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    userName: { type: String } // Storing for quick access in listing
}, {
    timestamps: true
});

module.exports = mongoose.model('Leave', leaveSchema);
