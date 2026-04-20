const mongoose = require('mongoose');

const financeSchema = new mongoose.Schema({
    revenue: { type: Number, default: 0 },
    totalSalaries: { type: Number, default: 0 },
    otPaid: { type: Number, default: 0 },
    net: { type: Number, default: 0 }
}, {
    timestamps: true
});

module.exports = mongoose.model('Finance', financeSchema);
