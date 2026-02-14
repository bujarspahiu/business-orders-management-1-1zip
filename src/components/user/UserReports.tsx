import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, ChevronLeft, ChevronRight, Download, FileText, Package, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import { db } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { savePDFMobile } from '@/lib/generatePDF';

declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface ReportData {
  orders: any[];
  summary: {
    totalOrders: number;
    totalItems: number;
    totalRevenue: number;
    periodStart: string;
    periodEnd: string;
  };
}

const UserReports: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [period, setPeriod] = useState<Period>('monthly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [period, currentDate]);

  const fetchReport = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await db.getReports({
        userId: user.id,
        period,
        date: currentDate.toISOString(),
      });
      if (error) throw new Error(error);
      setReportData(data as ReportData);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigatePeriod = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    switch (period) {
      case 'daily':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'weekly':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'monthly':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'yearly':
        newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
        break;
    }
    setCurrentDate(newDate);
  };

  const getPeriodLabel = () => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    switch (period) {
      case 'daily':
        return currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      case 'weekly': {
        const day = currentDate.getDay();
        const mondayOffset = day === 0 ? -6 : 1 - day;
        const monday = new Date(currentDate);
        monday.setDate(currentDate.getDate() + mondayOffset);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        return `${shortMonths[monday.getMonth()]} ${monday.getDate()} - ${shortMonths[sunday.getMonth()]} ${sunday.getDate()}, ${sunday.getFullYear()}`;
      }
      case 'monthly':
        return `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
      case 'yearly':
        return `${currentDate.getFullYear()}`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'confirmed': case 'processing': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return t.orderManagement.statusPending;
      case 'confirmed': return t.orderManagement.statusConfirmed;
      case 'processing': return t.orderManagement.statusProcessing;
      case 'shipped': return t.orderManagement.statusShipped;
      case 'delivered': return t.orderManagement.statusDelivered;
      case 'cancelled': return t.orderManagement.statusCancelled;
      default: return status;
    }
  };

  const avgOrderValue = reportData && reportData.summary.totalOrders > 0
    ? reportData.summary.totalRevenue / reportData.summary.totalOrders
    : 0;

  const downloadPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const primaryColor: [number, number, number] = [234, 88, 12];
    const darkColor: [number, number, number] = [31, 41, 55];
    const lightColor: [number, number, number] = [107, 114, 128];

    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 45, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('LASSA TYRES', margin, 25);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Together in Every Mile', margin, 35);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(t.reports.purchaseReports.toUpperCase(), pageWidth - margin, 25, { align: 'right' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(getPeriodLabel(), pageWidth - margin, 35, { align: 'right' });

    let yPos = 60;

    doc.setFillColor(249, 250, 251);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 30, 3, 3, 'F');

    doc.setTextColor(...darkColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    const colWidth = (pageWidth - 2 * margin) / 4;
    doc.text(t.reports.totalOrders, margin + 5, yPos + 12);
    doc.text(t.reports.totalItems, margin + colWidth + 5, yPos + 12);
    doc.text(t.reports.totalRevenue, margin + colWidth * 2 + 5, yPos + 12);
    doc.text(t.reports.avgOrderValue, margin + colWidth * 3 + 5, yPos + 12);

    doc.setFont('helvetica', 'normal');
    doc.text(String(reportData.summary.totalOrders), margin + 5, yPos + 22);
    doc.text(String(reportData.summary.totalItems), margin + colWidth + 5, yPos + 22);
    doc.text(`€${reportData.summary.totalRevenue.toFixed(2)}`, margin + colWidth * 2 + 5, yPos + 22);
    doc.text(`€${avgOrderValue.toFixed(2)}`, margin + colWidth * 3 + 5, yPos + 22);

    yPos += 40;

    const tableData = reportData.orders.map(order => [
      order.order_number || 'N/A',
      new Date(order.created_at).toLocaleDateString(),
      String(order.items?.length || 0),
      `€${Number(order.total_amount).toFixed(2)}`,
      getStatusLabel(order.status),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [[t.reports.orderNumber, t.reports.date, t.reports.items, t.reports.total, t.reports.status]],
      body: tableData.length > 0 ? tableData : [['No data', '', '', '', '']],
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: darkColor,
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
    });

    const footerY = doc.internal.pageSize.getHeight() - 25;
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    doc.setTextColor(...lightColor);
    doc.setFontSize(8);
    doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, margin, footerY);
    doc.setTextColor(...primaryColor);
    doc.text('www.lassatires.com', pageWidth - margin, footerY, { align: 'right' });

    savePDFMobile(doc, `Purchase-Report-${getPeriodLabel().replace(/[^a-zA-Z0-9]/g, '-')}.pdf`);
  };

  const periods: { key: Period; label: string }[] = [
    { key: 'daily', label: t.reports.daily },
    { key: 'weekly', label: t.reports.weekly },
    { key: 'monthly', label: t.reports.monthly },
    { key: 'yearly', label: t.reports.yearly },
  ];

  const statCards = [
    { label: t.reports.totalOrders, value: reportData?.summary.totalOrders || 0, icon: ShoppingCart, color: 'bg-blue-500' },
    { label: t.reports.totalItems, value: reportData?.summary.totalItems || 0, icon: Package, color: 'bg-green-500' },
    { label: t.reports.totalRevenue, value: `€${(reportData?.summary.totalRevenue || 0).toFixed(2)}`, icon: DollarSign, color: 'bg-purple-500' },
    { label: t.reports.avgOrderValue, value: `€${avgOrderValue.toFixed(2)}`, icon: TrendingUp, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{t.reports.purchaseReports}</h2>
        </div>
        <button
          onClick={downloadPDF}
          disabled={!reportData || reportData.orders.length === 0}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          <span>{t.reports.downloadReport}</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {periods.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  period === p.key
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigatePeriod('prev')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2 min-w-[180px] justify-center">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">{getPeriodLabel()}</span>
            </div>
            <button
              onClick={() => navigatePeriod('next')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-600 border-t-transparent"></div>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {reportData && reportData.orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t.reports.orderNumber}</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t.reports.date}</th>
                      <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t.reports.items}</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t.reports.total}</th>
                      <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t.reports.status}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reportData.orders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-mono font-medium text-gray-900">{order.order_number}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 text-center">{order.items?.length || 0}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">€{Number(order.total_amount).toFixed(2)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">{t.reports.noData}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default UserReports;
