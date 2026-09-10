import React, { useRef } from 'react';
import { Booking } from '../types';
import {
  FiPrinter,
  FiDownload,
  FiX,
  FiCheckCircle,
  FiShield,
  FiHeart,
  FiFileText,
  FiUser,
  FiMapPin,
  FiPhone,
  FiCalendar,
} from 'react-icons/fi';

interface DigitalInvoiceModalProps {
  booking: Booking;
  onClose: () => void;
}

const DigitalInvoiceModal: React.FC<DigitalInvoiceModalProps> = ({ booking, onClose }) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const invoiceNumber =
    booking.invoice?.invoiceNumber ||
    `SAH-${new Date(booking.scheduledDate || Date.now()).getFullYear()}-${booking.id.slice(0, 6).toUpperCase()}`;

  const serviceDate = new Date(booking.scheduledDate || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const paymentDate = booking.payment?.paidAt
    ? new Date(booking.payment.paidAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : `${serviceDate}, 10:30 AM`;

  const workerName = booking.worker?.user
    ? `${booking.worker.user.firstName} ${booking.worker.user.lastName}`
    : 'Santosh Pawar';

  const customerName = booking.customer?.user
    ? `${booking.customer.user.firstName} ${booking.customer.user.lastName}`
    : 'Anita Deshmukh';

  const customerPhone = booking.customer?.user?.phone || '+91 9100000002';
  const customerAddress = booking.addressText || '45, MG Road, Shivaji Nagar, Pune 411005';
  const coOpName = booking.worker?.cooperative?.name || 'Pune Labour Cooperative Society';

  const txnId = booking.payment?.transactionId || `TXN-COGIG-${booking.id.slice(0, 8).toUpperCase()}`;

  // Print Invoice Dialog
  const handlePrint = () => {
    window.print();
  };

  // Download Self-Contained HTML Receipt
  const handleDownload = () => {
    const invoiceHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice - ${invoiceNumber} - CoGig</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb; color: #111827; padding: 30px; }
    .invoice-box { max-width: 780px; margin: auto; background: #fff; padding: 40px; border-radius: 16px; border: 1px solid #e5e7eb; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #1B6B3A; padding-bottom: 20px; margin-bottom: 24px; }
    .logo { font-size: 26px; font-weight: 900; color: #1B6B3A; }
    .paid-badge { display: inline-block; background: #E8F5E9; color: #1B6B3A; border: 2px solid #1B6B3A; font-weight: 800; padding: 4px 14px; border-radius: 8px; font-size: 13px; text-transform: uppercase; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
    .table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
    .table th { background: #f3f4f6; text-align: left; padding: 10px; border-bottom: 2px solid #e5e7eb; font-size: 11px; text-transform: uppercase; }
    .table td { padding: 12px 10px; border-bottom: 1px solid #e5e7eb; }
    .totals { margin-left: auto; width: 320px; font-size: 13px; }
    .totals-row { display: flex; justify-content: space-between; padding: 6px 0; }
    .grand-total { border-top: 2px solid #111827; font-size: 16px; font-weight: 900; color: #1B6B3A; padding-top: 10px; }
    .footer { margin-top: 30px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280; text-align: center; }
  </style>
</head>
<body>
  <div class="invoice-box">
    <div class="header">
      <div>
        <div class="logo">CoGig / Sahyog</div>
        <div style="font-size: 12px; color: #4b5563;">Cooperative Federation of Household & Urban Labour Societies</div>
        <div style="font-size: 11px; color: #6b7280;">Reg. No: COOP/MAH/2024/782 &bull; GST Exempt</div>
      </div>
      <div style="text-align: right;">
        <div class="paid-badge">&#10003; PAID & SETTLED</div>
        <div style="font-size: 12px; font-weight: bold; margin-top: 6px;">Invoice: ${invoiceNumber}</div>
        <div style="font-size: 11px; color: #6b7280;">Date: ${serviceDate}</div>
      </div>
    </div>

    <div class="grid">
      <div>
        <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #6b7280;">Billed To (Customer):</div>
        <div style="font-weight: bold; font-size: 14px; margin-top: 4px;">${customerName}</div>
        <div style="font-size: 12px; color: #4b5563;">${customerAddress}</div>
        <div style="font-size: 12px; color: #4b5563;">Phone: ${customerPhone}</div>
      </div>
      <div>
        <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #6b7280;">Cooperative Service Provider:</div>
        <div style="font-weight: bold; font-size: 14px; margin-top: 4px;">${workerName}</div>
        <div style="font-size: 12px; color: #4b5563;">${coOpName}</div>
        <div style="font-size: 12px; color: #4b5563;">Transaction Ref: ${txnId}</div>
      </div>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Service Item</th>
          <th>Schedule</th>
          <th style="text-align: right;">Worker Share (80%)</th>
          <th style="text-align: right;">Welfare Pool (10%)</th>
          <th style="text-align: right;">Tech Fee (10%)</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${booking.service?.name || 'Household Service'}</strong>
            <div style="font-size: 11px; color: #6b7280;">${booking.description || 'Standard verified cooperative job'}</div>
          </td>
          <td>${booking.scheduledTime || '10:00 AM'}</td>
          <td style="text-align: right; color: #047857; font-weight: bold;">&#8377;${booking.workerEarning}</td>
          <td style="text-align: right; color: #c2410c;">&#8377;${booking.cooperativeShare}</td>
          <td style="text-align: right; color: #1d4ed8;">&#8377;${booking.platformFee}</td>
          <td style="text-align: right; font-weight: bold;">&#8377;${booking.serviceCharge}</td>
        </tr>
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-row">
        <span>Base Service Charge:</span>
        <span>&#8377;${booking.serviceCharge}</span>
      </div>
      <div class="totals-row">
        <span>Platform & Mediation Fee:</span>
        <span>&#8377;${booking.platformFee}</span>
      </div>
      <div class="totals-row">
        <span>Taxes (GST):</span>
        <span>&#8377;0.00</span>
      </div>
      <div class="totals-row grand-total">
        <span>Total Paid via UPI:</span>
        <span>&#8377;${booking.totalAmount}</span>
      </div>
    </div>

    <div class="footer">
      <div>Thank you for supporting 100% worker-owned cooperatives. 80% of this fee went directly to ${workerName}.</div>
      <div style="margin-top: 4px;">Digitally signed & verified by CoGig Cooperative Federation &bull; Helpdesk: support@cogig.coop</div>
    </div>
  </div>
</body>
</html>
    `;

    const blob = new Blob([invoiceHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice-${invoiceNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-gray-200 overflow-hidden my-6 print:shadow-none print:border-none print:max-w-none print:m-0">
        {/* Top Modal Controls (Hidden in Print) */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-100 text-[#1B6B3A] rounded-lg">
              <FiFileText className="text-base" />
            </span>
            <span className="text-xs font-black text-gray-900 uppercase tracking-wider">
              Official Cooperative Tax Invoice & Receipt
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-[#1B6B3A] hover:bg-[#145A2F] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
            >
              <FiDownload /> Download HTML
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <FiPrinter /> Print / PDF
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center cursor-pointer transition-colors"
            >
              <FiX />
            </button>
          </div>
        </div>

        {/* ─── INVOICE DOCUMENT BODY (PRINTABLE) ─────────────────────────────── */}
        <div ref={invoiceRef} className="p-6 sm:p-8 space-y-6 text-gray-900 bg-white">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-[#1B6B3A] pb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1B6B3A] to-[#2A8F4F] text-white flex items-center justify-center font-black text-lg shadow-xs">
                  C
                </div>
                <h2 className="text-2xl font-black text-[#1B6B3A] tracking-tight">CoGig / Sahyog</h2>
              </div>
              <p className="text-[11px] text-gray-600 font-semibold mt-1">
                Cooperative Federation of Household & Urban Labour Societies
              </p>
              <p className="text-[10px] text-gray-400">
                Reg No: COOP/MAH/2024/782 &bull; Maharashtra Cooperative Act
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100/80 border-2 border-[#1B6B3A] text-[#1B6B3A] text-xs font-black rounded-lg uppercase tracking-wider">
                <FiCheckCircle /> PAID & SETTLED
              </div>
              <div className="text-xs font-black text-gray-900 mt-1">
                Invoice No: <span className="font-mono text-emerald-800">{invoiceNumber}</span>
              </div>
              <div className="text-[11px] text-gray-500">
                Service Date: <span className="font-bold text-gray-700">{serviceDate}</span>
              </div>
              <div className="text-[10px] text-gray-400 font-mono">
                Txn Ref: {txnId}
              </div>
            </div>
          </div>

          {/* Billed To & Service Provider Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50/80 rounded-2xl border border-gray-200 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                Billed To (Customer):
              </span>
              <h4 className="font-black text-sm text-gray-900">{customerName}</h4>
              <p className="text-gray-600 flex items-start gap-1">
                <FiMapPin className="text-emerald-700 shrink-0 mt-0.5" />
                <span>{customerAddress}</span>
              </p>
              <p className="text-gray-600 flex items-center gap-1">
                <FiPhone className="text-emerald-700 shrink-0" />
                <span>{customerPhone}</span>
              </p>
            </div>

            <div className="space-y-1 sm:border-l sm:border-gray-200 sm:pl-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                Cooperative Certified Professional:
              </span>
              <h4 className="font-black text-sm text-gray-900 flex items-center gap-1">
                <span>{workerName}</span>
                <FiShield className="text-emerald-600 text-xs" />
              </h4>
              <p className="text-emerald-800 font-semibold">{coOpName}</p>
              <p className="text-gray-500 text-[11px]">
                Paid via Instant UPI &bull; 80% Direct Worker Remittance
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50 text-[10px] uppercase font-black text-gray-500">
                  <th className="py-2.5 px-3">Service Description</th>
                  <th className="py-2.5 px-3">Schedule</th>
                  <th className="py-2.5 px-3 text-right">Worker Share (80%)</th>
                  <th className="py-2.5 px-3 text-right">Welfare Pool (10%)</th>
                  <th className="py-2.5 px-3 text-right">Tech (10%)</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-3 px-3">
                    <div className="font-black text-gray-900">{booking.service?.name || 'Home Service'}</div>
                    <div className="text-[10px] text-gray-500">{booking.description || 'Standard verified cooperative service'}</div>
                  </td>
                  <td className="py-3 px-3 text-gray-600 font-medium">
                    {booking.scheduledTime || '10:00 AM'}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-700">
                    ₹{booking.workerEarning}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-[#E8722A]">
                    ₹{booking.cooperativeShare}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-blue-700">
                    ₹{booking.platformFee}
                  </td>
                  <td className="py-3 px-3 text-right font-black text-gray-900">
                    ₹{booking.serviceCharge}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown & Totals */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-2">
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 text-[11px] text-emerald-900 max-w-xs space-y-1">
              <div className="flex items-center gap-1 font-bold text-emerald-800">
                <FiHeart className="text-[#E8722A]" />
                <span>Worker Welfare Contribution</span>
              </div>
              <p className="text-gray-600 text-[10px]">
                ₹{booking.cooperativeShare} was credited directly to the cooperative pension & healthcare safety net pool.
              </p>
            </div>

            <div className="w-full sm:w-64 space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Base Service Charge:</span>
                <span className="font-bold text-gray-900">₹{booking.serviceCharge}</span>
              </div>
              <div className="flex justify-between text-blue-700">
                <span>Platform & Tech Mediation:</span>
                <span>₹{booking.platformFee}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Taxes & Cess (GST):</span>
                <span>₹0.00 (Exempt)</span>
              </div>
              <div className="pt-2 border-t-2 border-gray-900 flex justify-between items-center text-sm font-black text-gray-900">
                <span>Total Amount Paid:</span>
                <span className="text-lg text-[#1B6B3A]">₹{booking.totalAmount}</span>
              </div>
              <div className="text-[10px] text-right text-emerald-700 font-bold">
                Settled on {paymentDate}
              </div>
            </div>
          </div>

          {/* Guarantee & Verification Seal */}
          <div className="border-t border-gray-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-gray-500">
            <div className="flex items-center gap-2">
              <FiShield className="text-[#1B6B3A] text-lg shrink-0" />
              <span>
                Verified Digital Receipt &bull; 100% Worker Owned Digital Cooperative Federation
              </span>
            </div>
            <div className="text-right font-mono">
              AUTH: COGIG-SIG-{booking.id.slice(0, 10).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer (Hidden in Print) */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between print:hidden">
          <span className="text-[11px] text-gray-500 font-semibold">
            Need support? Email: help@cogig.coop
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default DigitalInvoiceModal;
