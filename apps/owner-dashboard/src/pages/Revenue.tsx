import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Calendar, CreditCard, Wallet } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ownerRevenueService } from '../services/owner/revenue.service';
import { ownerReportsService } from '../services/owner/reports.service';

const PAYMENT_METHOD_ICONS: Record<string, typeof DollarSign> = {
  'Credit Card': CreditCard,
  Cash: DollarSign,
  'Digital Wallet': Wallet,
};

export default function Revenue() {
  const [summaryStats, setSummaryStats] = useState({
    totalRevenue: 0,
    netProfit: 0,
    avgTicket: 0,
    outstanding: 0,
    pendingPayments: 0,
  });
  const [monthlyRevenue, setMonthlyRevenue] = useState<
    Array<{ month: string; revenue: number; expenses: number; profit: number; appointments: number }>
  >([]);
  const [dailyRevenue, setDailyRevenue] = useState<
    Array<{ day: string; revenue: number }>
  >([]);
  const [serviceRevenue, setServiceRevenue] = useState<
    Array<{ service: string; revenue: number; percentage: number }>
  >([]);
  const [paymentMethods, setPaymentMethods] = useState<
    Array<{ method: string; amount: number; percentage: number; icon: typeof DollarSign }>
  >([]);
  const [topStaff, setTopStaff] = useState<
    Array<{ name: string; revenue: number; appointments: number; avgTicket: number }>
  >([]);

  useEffect(() => {
    const loadRevenue = async () => {
      try {
        const summary = await ownerRevenueService.getSummary();
        if (summary?.summary) {
          setSummaryStats(summary.summary);
        }
        setMonthlyRevenue(summary?.monthlyRevenue ?? []);
        setDailyRevenue(summary?.dailyRevenue ?? []);
        setTopStaff(summary?.topStaff ?? []);
        setPaymentMethods(
          (summary?.paymentMethods ?? []).map((method) => ({
            ...method,
            icon: PAYMENT_METHOD_ICONS[method.method] || DollarSign,
          }))
        );
      } catch (error) {
        console.error('Failed to load revenue summary', error);
      }

      try {
        const services = await ownerReportsService.getTopServices('monthly');
        setServiceRevenue(services ?? []);
      } catch (error) {
        console.error('Failed to load revenue services', error);
      }
    };

    loadRevenue();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-foreground">Revenue Analytics</h2>
        <p className="text-muted-foreground">Track your salon's financial performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                <div className="text-2xl text-foreground mb-1">
                  ₹{summaryStats.totalRevenue.toLocaleString()}
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <div className="flex items-center gap-1 bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">
                    <TrendingUp className="w-3 h-3" />
                    <span>+21.2%</span>
                  </div>
                  <span className="text-muted-foreground">vs last month</span>
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Net Profit */}
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Net Profit</p>
                <div className="text-2xl text-foreground mb-1">
                  ₹{summaryStats.netProfit.toLocaleString()}
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <div className="flex items-center gap-1 bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">
                    <TrendingUp className="w-3 h-3" />
                    <span>+18.5%</span>
                  </div>
                  <span className="text-muted-foreground">vs last month</span>
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avg. Ticket Size */}
        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Avg. Ticket Size</p>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-2xl text-foreground">
                    ₹{summaryStats.avgTicket.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">per appointment</span>
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Outstanding */}
        <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Outstanding</p>
                <div className="text-2xl text-foreground mb-1">
                  ₹{summaryStats.outstanding.toLocaleString()}
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <div className="flex items-center gap-1 bg-red-50 text-red-700 px-1.5 py-0.5 rounded-full">
                    <TrendingDown className="w-3 h-3" />
                    <span>{summaryStats.pendingPayments} pending</span>
                  </div>
                  <span className="text-muted-foreground">payments</span>
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trends */}
      <Tabs defaultValue="monthly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="daily">Daily</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Profit Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={monthlyRevenue}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffd700" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ffd700" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stroke="#d4af37" fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="profit" stroke="#ffd700" fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Revenue (This Week)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Service Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {serviceRevenue.map((service) => (
              <div key={service.service} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-foreground">{service.service}</span>
                  <span className="text-foreground">₹{service.revenue.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-yellow-600 to-yellow-400 h-2 rounded-full shadow-lg shadow-yellow-600/30"
                      style={{ width: `${service.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">{service.percentage}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentMethods.map((payment) => {
              const Icon = payment.icon;
              return (
                <div key={payment.method} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-foreground">{payment.method}</p>
                      <p className="text-sm text-muted-foreground">{payment.percentage}% of total</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-foreground">₹{payment.amount.toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Staff */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Staff</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topStaff.map((staff, index) => (
              <div
                key={staff.name}
                className="flex items-center justify-between p-4 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    {index === 0 && <Badge className="bg-yellow-500">🏆 #1</Badge>}
                    {index === 1 && <Badge className="bg-gray-400">🥈 #2</Badge>}
                    {index === 2 && <Badge className="bg-orange-600">🥉 #3</Badge>}
                    {index > 2 && <Badge variant="outline">#{index + 1}</Badge>}
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-rose-300 to-purple-300 rounded-full flex items-center justify-center text-purple-700 shadow-lg shadow-rose-300/30">
                    {staff.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-foreground">{staff.name}</p>
                    <p className="text-sm text-muted-foreground">{staff.appointments} appointments</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg text-foreground">₹{staff.revenue.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Avg: ₹{staff.avgTicket}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
