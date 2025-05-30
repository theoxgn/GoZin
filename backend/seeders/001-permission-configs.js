'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('PermissionConfigs', [
      {
        id: uuidv4(),
        permissionType: 'short_leave',
        maxPerMonth: 4,
        maxDurationDays: 1,
        description: 'Izin untuk keperluan singkat dalam sehari',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        permissionType: 'cuti',
        maxPerMonth: 2,
        maxDurationDays: 12,
        description: 'Cuti tahunan karyawan',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        permissionType: 'visit',
        maxPerMonth: 3,
        maxDurationDays: 3,
        description: 'Kunjungan ke client atau vendor',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        permissionType: 'dinas',
        maxPerMonth: 2,
        maxDurationDays: 7,
        description: 'Perjalanan dinas luar kota',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('PermissionConfigs', null, {});
  }
};