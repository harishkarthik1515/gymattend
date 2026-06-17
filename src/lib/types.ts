export interface Member {
  id: string;
  name: string;
  memberId: string;
  rfidNumber: string;
  membershipType: 'Basic' | 'Premium' | 'Elite';
  joinDate: string;
  expiryDate: string;
  contact: string;
  email: string;
  address: string;
  emergencyContact: string;
  status: 'Active' | 'Expired' | 'Suspended';
  paymentStatus: 'Paid' | 'Pending';
  lastPaymentDate: string;
  attendanceHistory: AttendanceRecord[];
  profileImage?: string;
  notes?: string;
  lastUpdated?: string;
}

export interface AttendanceRecord {
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  duration?: number;
}

export interface GymStats {
  totalMembers: number;
  activeMembers: number;
  todayCheckIns: number;
  pendingPayments: number;
  revenueThisMonth: number;
  newMembersThisMonth: number;
}