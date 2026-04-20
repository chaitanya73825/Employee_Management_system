const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    baseSalary: { type: Number, required: true },
    overtimeHours: { type: Number, default: 0 },
    totalSalary: { type: Number, required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payroll', payrollSchema);
