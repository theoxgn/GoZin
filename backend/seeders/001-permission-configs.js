'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('PermissionConfigs', [
      {
        id: uuidv4(),
        permissionType: 'short_leave',
        label: 'Izin Singkat',
        maxPerMonth: 4,
        maxDurationDays: 1,
        description: 'Izin untuk keperluan singkat dalam sehari',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        permissionType: 'cuti',
        label: 'Cuti Tahunan',
        maxPerMonth: 2,
        maxDurationDays: 12,
        description: 'Cuti tahunan karyawan',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        permissionType: 'visit',
        label: 'Kunjungan',
        maxPerMonth: 3,
        maxDurationDays: 3,
        description: 'Kunjungan ke client atau vendor',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        permissionType: 'dinas',
        label: 'Perjalanan Dinas',
        maxPerMonth: 2,
        maxDurationDays: 7,
        description: 'Perjalanan dinas luar kota',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('PermissionConfigs', null, {});
  }
};