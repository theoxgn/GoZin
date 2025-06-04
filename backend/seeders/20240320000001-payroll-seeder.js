'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Data gaji untuk setiap user
    const payrollData = [
      {
        // Administrator
        userId: '9188b222-ed5a-495a-94eb-0bfe338d1264',
        basicSalary: 15000000,
        allowances: 3000000,
        department: 'IT',
        position: 'System Administrator'
      },
      {
        // HR Manager
        userId: '536cc2df-824c-4b3f-99c6-16aeea9bd74a',
        basicSalary: 12000000,
        allowances: 2500000,
        department: 'Human Resources',
        position: 'HR Manager'
      },
      {
        // Team Lead
        userId: '96cc9da5-a73f-47d3-8cb8-f4b6e517521a',
        basicSalary: 10000000,
        allowances: 2000000,
        department: 'Development',
        position: 'Team Leader'
      },
      {
        // Staff
        userId: '2aa2ccc3-99c6-4130-b0cc-79db69c77fcf',
        basicSalary: 8000000,
        allowances: 1500000,
        department: 'IT',
        position: 'Staff'
      }
    ];

    const payrollRecords = [];

    // Generate payroll data for each user
    for (const userData of payrollData) {
      // Generate for current month
      const payroll = await generatePayrollRecord(userData, currentMonth, currentYear);
      payrollRecords.push(payroll);

      // Generate for previous month
      const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      const prevPayroll = await generatePayrollRecord(userData, prevMonth, prevYear);
      payrollRecords.push(prevPayroll);
    }

    await queryInterface.bulkInsert('Payrolls', payrollRecords, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Payrolls', null, {});
  }
};

// Helper function to generate payroll record
async function generatePayrollRecord(userData, month, year) {
  const { userId, basicSalary, allowances } = userData;

  // Calculate deductions
  const bpjsKesehatan = basicSalary * 0.01; // 1% of basic salary
  const bpjsKetenagakerjaan = basicSalary * 0.02; // 2% of basic salary

  // Calculate PPh21 (simplified calculation)
  const annualIncome = basicSalary * 12;
  let pph21 = 0;
  if (annualIncome <= 50000000) {
    pph21 = (basicSalary * 0.05) / 12; // 5% for annual income up to 50 million
  } else if (annualIncome <= 250000000) {
    pph21 = (basicSalary * 0.15) / 12; // 15% for annual income 50-250 million
  } else if (annualIncome <= 500000000) {
    pph21 = (basicSalary * 0.25) / 12; // 25% for annual income 250-500 million
  } else {
    pph21 = (basicSalary * 0.30) / 12; // 30% for annual income above 500 million
  }

  // Calculate overtime (random between 0-20 hours)
  const overtimeHours = Math.floor(Math.random() * 20);
  const overtimeRate = basicSalary / 173; // Assuming 173 working hours per month
  const overtime = overtimeHours * overtimeRate;

  // Calculate total earnings and deductions
  const totalEarnings = basicSalary + allowances + overtime;
  const totalDeductions = bpjsKesehatan + bpjsKetenagakerjaan + pph21;
  const netSalary = totalEarnings - totalDeductions;

  // Determine status based on current date
  const currentDate = new Date();
  const isCurrentMonth = currentDate.getMonth() + 1 === month && currentDate.getFullYear() === year;
  let status = 'draft';
  let paymentDate = null;

  if (!isCurrentMonth) {
    status = 'paid';
    paymentDate = new Date(year, month - 1, 25); // Assume payment on 25th of the month
  }

  return {
    id: uuidv4(),
    userId,
    month,
    year,
    basicSalary,
    allowances,
    overtime,
    deductions: totalDeductions - (bpjsKesehatan + bpjsKetenagakerjaan + pph21), // Other deductions
    bpjsKesehatan,
    bpjsKetenagakerjaan,
    pph21,
    totalEarnings,
    totalDeductions,
    netSalary,
    status,
    paymentDate,
    notes: `Overtime: ${overtimeHours} hours`,
    createdAt: new Date(),
    updatedAt: new Date()
  };
} 