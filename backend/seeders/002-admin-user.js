'use strict';
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await queryInterface.bulkInsert('Users', [
      {
        id: uuidv4(),
        name: 'Administrator',
        email: 'admin@company.com',
        password: hashedPassword,
        role: 'admin',
        department: 'IT',
        position: 'System Administrator',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'HR Manager',
        email: 'hr@company.com',
        password: hashedPassword,
        role: 'hrd',
        department: 'Human Resources',
        position: 'HR Manager',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Team Lead',
        email: 'approval@company.com',
        password: hashedPassword,
        role: 'approval',
        department: 'Development',
        position: 'Team Leader',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Staff',
        email: 'staff@company.com',
        password: hashedPassword,
        role: 'user',
        department: 'IT',
        position: 'Staff',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  }
};