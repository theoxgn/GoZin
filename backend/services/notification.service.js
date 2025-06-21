const { Notification, User } = require('../models');

/**
 * Service untuk membuat notifikasi saat status perizinan berubah
 */
exports.createPermissionStatusNotification = async (permission, oldStatus, newStatus, actor) => {
  try {
    // Dapatkan data user yang memiliki perizinan
    const user = await User.findByPk(permission.userId);
    if (!user) {
      console.error('User not found for permission:', permission.id);
      return null;
    }

    let title = '';
    let message = '';
    let type = 'info';

    // Tentukan judul, pesan, dan tipe notifikasi berdasarkan perubahan status
    switch (newStatus) {
      case 'approved_by_approval':
        title = 'Perizinan Disetujui oleh Approval';
        message = `Perizinan ${permission.type} Anda dari tanggal ${formatDate(permission.startDate)} sampai ${formatDate(permission.endDate)} telah disetujui oleh Approval dan sedang menunggu persetujuan HRD.`;
        type = 'success';
        break;
      case 'approved':
        title = 'Perizinan Disetujui';
        message = `Perizinan ${permission.type} Anda dari tanggal ${formatDate(permission.startDate)} sampai ${formatDate(permission.endDate)} telah disetujui sepenuhnya.`;
        type = 'success';
        break;
      case 'rejected':
        title = 'Perizinan Ditolak';
        message = `Perizinan ${permission.type} Anda dari tanggal ${formatDate(permission.startDate)} sampai ${formatDate(permission.endDate)} telah ditolak dengan alasan: ${permission.rejectionReason || 'Tidak ada alasan yang diberikan'}.`;
        type = 'error';
        break;
      case 'canceled':
        title = 'Perizinan Dibatalkan';
        message = `Perizinan ${permission.type} Anda dari tanggal ${formatDate(permission.startDate)} sampai ${formatDate(permission.endDate)} telah dibatalkan.`;
        type = 'warning';
        break;
      default:
        title = 'Status Perizinan Berubah';
        message = `Status perizinan ${permission.type} Anda dari tanggal ${formatDate(permission.startDate)} sampai ${formatDate(permission.endDate)} telah berubah dari ${oldStatus} menjadi ${newStatus}.`;
        break;
    }

    // Buat notifikasi untuk user
    try {
      const notification = await Notification.create({
        userId: permission.userId,
        permissionId: permission.id,
        title,
        message,
        type
      });
      console.log('Notification created:', notification.id);

      return notification;
    } catch (err) {
      console.error('Error creating notification:', err);
      return null;
    }
  } catch (error) {
    console.error('Error creating permission status notification:', error);
    return null;
  }
};

/**
 * Service untuk membuat notifikasi saat perizinan baru dibuat
 */
exports.createNewPermissionNotification = async (permission) => {
  try {
    // Dapatkan data user yang memiliki perizinan
    const user = await User.findByPk(permission.userId);
    if (!user) {
      console.error('User not found for permission:', permission.id);
      return null;
    }

    const title = 'Perizinan Baru Dibuat';
    const message = `Anda telah membuat perizinan ${permission.type} baru dari tanggal ${formatDate(permission.startDate)} sampai ${formatDate(permission.endDate)}. Status: Menunggu persetujuan.`;
    const type = 'info';

    // Buat notifikasi untuk user
    try {
      const notification = await Notification.create({
        userId: permission.userId,
        permissionId: permission.id,
        title,
        message,
        type
      });
      console.log('New permission notification created:', notification.id);

      return notification;
    } catch (err) {
      console.error('Error creating notification:', err);
      return null;
    }
  } catch (error) {
    console.error('Error creating new permission notification:', error);
    return null;
  }
};

/**
 * Helper function untuk memformat tanggal
 */
function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}