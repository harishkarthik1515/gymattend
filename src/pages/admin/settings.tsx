import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsProps {
  onNavigate: (page: string) => void;
}

export function Settings({ onNavigate }: SettingsProps) {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="container mx-auto">
        <Button
          variant="ghost"
          className="mb-8 text-yellow-400 hover:text-yellow-500"
          onClick={() => onNavigate('admin')}
        >
          <ArrowLeft className="mr-2" /> Back to Dashboard
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-black border-yellow-400">
            <CardHeader>
              <CardTitle>Membership Plans</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Basic Plan Price</Label>
                <Input
                  type="number"
                  defaultValue="29.99"
                  className="bg-gray-900 border-yellow-400"
                />
              </div>
              <div>
                <Label>Premium Plan Price</Label>
                <Input
                  type="number"
                  defaultValue="49.99"
                  className="bg-gray-900 border-yellow-400"
                />
              </div>
              <div>
                <Label>Elite Plan Price</Label>
                <Input
                  type="number"
                  defaultValue="99.99"
                  className="bg-gray-900 border-yellow-400"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-yellow-400">
            <CardHeader>
              <CardTitle>Gym Hours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Opening Time</Label>
                <Input
                  type="time"
                  defaultValue="06:00"
                  className="bg-gray-900 border-yellow-400"
                />
              </div>
              <div>
                <Label>Closing Time</Label>
                <Input
                  type="time"
                  defaultValue="22:00"
                  className="bg-gray-900 border-yellow-400"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-yellow-400">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Email Notifications</Label>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>SMS Notifications</Label>
                <Switch
                  checked={smsNotifications}
                  onCheckedChange={setSmsNotifications}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-yellow-400">
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Payment Due Reminder (days before)</Label>
                <Input
                  type="number"
                  defaultValue="7"
                  className="bg-gray-900 border-yellow-400"
                />
              </div>
              <div>
                <Label>Late Payment Fee (%)</Label>
                <Input
                  type="number"
                  defaultValue="5"
                  className="bg-gray-900 border-yellow-400"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            className="bg-yellow-400 text-black hover:bg-yellow-500"
            onClick={handleSave}
          >
            <Save className="mr-2" /> Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}