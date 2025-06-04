import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Chip,
} from '@mui/material';
import {
  Print as PrintIcon,
  ArrowBack as ArrowBackIcon,
  CalendarMonth as CalendarMonthIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Badge as BadgeIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AccountBalance as AccountBalanceIcon,
  CreditCard as CreditCardIcon,
  Receipt as ReceiptIcon,
  MonetizationOn as MonetizationOnIcon,
  RemoveCircle as RemoveCircleIcon,
  AddCircle as AddCircleIcon,
} from '@mui/icons-material';
import { useReactToPrint } from 'react-to-print';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

function PayslipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payslip, setPayslip] = useState(null);
  const printRef = React.useRef();

  useEffect(() => {
    fetchPayslipData();
  }, [id]);

  const fetchPayslipData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/payroll/slip/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setPayslip(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching payslip data:', err);
      setError('Gagal memuat data slip gaji');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Slip_Gaji_${payslip?.user?.name || 'Karyawan'}_${payslip?.month || ''}_${payslip?.year || ''}`,
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatMonthYear = (month, year) => {
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${monthNames[month - 1]} ${year}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: id });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'draft':
        return <Chip label="Draft" color="default" size="small" />;
      case 'processed':
        return <Chip label="Diproses" color="primary" size="small" />;
      case 'paid':
        return <Chip label="Dibayar" color="success" size="small" />;
      default:
        return <Chip label={status} color="default" size="small" />;
    }
  };

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Kembali
        </Button>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          disabled={loading || !!error}
        >
          Cetak Slip Gaji
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
      ) : (
        <Box ref={printRef} sx={{ p: 2, bgcolor: 'background.paper' }}>
          {/* Payslip Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              SLIP GAJI KARYAWAN
            </Typography>
            <Typography variant="h6" component="h2" gutterBottom>
              PT. NAMA PERUSAHAAN
            </Typography>
            <Typography variant="body1" gutterBottom>
              Jl. Contoh Alamat No. 123, Jakarta Selatan
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Periode: {formatMonthYear(payslip.month, payslip.year)}
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Employee Information */}
          <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #e0e0e0' }}>
            <Typography variant="h6" component="h3" gutterBottom>
              Informasi Karyawan
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" component="span" sx={{ width: 120 }}>Nama</Typography>
                    <Typography variant="body1" component="span" sx={{ fontWeight: 'medium' }}>
                      {payslip.user?.name || '-'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BadgeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" component="span" sx={{ width: 120 }}>NIP</Typography>
                    <Typography variant="body1" component="span">
                      {payslip.user?.employeeId || '-'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" component="span" sx={{ width: 120 }}>Departemen</Typography>
                    <Typography variant="body1" component="span">
                      {payslip.user?.department?.name || '-'}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" component="span" sx={{ width: 120 }}>Email</Typography>
                    <Typography variant="body1" component="span">
                      {payslip.user?.email || '-'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" component="span" sx={{ width: 120 }}>Telepon</Typography>
                    <Typography variant="body1" component="span">
                      {payslip.user?.phone || '-'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccountBalanceIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" component="span" sx={{ width: 120 }}>Bank</Typography>
                    <Typography variant="body1" component="span">
                      {payslip.user?.bankName || '-'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CreditCardIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" component="span" sx={{ width: 120 }}>No. Rekening</Typography>
                    <Typography variant="body1" component="span">
                      {payslip.user?.bankAccount || '-'}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* Payroll Information */}
          <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #e0e0e0' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h3">
                Informasi Penggajian
              </Typography>
              <Box>
                {getStatusChip(payslip.status)}
              </Box>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarMonthIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" component="span" sx={{ width: 160 }}>Periode</Typography>
                    <Typography variant="body1" component="span">
                      {formatMonthYear(payslip.month, payslip.year)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ReceiptIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" component="span" sx={{ width: 160 }}>Nomor Slip</Typography>
                    <Typography variant="body1" component="span">
                      {payslip.payslipNumber || `-`}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  {payslip.paymentDate && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarMonthIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" component="span" sx={{ width: 160 }}>Tanggal Pembayaran</Typography>
                      <Typography variant="body1" component="span">
                        {formatDate(payslip.paymentDate)}
                      </Typography>
                    </Box>
                  )}
                  {payslip.notes && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <ReceiptIcon sx={{ mr: 1, mt: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" component="span" sx={{ width: 160 }}>Catatan</Typography>
                      <Typography variant="body1" component="span">
                        {payslip.notes}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* Attendance Summary */}
          <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #e0e0e0' }}>
            <Typography variant="h6" component="h3" gutterBottom>
              Ringkasan Kehadiran
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Hari Kerja
                  </Typography>
                  <Typography variant="h6" component="div">
                    {payslip.workingDays || 0}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Hadir
                  </Typography>
                  <Typography variant="h6" component="div" color="success.main">
                    {payslip.presentDays || 0}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Terlambat
                  </Typography>
                  <Typography variant="h6" component="div" color="warning.main">
                    {payslip.lateDays || 0}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Tidak Hadir
                  </Typography>
                  <Typography variant="h6" component="div" color="error.main">
                    {payslip.absentDays || 0}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Salary Details */}
          <Grid container spacing={3}>
            {/* Earnings */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2, height: '100%', border: '1px solid #e0e0e0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AddCircleIcon sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="h6" component="h3">
                    Pendapatan
                  </Typography>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell>Gaji Pokok</TableCell>
                        <TableCell align="right">{formatCurrency(payslip.basicSalary)}</TableCell>
                      </TableRow>
                      {payslip.allowances && payslip.allowances.map((allowance, index) => (
                        <TableRow key={index}>
                          <TableCell>{allowance.name}</TableCell>
                          <TableCell align="right">{formatCurrency(allowance.amount)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell>Tunjangan Lainnya</TableCell>
                        <TableCell align="right">{formatCurrency(payslip.otherAllowances)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Bonus</TableCell>
                        <TableCell align="right">{formatCurrency(payslip.bonus)}</TableCell>
                      </TableRow>
                      <TableRow sx={{ '& td': { fontWeight: 'bold', borderTop: '1px solid rgba(224, 224, 224, 1)' } }}>
                        <TableCell>Total Pendapatan</TableCell>
                        <TableCell align="right">{formatCurrency(payslip.totalEarnings)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            {/* Deductions */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2, height: '100%', border: '1px solid #e0e0e0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <RemoveCircleIcon sx={{ mr: 1, color: 'error.main' }} />
                  <Typography variant="h6" component="h3">
                    Potongan
                  </Typography>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell>Potongan Keterlambatan</TableCell>
                        <TableCell align="right">{formatCurrency(payslip.lateDeduction)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Potongan Ketidakhadiran</TableCell>
                        <TableCell align="right">{formatCurrency(payslip.absentDeduction)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>BPJS Kesehatan</TableCell>
                        <TableCell align="right">{formatCurrency(payslip.bpjsKesehatan)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>BPJS Ketenagakerjaan</TableCell>
                        <TableCell align="right">{formatCurrency(payslip.bpjsKetenagakerjaan)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>PPh 21</TableCell>
                        <TableCell align="right">{formatCurrency(payslip.tax)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Potongan Lainnya</TableCell>
                        <TableCell align="right">{formatCurrency(payslip.otherDeductions)}</TableCell>
                      </TableRow>
                      <TableRow sx={{ '& td': { fontWeight: 'bold', borderTop: '1px solid rgba(224, 224, 224, 1)' } }}>
                        <TableCell>Total Potongan</TableCell>
                        <TableCell align="right">{formatCurrency(payslip.totalDeductions)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>

          {/* Net Salary */}
          <Paper elevation={0} sx={{ p: 2, mt: 3, mb: 3, bgcolor: '#f9f9f9', border: '1px solid #e0e0e0' }}>
            <Grid container alignItems="center">
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MonetizationOnIcon sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
                  <Typography variant="h6" component="h3">
                    Gaji Bersih
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h5" component="div" align="right" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(payslip.netSalary)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Footer */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Slip gaji ini dihasilkan secara otomatis oleh sistem dan tidak memerlukan tanda tangan.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Jika ada pertanyaan mengenai slip gaji ini, silakan hubungi departemen HRD.
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default PayslipDetail;