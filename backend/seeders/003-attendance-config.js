'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('AttendanceConfigs', [{
      id: uuidv4(),
      workStartTime: '08:00:00',
      workEndTime: '17:00:00',
      lateThreshold: 15,
      locationRequired: true,
      photoRequired: true,
      officeLocations: JSON.stringify([
        {
          name: 'Kantor Pusat',
          latitude: -6.2088,
          longitude: 106.8456,
          radius: 100
        }
      ]),
      maxDistanceMeters: 100,
      workingDays: JSON.stringify([1, 2, 3, 4, 5]),
      isActive: true,
      departmentId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('AttendanceConfigs', null, {});
  }
};