import React, { useState } from 'react';
import { BarChart3, Calendar, ChevronLeft, ChevronRight, Download, Package, DollarSign, ShoppingCart, TrendingUp, Loader2 } from 'lucide-react';
import { db } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  startOfDay, endOfDay,
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  startOfYear, endOfYear,
  addDays, addWeeks, addMonths, addYears,
  subDays, subWeeks, subMonths, subYears,
  format
} from 'date-fns';
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

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

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
  const [reportGenerated, setReportGenerated] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [customEndDate, setCustomEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  const getDateRange = (date: Date, p: Period): { start: Date; end: Date } => {
    switch (p) {
      case 'daily':
        return { start: startOfDay(date), end: endOfDay(date) };
      case 'weekly':
        return { start: startOfWeek(date, { weekStartsOn: 1 }), end: endOfWeek(date, { weekStartsOn: 1 }) };
      case 'monthly':
        return { start: startOfMonth(date), end: endOfMonth(date) };
      case 'yearly':
        return { start: startOfYear(date), end: endOfYear(date) };
      case 'custom':
        return {
          start: startOfDay(new Date(customStartDate)),
          end: endOfDay(new Date(customEndDate))
        };
    }
  };

  const navigatePeriod = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const fn = direction === 'prev'
        ? { daily: subDays, weekly: subWeeks, monthly: subMonths, yearly: subYears }
        : { daily: addDays, weekly: addWeeks, monthly: addMonths, yearly: addYears };
      return fn[period as Exclude<Period, 'custom'>](prev, 1);
    });
  };

  const getPeriodLabel = () => {
    if (period === 'custom') {
      return `${format(new Date(customStartDate), 'dd MMM yyyy')} - ${format(new Date(customEndDate), 'dd MMM yyyy')}`;
    }
    const { start, end } = getDateRange(currentDate, period);
    switch (period) {
      case 'daily':
        return format(start, 'dd MMMM yyyy');
      case 'weekly':
        return `${format(start, 'dd MMM')} - ${format(end, 'dd MMM yyyy')}`;
      case 'monthly':
        return format(start, 'MMMM yyyy');
      case 'yearly':
        return format(start, 'yyyy');
    }
  };

  const fetchReport = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { start, end } = getDateRange(currentDate, period);
      const { data, error } = await db.getReports(
        user.id,
        start.toISOString(),
        end.toISOString()
      ) as { data: ReportData | null; error: string | null };

      if (error) throw new Error(error);
      setReportData(data);
      setReportGenerated(true);
    } catch (error) {
      console.error('Error fetching report:', error);
      setReportData({ orders: [], summary: { totalOrders: 0, totalItems: 0, totalRevenue: 0, periodStart: '', periodEnd: '' } });
      setReportGenerated(true);
    } finally {
      setIsLoading(false);
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
    { key: 'custom', label: t.reports.custom || 'Custom' },
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
        {reportGenerated && reportData && reportData.orders.length > 0 && (
          <button
            onClick={downloadPDF}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            <span>{t.reports.downloadReport}</span>
          </button>
        )}
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

          {period === 'custom' ? (
            <div className="flex items-center space-x-3">
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">{t.reports.startDate || 'Start Date'}</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">{t.reports.endDate || 'End Date'}</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          ) : (
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
          )}
        </div>

        <div className="mt-4 flex justify-center">
          <button
            onClick={fetchReport}
            disabled={isLoading}
            className="flex items-center space-x-2 px-6 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <BarChart3 className="w-4 h-4" />
            )}
            <span>{t.reports.generateReport || 'Generate Report'}</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-600 border-t-transparent"></div>
        </div>
      ) : reportGenerated && reportData ? (
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
            {reportData.orders.length > 0 ? (
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
      ) : !reportGenerated ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{t.reports.selectPeriod || 'Select a period and generate a report'}</p>
        </div>
      ) : null}
    </div>
  );
};

export default UserReports;
