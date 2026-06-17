import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Search, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';
import { doc, updateDoc, arrayUnion, collection, query, where, getDocs } from 'firebase/firestore';
import type { Member, AttendanceRecord } from '@/lib/types';

interface MemberAttendanceProps {
  onNavigate: (page: string) => void;
}

export function MemberAttendance({ onNavigate }: MemberAttendanceProps) {
  const [rfidInput, setRfidInput] = useState('');
  const [memberData, setMemberData] = useState<Member | null>(null);
  const [recentActivity, setRecentActivity] = useState<{ name: string, checkInTime: string, checkOutTime?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleRfidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfidInput) return;

    setLoading(true);
    setError(null);
    try {
      const membersRef = collection(db, 'members');
      const q = query(membersRef, where('rfidNumber', '==', rfidInput));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Member not found');
        toast.error('Member not found');
        return;
      }

      const memberDoc = querySnapshot.docs[0];
      const member = { id: memberDoc.id, ...memberDoc.data() } as Member;

      if (member.status !== 'Active') {
        setError(`Membership ${member.status.toLowerCase()}. Please contact admin.`);
        toast.error(`Membership ${member.status.toLowerCase()}`);
        return;
      }

      if (member.paymentStatus === 'Pending') {
        setError('Payment pending. Please clear dues.');
        toast.error('Payment pending');
        return;
      }

      setMemberData(member);

      const today = new Date().toDateString();
      const latestRecord = member.attendanceHistory
        ? [...member.attendanceHistory]
            .reverse()
            .find((record: AttendanceRecord) => new Date(record.date).toDateString() === today)
        : undefined;

      const attendanceRef = doc(db, 'members', memberDoc.id);

      if (latestRecord && !latestRecord.checkOutTime) {
        // Mark checkout
        const updatedHistory = member.attendanceHistory.map((record) =>
          new Date(record.date).toDateString() === today && !record.checkOutTime
            ? { ...record, checkOutTime: new Date().toLocaleTimeString() }
            : record
        );

        await updateDoc(attendanceRef, {
          attendanceHistory: updatedHistory,
        });

        setRecentActivity(prev => [
          ...prev.filter(activity => activity.name !== member.name),
          { name: member.name, checkInTime: latestRecord.checkInTime, checkOutTime: new Date().toLocaleTimeString() }
        ]);

        toast.success('Checked out successfully!', {
          description: `Goodbye, ${member.name}!`,
        });
      } else {
        // Mark check-in
        const checkInTime = new Date().toLocaleTimeString();
        await updateDoc(attendanceRef, {
          attendanceHistory: arrayUnion({
            date: new Date().toISOString(),
            checkInTime,
          }),
        });

        setRecentActivity(prev => [...prev, { name: member.name, checkInTime }]);

        toast.success('Attendance marked successfully!', {
          description: `Welcome, ${member.name}!`,
        });
      }
    } catch (err) {
      setError('Error marking attendance');
      toast.error('Error marking attendance');
    } finally {
      setLoading(false);
      setRfidInput('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="container mx-auto">
        <Button
          variant="ghost"
          className="mb-8 text-yellow-400 hover:text-yellow-500"
          onClick={() => onNavigate('home')}
        >
          <ArrowLeft className="mr-2" /> Back to Home
        </Button>

        <Card className="bg-black border-yellow-400 mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-yellow-400 flex items-center gap-2">
              <Clock className="w-6 h-6" />
              Mark Attendance with RFID
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRfidSubmit} className="mb-6">
              <div className="flex gap-4">
                <Input
                  ref={inputRef}
                  placeholder="Scan RFID card..."
                  value={rfidInput}
                  onChange={(e) => setRfidInput(e.target.value)}
                  className="bg-gray-900 border-yellow-400 text-white"
                  autoComplete="off"
                  disabled={loading}
                />
                <Button 
                  type="submit"
                  className="bg-yellow-400 text-black hover:bg-yellow-500"
                  disabled={loading}
                >
                  <CheckCircle className="mr-2" /> Mark Attendance
                </Button>
              </div>
            </form>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6 flex items-center gap-2">
                <AlertCircle className="text-red-500" />
                <p className="text-red-500">{error}</p>
              </div>
            )}

            {memberData && (
              <div className="bg-gray-900 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5 text-yellow-400" />
                  Member Details
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-400">Name</p>
                    <p className="text-lg">{memberData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Member ID</p>
                    <p className="text-lg">{memberData.memberId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Membership Type</p>
                    <p className="text-lg">{memberData.membershipType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Status</p>
                    <p className={`text-lg ${
                      memberData.status === 'Active' ? 'text-green-500' :
                      memberData.status === 'Expired' ? 'text-red-500' :
                      'text-yellow-500'
                    }`}>
                      {memberData.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Payment Status</p>
                    <p className={`text-lg ${
                      memberData.paymentStatus === 'Paid' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {memberData.paymentStatus}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Expiry Date</p>
                    <p className="text-lg">
                      {new Date(memberData.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {recentActivity.length > 0 && (
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  Recent Activity
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member Name</TableHead>
                      <TableHead>Check-in Time</TableHead>
                      <TableHead>Check-out Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentActivity.map((activity, index) => (
                      <TableRow key={index}>
                        <TableCell>{activity.name}</TableCell>
                        <TableCell>{activity.checkInTime}</TableCell>
                        <TableCell>{activity.checkOutTime || 'Not Checked Out'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
