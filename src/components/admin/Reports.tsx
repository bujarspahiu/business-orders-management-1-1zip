import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  ShoppingCart, 
  Package, 
  DollarSign,
  Loader2,
  FileText
} from 'lucide-react';
import { db } from '@/lib/db';
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

declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface ReportsProps {
  userId?: string;
}

interface ReportData {
  orders: any[];
  summary: {
    totalOrders: number;
    totalItems: number;
    totalRevenue: number;
  };
}

const Reports: React.FC<ReportsProps> = ({ userId }) => {
  const { t } = useLanguage();
  const [period, setPeriod] = useState<Period>('monthly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const fn = direction === 'prev' 
        ? { daily: subDays, weekly: subWeeks, monthly: subMonths, yearly: subYears }
        : { daily: addDays, weekly: addWeeks, monthly: addMonths, yearly: addYears };
      return fn[period](prev, 1);
    });
  };

  const getPeriodLabel = () => {
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

  useEffect(() => {
    fetchReport();
  }, [period, currentDate, userId]);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const { start, end } = getDateRange(currentDate, period);
      const { data, error } = await db.getReports(
        userId,
        start.toISOString(),
        end.toISOString()
      ) as { data: ReportData | null; error: string | null };

      if (error) throw new Error(error);
      setReportData(data);
    } catch (error) {
      console.error('Error fetching report:', error);
      setReportData({ orders: [], summary: { totalOrders: 0, totalItems: 0, totalRevenue: 0 } });
    } finally {
      setIsLoading(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'confirmed':
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const exportPDF = async () => {
    if (!reportData) return;
    setIsExporting(true);
    try {
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
      const reportTitle = userId ? t.reports.purchaseReport : t.reports.salesReport;
      doc.text(reportTitle.toUpperCase(), pageWidth - margin, 25, { align: 'right' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(getPeriodLabel(), pageWidth - margin, 35, { align: 'right' });

      let yPos = 60;

      doc.setFillColor(249, 250, 251);
      doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 30, 3, 3, 'F');

      const colWidth = (pageWidth - 2 * margin) / 3;
      
      doc.setTextColor(...lightColor);
      doc.setFontSize(9);
      doc.text(t.reports.totalOrders, margin + 10, yPos + 12);
      doc.text(t.reports.totalItems, margin + colWidth + 10, yPos + 12);
      doc.text(t.reports.totalRevenue, margin + colWidth * 2 + 10, yPos + 12);
      
      doc.setTextColor(...darkColor);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(String(reportData.summary.totalOrders), margin + 10, yPos + 24);
      doc.text(String(reportData.summary.totalItems), margin + colWidth + 10, yPos + 24);
      doc.text(`€${reportData.summary.totalRevenue.toFixed(2)}`, margin + colWidth * 2 + 10, yPos + 24);

      yPos += 40;

      const tableData = reportData.orders.map(order => [
        order.order_number || 'N/A',
        new Date(order.created_at).toLocaleDateString('sq-AL'),
        order.user?.business_name || 'N/A',
        String(order.items?.length || 0),
        `€${Number(order.total_amount || 0).toFixed(2)}`,
        getStatusLabel(order.status)
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [[t.reports.orderNumber, t.reports.date, t.reports.customer, t.reports.items, t.reports.amount, t.reports.status]],
        body: tableData.length > 0 ? tableData : [[t.reports.noData, '', '', '', '', '']],
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

      const finalY = doc.lastAutoTable?.finalY || yPos + 50;
      
      doc.setTextColor(...lightColor);
      doc.setFontSize(8);
      doc.text(`${t.reports.generatedOn}: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, margin, finalY + 15);

      const periodSlug = getPeriodLabel().replace(/\s+/g, '-');
      const typeSlug = userId ? 'purchases' : 'sales';
      doc.save(`Report-${typeSlug}-${periodSlug}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const periodButtons: { key: Period; label: string }[] = [
    { key: 'daily', label: t.reports.daily },
    { key: 'weekly', label: t.reports.weekly },
    { key: 'monthly', label: t.reports.monthly },
    { key: 'yearly', label: t.reports.yearly },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {userId ? t.reports.purchaseReport : t.reports.salesReport}
          </h2>
          <p className="text-sm text-gray-500 mt-1">{t.reports.description}</p>
        </div>
        <button
          onClick={exportPDF}
          disabled={isExporting || !reportData || reportData.orders.length === 0}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>{t.reports.exportPDF}</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {periodButtons.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setPeriod(key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  period === key
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-2 min-w-[200px] justify-center">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">{getPeriodLabel()}</span>
            </div>
            <button
              onClick={() => navigateDate('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-600 border-t-transparent"></div>
        </div>
      ) : reportData ? (
        <>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-purple-500">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{reportData.summary.totalOrders}</p>
              <p className="text-sm text-gray-500">{t.reports.totalOrders}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-blue-500">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{reportData.summary.totalItems}</p>
              <p className="text-sm text-gray-500">{t.reports.totalItems}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-orange-500">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">€{reportData.summary.totalRevenue.toFixed(2)}</p>
              <p className="text-sm text-gray-500">{t.reports.totalRevenue}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t.reports.orderNumber}</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t.reports.date}</th>
                    {!userId && <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t.reports.customer}</th>}
                    <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t.reports.items}</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t.reports.amount}</th>
                    <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t.reports.status}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData.orders.length === 0 ? (
                    <tr>
                      <td colSpan={userId ? 5 : 6} className="px-6 py-12 text-center">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">{t.reports.noData}</p>
                      </td>
                    </tr>
                  ) : (
                    reportData.orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-mono font-medium text-gray-900">{order.order_number}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('sq-AL', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        {!userId && (
                          <td className="px-6 py-4 text-sm text-gray-900">{order.user?.business_name || '-'}</td>
                        )}
                        <td className="px-6 py-4 text-sm text-gray-500 text-center">{order.items?.length || 0}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">€{Number(order.total_amount || 0).toFixed(2)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Reports;
