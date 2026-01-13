import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { User, Building2, Bell, Lock, Camera } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { ownerSettingsService } from '../services/owner/settings.service';
import { ownerPlansService } from '../services/owner/plans.service';
import { ownerService } from '../services/ownerService';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

export default function ProfileSettings() {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    salonName: '',
    salonAddress: '',
    salonCity: '',
    salonState: '',
    salonPincode: '',
    salonPhone: '',
    salonEmail: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: false,
    smsNotifications: false,
    appointmentReminders: false,
    dailyReports: false,
    lowStockAlerts: false,
  });

  const [businessHours, setBusinessHours] = useState({
    monday: { open: '', close: '', closed: false },
    tuesday: { open: '', close: '', closed: false },
    wednesday: { open: '', close: '', closed: false },
    thursday: { open: '', close: '', closed: false },
    friday: { open: '', close: '', closed: false },
    saturday: { open: '', close: '', closed: false },
    sunday: { open: '', close: '', closed: false },
  });
  const [activePlan, setActivePlan] = useState<{
    planName?: string;
    planCode?: string;
    status?: string;
    endDate?: string | null;
  } | null>(null);
  const [planOptions, setPlanOptions] = useState<
    Array<{
      code: string;
      name: string;
      price: string;
      description: string;
      validity: string;
      features: string[];
    }>
  >([]);

  const formatPlanDate = (value?: string | null) =>
    value
      ? new Date(value).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  const loadSettings = async () => {
    try {
      const settings = await ownerSettingsService.get();
      setProfileData(settings.profileData);
      setNotifications(settings.notifications);
      setBusinessHours(settings.businessHours);
    } catch (error) {
      console.error('Failed to load settings', error);
    }
  };

  const loadActivePlan = async () => {
    try {
      const context = await ownerService.getTenantContext();
      setActivePlan(context?.subscription || null);
    } catch (error) {
      console.error('Failed to load active plan', error);
    }
  };

  const loadPlans = async () => {
    try {
      const plans = await ownerPlansService.list();
      setPlanOptions(plans);
    } catch (error) {
      console.error('Failed to load plans', error);
    }
  };

  useEffect(() => {
    loadSettings();
    loadActivePlan();
    loadPlans();
  }, []);

  const handleSaveSettings = async () => {
    try {
      const settings = await ownerSettingsService.update({
        profileData,
        notifications,
        businessHours,
      });
      setProfileData(settings.profileData);
      setNotifications(settings.notifications);
      setBusinessHours(settings.businessHours);
    } catch (error) {
      console.error('Failed to update settings', error);
    }
  };

  return (
    <div className="min-h-full p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl">Profile Settings</h2>
        <p className="text-muted-foreground mt-1">Manage your account and salon preferences</p>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="flex w-full max-w-3xl flex-wrap gap-2">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="salon">Salon Details</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="plan">Active Plan</TabsTrigger>
        </TabsList>

        {/* Personal Information */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-purple-400 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-rose-300 to-purple-300 rounded-full flex items-center justify-center text-purple-700 text-2xl shadow-lg shadow-rose-300/30">
                  {profileData.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <Button variant="outline" className="border-rose-300/50 hover:bg-rose-50">
                    <Camera className="w-4 h-4 mr-2" />
                    Change Photo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">JPG, PNG or GIF. Max size 2MB.</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" className="border-rose-300/50">Cancel</Button>
                <Button
                  onClick={handleSaveSettings}
                  className="bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500 text-white shadow-lg shadow-rose-400/20"
                >
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Salon Details */}
        <TabsContent value="salon">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-purple-400 rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>Salon Information</CardTitle>
                  <CardDescription>Manage your salon business details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="salonName">Salon Name</Label>
                  <Input
                    id="salonName"
                    value={profileData.salonName}
                    onChange={(e) => setProfileData({ ...profileData, salonName: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="salonAddress">Address</Label>
                  <Input
                    id="salonAddress"
                    value={profileData.salonAddress}
                    onChange={(e) => setProfileData({ ...profileData, salonAddress: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="salonCity">City</Label>
                    <Input
                      id="salonCity"
                      value={profileData.salonCity}
                      onChange={(e) => setProfileData({ ...profileData, salonCity: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="salonState">State</Label>
                    <Select value={profileData.salonState} onValueChange={(value) => setProfileData({ ...profileData, salonState: value })}>
                      <SelectTrigger id="salonState">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map((state) => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="salonPincode">PIN Code</Label>
                  <Input
                    id="salonPincode"
                    value={profileData.salonPincode}
                    onChange={(e) => setProfileData({ ...profileData, salonPincode: e.target.value })}
                    maxLength={6}
                  />
                </div>

                <Separator />

                <div className="grid gap-2">
                  <Label htmlFor="salonPhone">Salon Phone</Label>
                  <Input
                    id="salonPhone"
                    value={profileData.salonPhone}
                    onChange={(e) => setProfileData({ ...profileData, salonPhone: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="salonEmail">Salon Email</Label>
                  <Input
                    id="salonEmail"
                    type="email"
                    value={profileData.salonEmail}
                    onChange={(e) => setProfileData({ ...profileData, salonEmail: e.target.value })}
                  />
                </div>
              </div>

              <Separator />

              {/* Business Hours */}
              <div className="space-y-4">
                <h3 className="font-medium">Business Hours</h3>
                {Object.entries(businessHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center gap-4">
                    <div className="w-28 capitalize">{day}</div>
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        type="time"
                        value={hours.open}
                        disabled={hours.closed}
                        onChange={(e) => setBusinessHours({
                          ...businessHours,
                          [day]: { ...hours, open: e.target.value }
                        })}
                        className="w-32"
                      />
                      <span>to</span>
                      <Input
                        type="time"
                        value={hours.close}
                        disabled={hours.closed}
                        onChange={(e) => setBusinessHours({
                          ...businessHours,
                          [day]: { ...hours, close: e.target.value }
                        })}
                        className="w-32"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={!hours.closed}
                        onCheckedChange={(checked) => setBusinessHours({
                          ...businessHours,
                          [day]: { ...hours, closed: !checked }
                        })}
                      />
                      <Label className="text-sm text-muted-foreground">
                        {hours.closed ? 'Closed' : 'Open'}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" className="border-rose-300/50">Cancel</Button>
                <Button
                  onClick={handleSaveSettings}
                  className="bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500 text-white shadow-lg shadow-rose-400/20"
                >
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-purple-400 rounded-full flex items-center justify-center">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose how you want to be notified</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                  </div>
                  <Switch
                    checked={notifications.smsNotifications}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, smsNotifications: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Appointment Reminders</Label>
                    <p className="text-sm text-muted-foreground">Get reminded about upcoming appointments</p>
                  </div>
                  <Switch
                    checked={notifications.appointmentReminders}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, appointmentReminders: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Daily Reports</Label>
                    <p className="text-sm text-muted-foreground">Receive daily business summary reports</p>
                  </div>
                  <Switch
                    checked={notifications.dailyReports}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, dailyReports: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Low Stock Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified when inventory is running low</p>
                  </div>
                  <Switch
                    checked={notifications.lowStockAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, lowStockAlerts: checked })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" className="border-rose-300/50">Cancel</Button>
                <Button
                  onClick={handleSaveSettings}
                  className="bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500 text-white shadow-lg shadow-rose-400/20"
                >
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-purple-400 rounded-full flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your password and security options</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input 
                    id="currentPassword" 
                    type="password"
                    value={profileData.currentPassword}
                    onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                  />
                </div>

                <Separator />

                <div className="grid gap-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input 
                    id="newPassword" 
                    type="password"
                    value={profileData.newPassword}
                    onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 8 characters long
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password"
                    value={profileData.confirmPassword}
                    onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" className="border-rose-300/50">
                    Enable
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Active Sessions</Label>
                    <p className="text-sm text-muted-foreground">Manage your active login sessions</p>
                  </div>
                  <Button variant="outline" className="border-rose-300/50">
                    View Sessions
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" className="border-rose-300/50">Cancel</Button>
                <Button
                  onClick={handleSaveSettings}
                  className="bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500 text-white shadow-lg shadow-rose-400/20"
                >
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Plan */}
        <TabsContent value="plan">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Active Plan</CardTitle>
                <CardDescription>
                  Review your current subscription and upgrade when ready.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Plan Name</p>
                  <p className="text-foreground">
                    {activePlan?.planName || 'No active plan'}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    activePlan?.status === 'ACTIVE'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-muted text-muted-foreground border-border'
                  }
                >
                  {activePlan?.status || 'INACTIVE'}
                </Badge>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Plan Code</p>
                  <p className="text-foreground">
                    {activePlan?.planCode || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Renewal Date</p>
                  <p className="text-foreground">
                    {formatPlanDate(activePlan?.endDate)}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/30 whitespace-nowrap">
                  Upgrade Plan
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <p className="text-foreground">All Plans</p>
                  <p className="text-sm text-muted-foreground">
                    Compare pricing, features, and validity before upgrading.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {planOptions.map((plan) => {
                    const isActivePlan = activePlan?.planCode === plan.code;
                    return (
                      <Card
                        key={plan.code}
                        className={
                          isActivePlan
                            ? "border-blue-500/40 shadow-lg shadow-blue-500/20"
                            : undefined
                        }
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between gap-2">
                            <CardTitle>{plan.name}</CardTitle>
                            {isActivePlan && (
                              <Badge className="bg-blue-500 text-white">
                                Active
                              </Badge>
                            )}
                          </div>
                          <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Price
                            </p>
                            <p className="text-foreground">{plan.price}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Validity
                            </p>
                            <p className="text-foreground">{plan.validity}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Expiry
                            </p>
                            <p className="text-foreground">
                              {isActivePlan
                                ? formatPlanDate(activePlan?.endDate)
                                : "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">
                              Features
                            </p>
                            <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                              {plan.features.map((feature) => (
                                <li key={feature}>{feature}</li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
