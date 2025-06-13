import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  Typography,
  Alert,
  Stack,
  useTheme,
  IconButton,
} from '@mui/material';
import {
  Print as PrintIcon,
  Download as DownloadIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

function PayslipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payslipData, setPayslipData] = useState(null);

  useEffect(() => {
    fetchPayslipData();
  }, [id]);

  const fetchPayslipData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/payroll/slip/${id}`);
      setPayslipData(response.data.payslip);
      setError('');
    } catch (err) {
      console.error('Error fetching payslip:', err);
      setError('Gagal memuat slip gaji');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintPayslip = () => {
    if (!payslipData) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Slip Gaji - ${payslipData.month}/${payslipData.year}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .company-name { font-size: 20px; font-weight: bold; }
            .payslip-title { font-size: 18px; margin: 10px 0; }
            .employee-info { margin-bottom: 20px; }
            .info-row { display: flex; margin-bottom: 5px; }
            .info-label { width: 150px; font-weight: bold; }
            .info-value { flex: 1; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total-row { font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">PT. Nama Perusahaan</div>
            <div class="payslip-title">SLIP GAJI KARYAWAN</div>
            <div>${payslipData.month}/${payslipData.year}</div>
          </div>
          
          <div class="employee-info">
            <div class="info-row">
              <div class="info-label">Nama Karyawan:</div>
              <div class="info-value">${payslipData.employeeName}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Departemen:</div>
              <div class="info-value">${payslipData.department}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Jabatan:</div>
              <div class="info-value">${payslipData.position}</div>
            </div>
          </div>
          
          <table>
            <tr>
              <th colspan="2">RINCIAN PENDAPATAN</th>
            </tr>
            <tr>
              <td>Gaji Pokok</td>
              <td>Rp ${parseFloat(payslipData.earnings.basicSalary).toLocaleString('id-ID')}</td>
            </tr>
            <tr>
              <td>Tunjangan</td>
              <td>Rp ${parseFloat(payslipData.earnings.allowances).toLocaleString('id-ID')}</td>
            </tr>
            <tr>
              <td>Lembur</td>
              <td>Rp ${parseFloat(payslipData.earnings.overtime).toLocaleString('id-ID')}</td>
            </tr>
            <tr class="total-row">
              <td>Total Pendapatan</td>
              <td>Rp ${parseFloat(payslipData.earnings.totalEarnings).toLocaleString('id-ID')}</td>
            </tr>
          </table>
          
          <table>
            <tr>
              <th colspan="2">RINCIAN POTONGAN</th>
            </tr>
            <tr>
              <td>Potongan Absensi/Keterlambatan</td>
              <td>Rp ${parseFloat(payslipData.deductions.lateAndAbsent).toLocaleString('id-ID')}</td>
            </tr>
            <tr>
              <td>BPJS Kesehatan</td>
              <td>Rp ${parseFloat(payslipData.deductions.bpjsKesehatan).toLocaleString('id-ID')}</td>
            </tr>
            <tr>
              <td>BPJS Ketenagakerjaan</td>
              <td>Rp ${parseFloat(payslipData.deductions.bpjsKetenagakerjaan).toLocaleString('id-ID')}</td>
            </tr>
            <tr>
              <td>PPh 21</td>
              <td>Rp ${parseFloat(payslipData.deductions.pph21).toLocaleString('id-ID')}</td>
            </tr>
            <tr class="total-row">
              <td>Total Potongan</td>
              <td>Rp ${parseFloat(payslipData.deductions.totalDeductions).toLocaleString('id-ID')}</td>
            </tr>
          </table>
          
          <table>
            <tr>
              <th>GAJI BERSIH</th>
              <th>Rp ${parseFloat(payslipData.netSalary).toLocaleString('id-ID')}</th>
            </tr>
          </table>
          
          <div class="footer">
            <p>Slip gaji ini dihasilkan secara otomatis oleh sistem.</p>
            ${payslipData.notes ? `<p>Catatan: ${payslipData.notes}</p>` : ''}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(parseFloat(amount) || 0);
  };

  const formatMonthYear = (month, year) => {
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${monthNames[month - 1]} ${year}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!payslipData) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">Data slip gaji tidak ditemukan</Alert>
      </Container>
    );
    }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Kembali
        </Button>
        <Stack direction="row" spacing={1}>
        <Button
            variant="outlined"
          startIcon={<PrintIcon />}
            onClick={handlePrintPayslip}
        >
            Cetak
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handlePrintPayslip}
          >
            Download PDF
        </Button>
        </Stack>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            PT. Nama Perusahaan
          </Typography>
          <Typography variant="h6" gutterBottom>
              SLIP GAJI KARYAWAN
            </Typography>
          <Typography variant="subtitle1">
            {formatMonthYear(payslipData.month, payslipData.year)}
            </Typography>
          </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
              Informasi Karyawan
            </Typography>
            <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Nama Karyawan
                    </Typography>
                    <Typography variant="body1">
                      {payslipData.employeeName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Departemen
                    </Typography>
                    <Typography variant="body1">
                      {payslipData.department}
                    </Typography>
              </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Jabatan
                    </Typography>
                    <Typography variant="body1">
                      {payslipData.position}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Rincian Pendapatan
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Gaji Pokok</Typography>
                    <Typography>{formatCurrency(payslipData.earnings.basicSalary)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Tunjangan</Typography>
                    <Typography>{formatCurrency(payslipData.earnings.allowances)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Lembur</Typography>
                    <Typography>{formatCurrency(payslipData.earnings.overtime)}</Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography fontWeight="bold">Total Pendapatan</Typography>
                    <Typography fontWeight="bold">{formatCurrency(payslipData.earnings.totalEarnings)}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
            </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Rincian Potongan
              </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Potongan Absensi/Keterlambatan</Typography>
                    <Typography>{formatCurrency(payslipData.deductions.lateAndAbsent)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>BPJS Kesehatan</Typography>
                    <Typography>{formatCurrency(payslipData.deductions.bpjsKesehatan)}</Typography>
              </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>BPJS Ketenagakerjaan</Typography>
                    <Typography>{formatCurrency(payslipData.deductions.bpjsKetenagakerjaan)}</Typography>
            </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>PPh 21</Typography>
                    <Typography>{formatCurrency(payslipData.deductions.pph21)}</Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography fontWeight="bold">Total Potongan</Typography>
                    <Typography fontWeight="bold">{formatCurrency(payslipData.deductions.totalDeductions)}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
            </Grid>

          <Grid item xs={12}>
            <Card variant="outlined" sx={{ bgcolor: theme.palette.primary.light }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" color="primary">
                    Gaji Bersih
                  </Typography>
                  <Typography variant="h5" color="primary" fontWeight="bold">
                    {formatCurrency(payslipData.netSalary)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
            </Grid>

          {payslipData.notes && (
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Catatan
                  </Typography>
                  <Typography variant="body2">
                    {payslipData.notes}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
            </Grid>
          </Paper>
    </Container>
  );
}

export default PayslipDetail;