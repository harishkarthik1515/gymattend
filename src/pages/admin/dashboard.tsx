import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  ArrowLeft,
  Users,
  Activity,
  DollarSign,
  Settings,
  UserPlus,
  Search,
  Download,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Member } from '@/lib/types';
import { toast } from 'sonner';
import { generateMemberId, exportToExcel } from '@/lib/utils';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    contact: '',
    rfidNumber: '',
    membershipType: 'Basic' as 'Basic' | 'Premium' | 'Elite',
    address: '',
    emergencyContact: '',
  });

  useEffect(() => {
    fetchMembers();
  }, [filterStatus]);

  const fetchMembers = async () => {
    try {
      const membersRef = collection(db, 'members');
      let q = query(membersRef, orderBy('joinDate', 'desc'));

      if (filterStatus !== 'all') {
        q = query(q, where('status', '==', filterStatus));
      }

      const querySnapshot = await getDocs(q);
      const membersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Member[];

      setMembers(membersData);
    } catch (error) {
      toast.error('Error fetching members');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    try {
      const membersRef = collection(db, 'members');
      const memberId = generateMemberId();
      
      await addDoc(membersRef, {
        ...newMember,
        memberId,
        joinDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        status: 'Active',
        paymentStatus: 'Paid',
        lastPaymentDate: new Date().toISOString(),
        attendanceHistory: [],
      });

      toast.success('Member added successfully');
      fetchMembers();
      setNewMember({
        name: '',
        email: '',
        contact: '',
        rfidNumber: '',
        membershipType: 'Basic',
        address: '',
        emergencyContact: '',
      });
    } catch (error) {
      toast.error('Error adding member');
    }
  };

  const handleEditMember = async () => {
    if (!selectedMember) return;

    try {
      const memberRef = doc(db, 'members', selectedMember.id);
      await updateDoc(memberRef, {
        ...selectedMember,
        lastUpdated: new Date().toISOString(),
      });

      toast.success('Member updated successfully');
      fetchMembers();
      setSelectedMember(null);
    } catch (error) {
      toast.error('Error updating member');
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return;

    try {
      await deleteDoc(doc(db, 'members', memberId));
      toast.success('Member deleted successfully');
      fetchMembers();
    } catch (error) {
      toast.error('Error deleting member');
    }
  };

  const handleTogglePayment = async (member: Member) => {
    try {
      const memberRef = doc(db, 'members', member.id);
      const newPaymentStatus = member.paymentStatus === 'Paid' ? 'Pending' : 'Paid';
      
      await updateDoc(memberRef, {
        paymentStatus: newPaymentStatus,
        lastPaymentDate: newPaymentStatus === 'Paid' ? new Date().toISOString() : member.lastPaymentDate,
      });

      toast.success(`Payment status updated to ${newPaymentStatus}`);
      fetchMembers();
    } catch (error) {
      toast.error('Error updating payment status');
    }
  };

  const handleExportData = () => {
    try {
      exportToExcel(members, `gym-members-${new Date().toISOString().split('T')[0]}`);
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Error exporting data');
    }
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.memberId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.rfidNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Button
            variant="ghost"
            className="text-yellow-400 hover:text-yellow-500"
            onClick={() => onNavigate('home')}
          >
            <ArrowLeft className="mr-2" /> Back to Home
          </Button>
          <div className="flex gap-4">
            <Button
              className="bg-yellow-400 text-black hover:bg-yellow-500"
              onClick={handleExportData}
            >
              <Download className="mr-2" /> Export Data
            </Button>
            <Button
              className="bg-yellow-400 text-black hover:bg-yellow-500"
              onClick={() => onNavigate('settings')}
            >
              <Settings className="mr-2" /> Settings
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-black border-yellow-400">
            <CardHeader className="flex flex-row items-center space-x-4">
              <Users className="w-8 h-8 text-yellow-400" />
              <CardTitle>Total Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{members.length}</div>
              <p className="text-sm text-muted-foreground">Active memberships</p>
            </CardContent>
          </Card>

          <Card className="bg-black border-yellow-400">
            <CardHeader className="flex flex-row items-center space-x-4">
              <Activity className="w-8 h-8 text-yellow-400" />
              <CardTitle>Today's Check-ins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {members.filter(m => m.attendanceHistory?.some(a => 
                  new Date(a.date).toDateString() === new Date().toDateString()
                )).length}
              </div>
              <p className="text-sm text-muted-foreground">Members checked in today</p>
            </CardContent>
          </Card>

          <Card className="bg-black border-yellow-400">
            <CardHeader className="flex flex-row items-center space-x-4">
              <DollarSign className="w-8 h-8 text-yellow-400" />
              <CardTitle>Pending Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {members.filter(m => m.paymentStatus === 'Pending').length}
              </div>
              <p className="text-sm text-muted-foreground">Members with pending fees</p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-black border-yellow-400 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4 flex-1">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-yellow-400" />
                <Input
                  placeholder="Search by name, ID, or RFID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-gray-900 border-yellow-400"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px] bg-gray-900 border-yellow-400">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Members</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-yellow-400 text-black hover:bg-yellow-500">
                  <UserPlus className="mr-2" /> Add Member
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black border-yellow-400">
                <DialogHeader>
                  <DialogTitle>Add New Member</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={newMember.name}
                      onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                      className="bg-gray-900 border-yellow-400"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={newMember.email}
                      onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                      className="bg-gray-900 border-yellow-400"
                    />
                  </div>
                  <div>
                    <Label>Contact</Label>
                    <Input
                      value={newMember.contact}
                      onChange={(e) => setNewMember({...newMember, contact: e.target.value})}
                      className="bg-gray-900 border-yellow-400"
                    />
                  </div>
                  <div>
                    <Label>RFID Number</Label>
                    <Input
                      value={newMember.rfidNumber}
                      onChange={(e) => setNewMember({...newMember, rfidNumber: e.target.value})}
                      className="bg-gray-900 border-yellow-400"
                    />
                  </div>
                  <div>
                    <Label>Address</Label>
                    <Input
                      value={newMember.address}
                      onChange={(e) => setNewMember({...newMember, address: e.target.value})}
                      className="bg-gray-900 border-yellow-400"
                    />
                  </div>
                  <div>
                    <Label>Emergency Contact</Label>
                    <Input
                      value={newMember.emergencyContact}
                      onChange={(e) => setNewMember({...newMember, emergencyContact: e.target.value})}
                      className="bg-gray-900 border-yellow-400"
                    />
                  </div>
                  <div>
                    <Label>Membership Type</Label>
                    <Select
                      value={newMember.membershipType}
                      onValueChange={(value: 'Basic' | 'Premium' | 'Elite') => 
                        setNewMember({...newMember, membershipType: value})
                      }
                    >
                      <SelectTrigger className="bg-gray-900 border-yellow-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Basic">Basic</SelectItem>
                        <SelectItem value="Premium">Premium</SelectItem>
                        <SelectItem value="Elite">Elite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="w-full bg-yellow-400 text-black hover:bg-yellow-500"
                    onClick={handleAddMember}
                  >
                    Add Member
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Membership</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Check-in</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">No members found</TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.memberId}</TableCell>
                    <TableCell>{member.name}</TableCell>
                    <TableCell>{member.membershipType}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        member.status === 'Active' ? 'bg-green-500/20 text-green-500' :
                        member.status === 'Expired' ? 'bg-red-500/20 text-red-500' :
                        'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {member.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {member.attendanceHistory?.length > 0
                        ? new Date(member.attendanceHistory[member.attendanceHistory.length - 1].date)
                            .toLocaleDateString()
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={member.paymentStatus === 'Paid'}
                          onCheckedChange={() => handleTogglePayment(member)}
                          className="data-[state=checked]:bg-green-500"
                        />
                        <span className={`text-sm ${
                          member.paymentStatus === 'Paid' ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {member.paymentStatus === 'Paid' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-yellow-400 hover:text-yellow-500"
                              onClick={() => {
                                setSelectedMember(member);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-black border-yellow-400">
                            <DialogHeader>
                              <DialogTitle>Edit Member</DialogTitle>
                            </DialogHeader>
                            {selectedMember && (
                              <div className="space-y-4">
                                <div>
                                  <Label>Name</Label>
                                  <Input
                                    value={selectedMember.name}
                                    onChange={(e) => setSelectedMember({
                                      ...selectedMember,
                                      name: e.target.value
                                    })}
                                    className="bg-gray-900 border-yellow-400"
                                  />
                                </div>
                                <div>
                                  <Label>Status</Label>
                                  <Select
                                    value={selectedMember.status}
                                    onValueChange={(value: 'Active' | 'Expired' | 'Suspended') =>
                                      setSelectedMember({
                                        ...selectedMember,
                                        status: value
                                      })
                                    }
                                  >
                                    <SelectTrigger className="bg-gray-900 border-yellow-400">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Active">Active</SelectItem>
                                      <SelectItem value="Expired">Expired</SelectItem>
                                      <SelectItem value="Suspended">Suspended</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label>Payment Status</Label>
                                  <Select
                                    value={selectedMember.paymentStatus}
                                    onValueChange={(value: 'Paid' | 'Pending') =>
                                      setSelectedMember({
                                        ...selectedMember,
                                        paymentStatus: value
                                      })
                                    }
                                  >
                                    <SelectTrigger className="bg-gray-900 border-yellow-400">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Paid">Paid</SelectItem>
                                      <SelectItem value="Pending">Pending</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button
                                  className="w-full bg-yellow-400 text-black hover:bg-yellow-500"
                                  onClick={handleEditMember}
                                >
                                  Save Changes
                                </Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-400 hover:text-red-500"
                          onClick={() => handleDeleteMember(member.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}