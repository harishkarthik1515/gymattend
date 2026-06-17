import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Activity,
  Users,
  DollarSign,
  ClipboardCheck,
  UserCircle,
  Dumbbell,
  Clock,
  Calendar,
  Trophy,
} from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { GymStats } from '@/lib/types';

interface HomeProps {
  onNavigate: (page: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
  const [stats, setStats] = useState<GymStats>({
    totalMembers: 0,
    activeMembers: 0,
    todayCheckIns: 0,
    pendingPayments: 0,
    revenueThisMonth: 0,
    newMembersThisMonth: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const membersRef = collection(db, 'members');
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [totalMembers, activeMembers, todayCheckIns, pendingPayments] = await Promise.all([
        getDocs(membersRef),
        getDocs(query(membersRef, where('status', '==', 'Active'))),
        getDocs(query(membersRef, where('lastCheckIn', '>=', today))),
        getDocs(query(membersRef, where('paymentStatus', '==', 'Pending'))),
      ]);

      setStats({
        totalMembers: totalMembers.size,
        activeMembers: activeMembers.size,
        todayCheckIns: todayCheckIns.size,
        pendingPayments: pendingPayments.size,
        revenueThisMonth: 25000, // Example value
        newMembersThisMonth: 15, // Example value
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div
        className="h-[60vh] bg-cover bg-center relative"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80)',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60">
          <div className="container mx-auto px-4 h-full flex items-center">
            <div className="max-w-3xl">
              <h1 className="text-5xl md:text-7xl font-bold text-yellow-400 mb-4">
                POWER YOUR FITNESS JOURNEY
              </h1>
              <p className="text-xl text-white mb-8">
                Track your progress, manage your membership, and achieve your goals
                with our state-of-the-art gym management system.
              </p>
              <div className="space-x-4">
                <Button
                  size="lg"
                  className="bg-yellow-400 text-black hover:bg-yellow-500"
                  onClick={() => onNavigate('attendance')}
                >
                  <ClipboardCheck className="mr-2" /> Mark Attendance
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                  onClick={() => onNavigate('admin')}
                >
                  <UserCircle className="mr-2" /> Admin Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="container mx-auto px-4 -mt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-black border-yellow-400">
            <CardHeader className="flex flex-row items-center space-x-4">
              <Users className="w-8 h-8 text-yellow-400" />
              <CardTitle>Active Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.activeMembers}</div>
              <p className="text-sm text-muted-foreground">
                Out of {stats.totalMembers} total members
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black border-yellow-400">
            <CardHeader className="flex flex-row items-center space-x-4">
              <Activity className="w-8 h-8 text-yellow-400" />
              <CardTitle>Today's Check-ins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.todayCheckIns}</div>
              <p className="text-sm text-muted-foreground">Members checked in today</p>
            </CardContent>
          </Card>

          <Card className="bg-black border-yellow-400">
            <CardHeader className="flex flex-row items-center space-x-4">
              <DollarSign className="w-8 h-8 text-yellow-400" />
              <CardTitle>Pending Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pendingPayments}</div>
              <p className="text-sm text-muted-foreground">Members with pending fees</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-yellow-400 mb-10 text-center">
          Our Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-black border-yellow-400">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Dumbbell className="w-12 h-12 text-yellow-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Modern Equipment</h3>
                <p className="text-muted-foreground">
                  State-of-the-art fitness equipment for all your needs
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-yellow-400">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Clock className="w-12 h-12 text-yellow-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">24/7 Access</h3>
                <p className="text-muted-foreground">
                  Train any time with our secure access system
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-yellow-400">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Calendar className="w-12 h-12 text-yellow-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Flexible Plans</h3>
                <p className="text-muted-foreground">
                  Choose from various membership options
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-yellow-400">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Trophy className="w-12 h-12 text-yellow-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Expert Trainers</h3>
                <p className="text-muted-foreground">
                  Professional guidance for your fitness journey
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}