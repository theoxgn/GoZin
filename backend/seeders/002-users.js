'use strict';
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await queryInterface.bulkInsert('Users', [
      {
        id: '9188b222-ed5a-495a-94eb-0bfe338d1264',
        name: 'Administrator',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        department: 'IT',
        position: 'System Administrator',
        basicSalary: 15000000,
        allowances: 3000000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '536cc2df-824c-4b3f-99c6-16aeea9bd74a',
        name: 'HR Manager',
        email: 'hr@example.com',
        password: hashedPassword,
        role: 'hrd',
        department: 'Human Resources',
        position: 'HR Manager',
        basicSalary: 12000000,
        allowances: 2500000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '96cc9da5-a73f-47d3-8cb8-f4b6e517521a',
        name: 'Team Lead',
        email: 'teamlead@example.com',
        password: hashedPassword,
        role: 'approval',
        department: 'Development',
        position: 'Team Leader',
        basicSalary: 10000000,
        allowances: 2000000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2aa2ccc3-99c6-4130-b0cc-79db69c77fcf',
        name: 'Staff',
        email: 'staff@example.com',
        password: hashedPassword,
        role: 'user',
        department: 'IT',
        position: 'Staff',
        basicSalary: 8000000,
        allowances: 1500000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
}; 