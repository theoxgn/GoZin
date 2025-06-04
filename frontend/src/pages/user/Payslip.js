import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  useTheme,
  IconButton,
} from '@mui/material';
import {
  AttachMoney as AttachMoneyIcon,
  History as HistoryIcon,
  Receipt as ReceiptIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  CalendarMonth as CalendarMonthIcon,
} from '@mui/icons-material';

function Payslip() {
  const { user } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payrollHistory, setPayrollHistory] = useState([]);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [payslipLoading, setPayslipLoading] = useState(false);
  const [payslipError, setPayslipError] = useState('');
  const [payslipData, setPayslipData] = useState(null);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    // Generate years for filter (current year and 5 years back)
    const currentYear = new Date().getFullYear();
    const yearsList = [];
    for (let i = 0; i <= 5; i++) {
      yearsList.push(currentYear - i);
    }
    setYears(yearsList);
    
    fetchPayrollHistory(currentYear);
  }, []);

  const fetchPayrollHistory = async (year) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/payroll/history', {
        headers: { Authorization: `Bearer ${token}` },
        params: { year },
      });
      setPayrollHistory(response.data.payrolls || []);
      setError('');
    } catch (err) {
      console.error('Error fetching payroll history:', err);
      setError('Gagal memuat riwayat penggajian');
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (event) => {
    const year = event.target.value;
    setSelectedYear(year);
    fetchPayrollHistory(year);
  };

  const handleViewPayslip = async (payrollId) => {
    setPayslipLoading(true);
    setSelectedPayroll(payrollId);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/payroll/slip/${payrollId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayslipData(response.data);
      setPayslipError('');
    } catch (err) {
      console.error('Error fetching payslip:', err);
      setPayslipError('Gagal memuat slip gaji');
    } finally {
      setPayslipLoading(false);
    }
  };

  const handlePrintPayslip = () => {
    if (!payslipData) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Slip Gaji - ${payslipData.month} ${payslipData.year}</title>
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
            <div>${payslipData.month} ${payslipData.year}</div>
          </div>
          
          <div class="employee-info">
            <div class="info-row">
              <div class="info-label">Nama Karyawan:</div>
              <div class="info-value">${payslipData.user?.name || '-'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Departemen:</div>
              <div class="info-value">${payslipData.user?.department || '-'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Jabatan:</div>
              <div class="info-value">${payslipData.user?.position || '-'}</div>
            </div>
          </div>
          
          <table>
            <tr>
              <th colspan="2">RINCIAN PENDAPATAN</th>
            </tr>
            <tr>
              <td>Gaji Pokok</td>
              <td>Rp ${payslipData.basicSalary?.toLocaleString('id-ID') || 0}</td>
            </tr>
            <tr>
              <td>Tunjangan</td>
              <td>Rp ${payslipData.allowances?.toLocaleString('id-ID') || 0}</td>
            </tr>
            <tr>
              <td>Lembur</td>
              <td>Rp ${payslipData.overtime?.toLocaleString('id-ID') || 0}</td>
            </tr>
            <tr class="total-row">
              <td>Total Pendapatan</td>
              <td>Rp ${payslipData.totalEarnings?.toLocaleString('id-ID') || 0}</td>
            </tr>
          </table>
          
          <table>
            <tr>
              <th colspan="2">RINCIAN POTONGAN</th>
            </tr>
            <tr>
              <td>Potongan Absensi/Keterlambatan</td>
              <td>Rp ${payslipData.deductions?.toLocaleString('id-ID') || 0}</td>
            </tr>
            <tr>
              <td>BPJS Kesehatan</td>
              <td>Rp ${payslipData.bpjsKesehatan?.toLocaleString('id-ID') || 0}</td>
            </tr>
            <tr>
              <td>BPJS Ketenagakerjaan</td>
              <td>Rp ${payslipData.bpjsKetenagakerjaan?.toLocaleString('id-ID') || 0}</td>
            </tr>
            <tr>
              <td>PPh 21</td>
              <td>Rp ${payslipData.pph21?.toLocaleString('id-ID') || 0}</td>
            </tr>
            <tr class="total-row">
              <td>Total Potongan</td>
              <td>Rp ${payslipData.totalDeductions?.toLocaleString('id-ID') || 0}</td>
            </tr>
          </table>
          
          <table>
            <tr>
              <th>GAJI BERSIH</th>
              <th>Rp ${payslipData.netSalary?.toLocaleString('id-ID') || 0}</th>
            </tr>
          </table>
          
          <div class="footer">
            <p>Slip gaji ini dihasilkan secara otomatis oleh sistem.</p>
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
    }).format(amount || 0);
  };

  const formatMonthYear = (month, year) => {
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${monthNames[month - 1]} ${year}`;
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
      <Typography variant="h4" component="h1" gutterBottom>
        Slip Gaji
      </Typography>

      <Grid container spacing={3}>
        {/* Payroll History Card */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HistoryIcon sx={{ mr: 1 }} />
                <Typography variant="h6" component="h2">
                  Riwayat Penggajian
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="year-select-label">Tahun</InputLabel>
                  <Select
                    labelId="year-select-label"
                    value={selectedYear}
                    label="Tahun"
                    onChange={handleYearChange}
                  >
                    {years.map((year) => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert severity="error">{error}</Alert>
              ) : payrollHistory.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Tidak ada data penggajian untuk tahun {selectedYear}
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} sx={{ maxHeight: 440, overflow: 'auto' }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Periode</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Gaji Bersih</TableCell>
                        <TableCell align="center">Aksi</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {payrollHistory.map((payroll) => (
                        <TableRow 
                          key={payroll.id}
                          sx={{ 
                            '&:last-child td, &:last-child th': { border: 0 },
                            bgcolor: selectedPayroll === payroll.id ? 'action.selected' : 'inherit',
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CalendarMonthIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                              {formatMonthYear(payroll.month, payroll.year)}
                            </Box>
                          </TableCell>
                          <TableCell>{getStatusChip(payroll.status)}</TableCell>
                          <TableCell>{formatCurrency(payroll.netSalary)}</TableCell>
                          <TableCell align="center">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleViewPayslip(payroll.id)}
                              disabled={payslipLoading || payroll.status === 'draft'}
                            >
                              Lihat
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Payslip Detail Card */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ReceiptIcon sx={{ mr: 1 }} />
                  <Typography variant="h6" component="h2">
                    Detail Slip Gaji
                  </Typography>
                </Box>
                
                {payslipData && (
                  <IconButton color="primary" onClick={handlePrintPayslip} title="Cetak Slip Gaji">
                    <PrintIcon />
                  </IconButton>
                )}
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {payslipLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : payslipError ? (
                <Alert severity="error">{payslipError}</Alert>
              ) : !payslipData ? (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <ReceiptIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" gutterBottom>
                    Pilih periode penggajian untuk melihat slip gaji
                  </Typography>
                </Box>
              ) : (
                <>
                  <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {formatMonthYear(payslipData.month, payslipData.year)}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Nama: {payslipData.user?.name || '-'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Departemen: {payslipData.user?.department || '-'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Jabatan: {payslipData.user?.position || '-'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Status: {getStatusChip(payslipData.status)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                  
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                    Pendapatan
                  </Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>Gaji Pokok</TableCell>
                          <TableCell align="right">{formatCurrency(payslipData.basicSalary)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Tunjangan</TableCell>
                          <TableCell align="right">{formatCurrency(payslipData.allowances)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Lembur</TableCell>
                          <TableCell align="right">{formatCurrency(payslipData.overtime)}</TableCell>
                        </TableRow>
                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>Total Pendapatan</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            {formatCurrency(payslipData.totalEarnings)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                    Potongan
                  </Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>Potongan Absensi/Keterlambatan</TableCell>
                          <TableCell align="right">{formatCurrency(payslipData.deductions)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>BPJS Kesehatan</TableCell>
                          <TableCell align="right">{formatCurrency(payslipData.bpjsKesehatan)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>BPJS Ketenagakerjaan</TableCell>
                          <TableCell align="right">{formatCurrency(payslipData.bpjsKetenagakerjaan)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>PPh 21</TableCell>
                          <TableCell align="right">{formatCurrency(payslipData.pph21)}</TableCell>
                        </TableRow>
                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>Total Potongan</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            {formatCurrency(payslipData.totalDeductions)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  <Paper 
                    sx={{ 
                      p: 2, 
                      bgcolor: theme.palette.success.light, 
                      color: theme.palette.success.contrastText,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Gaji Bersih
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {formatCurrency(payslipData.netSalary)}
                    </Typography>
                  </Paper>
                  
                  {payslipData.notes && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Catatan:</strong> {payslipData.notes}
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Payslip;