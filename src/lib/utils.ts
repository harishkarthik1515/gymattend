import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as XLSX from 'xlsx';
import type { Member } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateMemberId() {
  const prefix = 'GYM';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
}

export function exportToExcel(members: Member[], fileName: string) {
  const worksheet = XLSX.utils.json_to_sheet(
    members.map(member => ({
      'Member ID': member.memberId,
      'Name': member.name,
      'Email': member.email,
      'Contact': member.contact,
      'Membership Type': member.membershipType,
      'Status': member.status,
      'Payment Status': member.paymentStatus,
      'Join Date': new Date(member.joinDate).toLocaleDateString(),
      'Last Payment': new Date(member.lastPaymentDate).toLocaleDateString(),
      'Last Check-in': member.attendanceHistory?.length > 0 
        ? new Date(member.attendanceHistory[member.attendanceHistory.length - 1].date).toLocaleDateString()
        : 'Never'
    }))
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Members');
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}