import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order, OrderItem, User } from '@/types';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

interface POData {
  orderNumber: string;
  orderDate: string;
  customer: {
    businessName?: string;
    businessNumber?: string;
    contactPerson?: string;
    email: string;
    phone?: string;
    logoUrl?: string;
  };
  items: {
    productCode: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  totalAmount: number;
  notes?: string;
}

export const generatePurchaseOrderPDF = async (data: POData): Promise<void> => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 20;

    // Colors
    const primaryColor: [number, number, number] = [234, 88, 12]; // Orange-600
    const darkColor: [number, number, number] = [31, 41, 55]; // Gray-800
    const lightColor: [number, number, number] = [107, 114, 128]; // Gray-500

    // Header background
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 45, 'F');

    // Company Logo/Name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('LASSA TYRES', margin, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Together in Every Mile', margin, 35);

    // Purchase Order Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PURCHASE ORDER', pageWidth - margin, 25, { align: 'right' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(data.orderNumber || 'N/A', pageWidth - margin, 35, { align: 'right' });

    yPos = 60;

    // Order Info Box
    doc.setFillColor(249, 250, 251); // Gray-50
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 25, 3, 3, 'F');
    
    doc.setTextColor(...darkColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Order Date:', margin + 5, yPos + 10);
    doc.text('Status:', margin + 80, yPos + 10);
    
    doc.setFont('helvetica', 'normal');
    doc.text(data.orderDate || 'N/A', margin + 5, yPos + 18);
    doc.text('Pending', margin + 80, yPos + 18);

    yPos += 35;

    // Customer Information
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(margin, yPos, (pageWidth - 2 * margin) / 2 - 5, 55, 3, 3, 'F');
    
    doc.setTextColor(...primaryColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO:', margin + 5, yPos + 12);
    
    doc.setTextColor(...darkColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(data.customer.businessName || 'N/A', margin + 5, yPos + 22);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...lightColor);
    const customerDetails = [
      data.customer.businessNumber ? `Business #: ${data.customer.businessNumber}` : '',
      data.customer.contactPerson ? `Contact: ${data.customer.contactPerson}` : '',
      `Email: ${data.customer.email || 'N/A'}`,
      data.customer.phone ? `Phone: ${data.customer.phone}` : '',
    ].filter(Boolean);
    
    customerDetails.forEach((detail, index) => {
      doc.text(detail, margin + 5, yPos + 30 + (index * 6));
    });

    // Supplier Information
    const supplierX = margin + (pageWidth - 2 * margin) / 2 + 5;
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(supplierX, yPos, (pageWidth - 2 * margin) / 2 - 5, 55, 3, 3, 'F');
    
    doc.setTextColor(...primaryColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('SUPPLIER:', supplierX + 5, yPos + 12);
    
    doc.setTextColor(...darkColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Lassa Tyres B2B', supplierX + 5, yPos + 22);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...lightColor);
    doc.text('Brisa Bridgestone Sabanci', supplierX + 5, yPos + 30);
    doc.text('Izmit, Kocaeli, Turkey', supplierX + 5, yPos + 36);
    doc.text('b2b@lassatires.com', supplierX + 5, yPos + 42);
    doc.text('+90 262 316 50 00', supplierX + 5, yPos + 48);

    yPos += 65;

    // Items Table
    const tableData = (data.items || []).map(item => [
      item.productCode || 'N/A',
      item.productName || 'N/A',
      String(item.quantity || 0),
      `$${Number(item.unitPrice || 0).toFixed(2)}`,
      `$${Number(item.totalPrice || 0).toFixed(2)}`
    ]);

    // Use autoTable
    autoTable(doc, {
      startY: yPos,
      head: [['Code', 'Product', 'Qty', 'Unit Price', 'Total']],
      body: tableData.length > 0 ? tableData : [['No items', '', '', '', '']],
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: darkColor,
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 30, halign: 'right' },
      },
    });

    // Get the final Y position after the table
    const finalY = doc.lastAutoTable?.finalY || yPos + 50;
    yPos = finalY + 10;

    // Totals Section
    const totalsX = pageWidth - margin - 80;
    
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(totalsX - 10, yPos, 90, 35, 3, 3, 'F');
    
    doc.setTextColor(...lightColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', totalsX, yPos + 12);
    doc.text('Shipping:', totalsX, yPos + 20);
    
    doc.setTextColor(...darkColor);
    doc.text(`$${Number(data.totalAmount || 0).toFixed(2)}`, totalsX + 70, yPos + 12, { align: 'right' });
    doc.text('TBD', totalsX + 70, yPos + 20, { align: 'right' });
    
    doc.setDrawColor(...primaryColor);
    doc.line(totalsX, yPos + 24, totalsX + 70, yPos + 24);
    
    doc.setTextColor(...primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', totalsX, yPos + 32);
    doc.text(`$${Number(data.totalAmount || 0).toFixed(2)}`, totalsX + 70, yPos + 32, { align: 'right' });

    // Notes Section (if any)
    if (data.notes) {
      yPos += 50;
      doc.setTextColor(...darkColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Notes:', margin, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...lightColor);
      
      const splitNotes = doc.splitTextToSize(data.notes, pageWidth - 2 * margin);
      doc.text(splitNotes, margin, yPos + 8);
    }

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 25;
    
    doc.setDrawColor(229, 231, 235); // Gray-200
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    
    doc.setTextColor(...lightColor);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('This is a purchase order document. Payment terms as per agreement.', margin, footerY);
    doc.text('Thank you for your business!', margin, footerY + 6);
    
    doc.setTextColor(...primaryColor);
    doc.text('www.lassatires.com', pageWidth - margin, footerY + 3, { align: 'right' });

    // Save the PDF
    doc.save(`PO-${data.orderNumber || 'unknown'}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};

// Helper function to generate PDF from order data
export const generatePDFFromOrder = async (
  order: Order & { items?: OrderItem[]; user?: User },
  user?: User
): Promise<void> => {
  // Get customer data from order.user or passed user
  const customerData = order.user || user;
  
  // Ensure items is an array
  const orderItems = Array.isArray(order.items) ? order.items : [];
  
  console.log('Generating PDF for order:', order.order_number);
  console.log('Order items:', orderItems);
  console.log('Customer data:', customerData);
  
  const poData: POData = {
    orderNumber: order.order_number,
    orderDate: new Date(order.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    customer: {
      businessName: customerData?.business_name || 'N/A',
      businessNumber: customerData?.business_number,
      contactPerson: customerData?.contact_person,
      email: customerData?.email || 'N/A',
      phone: customerData?.phone,
      logoUrl: customerData?.logo_url,
    },
    items: orderItems.map(item => ({
      productCode: item.product_code || 'N/A',
      productName: item.product_name || 'Unknown Product',
      quantity: item.quantity || 0,
      unitPrice: Number(item.unit_price) || 0,
      totalPrice: Number(item.total_price) || 0,
    })),
    totalAmount: Number(order.total_amount) || 0,
    notes: order.notes,
  };

  await generatePurchaseOrderPDF(poData);
};

// Generate PDF from cart data (for immediate download after order)
export const generatePDFFromCart = async (
  orderNumber: string,
  user: User,
  items: { product: any; quantity: number }[],
  totalAmount: number,
  notes?: string
): Promise<void> => {
  const poData: POData = {
    orderNumber,
    orderDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    customer: {
      businessName: user.business_name || 'N/A',
      businessNumber: user.business_number,
      contactPerson: user.contact_person,
      email: user.email,
      phone: user.phone,
      logoUrl: user.logo_url,
    },
    items: items.map(item => ({
      productCode: item.product.product_code || 'N/A',
      productName: item.product.name || 'Unknown Product',
      quantity: item.quantity,
      unitPrice: Number(item.product.price) || 0,
      totalPrice: Number(item.product.price) * item.quantity || 0,
    })),
    totalAmount: Number(totalAmount) || 0,
    notes,
  };

  await generatePurchaseOrderPDF(poData);
};
