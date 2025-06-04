'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const userId = '2aa2ccc3-99c6-4130-b0cc-79db69c77fcf';
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Generate attendance data for the current month
    const attendanceData = [];
    
    // Get the number of days in the current month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Generate data for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (date.getDay() === 0 || date.getDay() === 6) {
        continue;
      }

      // Randomly determine attendance status
      const statusRandom = Math.random();
      let status, clockInTime, clockOutTime;

      if (statusRandom < 0.7) { // 70% chance of being present
        status = 'present';
        // Clock in between 7:00 AM and 9:00 AM
        clockInTime = new Date(date);
        clockInTime.setHours(7 + Math.floor(Math.random() * 2));
        clockInTime.setMinutes(Math.floor(Math.random() * 60));
        
        // Clock out between 4:00 PM and 6:00 PM
        clockOutTime = new Date(date);
        clockOutTime.setHours(16 + Math.floor(Math.random() * 2));
        clockOutTime.setMinutes(Math.floor(Math.random() * 60));
      } else if (statusRandom < 0.85) { // 15% chance of being late
        status = 'late';
        // Clock in between 9:00 AM and 10:00 AM
        clockInTime = new Date(date);
        clockInTime.setHours(9 + Math.floor(Math.random() * 1));
        clockInTime.setMinutes(Math.floor(Math.random() * 60));
        
        // Clock out between 4:00 PM and 6:00 PM
        clockOutTime = new Date(date);
        clockOutTime.setHours(16 + Math.floor(Math.random() * 2));
        clockOutTime.setMinutes(Math.floor(Math.random() * 60));
      } else if (statusRandom < 0.95) { // 10% chance of being half day
        status = 'half_day';
        // Clock in between 7:00 AM and 9:00 AM
        clockInTime = new Date(date);
        clockInTime.setHours(7 + Math.floor(Math.random() * 2));
        clockInTime.setMinutes(Math.floor(Math.random() * 60));
        
        // Clock out between 12:00 PM and 1:00 PM
        clockOutTime = new Date(date);
        clockOutTime.setHours(12 + Math.floor(Math.random() * 1));
        clockOutTime.setMinutes(Math.floor(Math.random() * 60));
      } else { // 5% chance of being absent
        status = 'absent';
        clockInTime = null;
        clockOutTime = null;
      }

      attendanceData.push({
        id: uuidv4(),
        userId,
        clockInTime,
        clockOutTime,
        clockInLatitude: status !== 'absent' ? -6.2088 + (Math.random() * 0.01) : null,
        clockInLongitude: status !== 'absent' ? 106.8456 + (Math.random() * 0.01) : null,
        clockOutLatitude: status !== 'absent' && status !== 'half_day' ? -6.2088 + (Math.random() * 0.01) : null,
        clockOutLongitude: status !== 'absent' && status !== 'half_day' ? 106.8456 + (Math.random() * 0.01) : null,
        clockInPhoto: status !== 'absent' ? 'sample_clock_in.jpg' : null,
        clockOutPhoto: status !== 'absent' && status !== 'half_day' ? 'sample_clock_out.jpg' : null,
        status,
        notes: status === 'late' ? 'Terlambat karena macet' : 
               status === 'half_day' ? 'Setengah hari karena urusan keluarga' : 
               status === 'absent' ? 'Sakit' : null,
        date,
        isValid: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await queryInterface.bulkInsert('Attendances', attendanceData, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Attendances', null, {});
  }
}; 