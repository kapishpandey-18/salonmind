import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Calendar, Users, DollarSign, TrendingUp, Clock, Star } from 'lucide-react';
import { Badge } from './ui/badge';

const revenueData = [
  { month: 'Jan', revenue: 12400, appointments: 234 },
  { month: 'Feb', revenue: 13200, appointments: 256 },
  { month: 'Mar', revenue: 14800, appointments: 289 },
  { month: 'Apr', revenue: 16200, appointments: 312 },
  { month: 'May', revenue: 15600, appointments: 298 },
  { month: 'Jun', revenue: 18900, appointments: 345 },
];

const serviceData = [
  { name: 'Haircut', value: 35, color: '#e879f9', amount: 52500 },
  { name: 'Coloring', value: 25, color: '#fb7185', amount: 37500 },
  { name: 'Styling', value: 20, color: '#f0abfc', amount: 30000 },
  { name: 'Treatments', value: 12, color: '#fda4af', amount: 18000 },
  { name: 'Other', value: 8, color: '#fbbf24', amount: 12000 },
];

const appointmentData = [
  { day: 'Mon', scheduled: 45, completed: 42 },
  { day: 'Tue', scheduled: 52, completed: 50 },
  { day: 'Wed', scheduled: 48, completed: 45 },
  { day: 'Thu', scheduled: 61, completed: 58 },
  { day: 'Fri', scheduled: 68, completed: 65 },
  { day: 'Sat', scheduled: 75, completed: 72 },
  { day: 'Sun', scheduled: 38, completed: 36 },
];

const upcomingAppointments = [
  { id: 1, client: 'Sarah Johnson', service: 'Haircut & Style', time: '10:00 AM', stylist: 'Emma' },
  { id: 2, client: 'Mike Brown', service: 'Beard Trim', time: '10:30 AM', stylist: 'James' },
  { id: 3, client: 'Lisa Davis', service: 'Hair Coloring', time: '11:00 AM', stylist: 'Emma' },
  { id: 4, client: 'Tom Wilson', service: 'Haircut', time: '11:30 AM', stylist: 'Alex' },
  { id: 5, client: 'Anna Taylor', service: 'Hair Treatment', time: '12:00 PM', stylist: 'Sophie' },
];

export default function Overview() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-foreground">Dashboard Overview</h2>
        <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Today's Revenue */}
        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Today's Revenue</p>
                <div className="text-2xl text-foreground mb-1">₹2,847</div>
                <div className="flex items-center gap-1 text-xs">
                  <div className="flex items-center gap-1 bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">
                    <TrendingUp className="w-3 h-3" />
                    <span>+12.5%</span>
                  </div>
                  <span className="text-muted-foreground">vs yesterday</span>
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments Today */}
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Appointments Today</p>
                <div className="text-2xl text-foreground mb-1">28</div>
                <div className="flex items-center gap-1 text-xs flex-wrap">
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs px-1.5 py-0">
                    5 pending
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-1.5 py-0">
                    23 confirmed
                  </Badge>
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Clients */}
        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Active Clients</p>
                <div className="text-2xl text-foreground mb-1">1,248</div>
                <div className="flex items-center gap-1 text-xs">
                  <div className="flex items-center gap-1 bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">
                    <TrendingUp className="w-3 h-3" />
                    <span>+18</span>
                  </div>
                  <span className="text-muted-foreground">this week</span>
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avg Rating */}
        <Card className="border-l-4 border-l-amber-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Average Rating</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl text-foreground">4.8</span>
                  <span className="text-sm text-muted-foreground">/5.0</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span>(342 reviews)</span>
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-600 fill-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>Monthly revenue performance over 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e879f9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#e879f9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                <XAxis 
                  dataKey="month" 
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `₹${value / 1000}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  labelStyle={{ color: '#374151', fontWeight: '600' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#e879f9" 
                  strokeWidth={3}
                  fill="url(#colorRevenue)"
                  dot={{ fill: '#e879f9', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#e879f9', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Service Distribution */}
        <Card className="overflow-visible">
          <CardHeader>
            <CardTitle>Service Distribution</CardTitle>
            <CardDescription>Revenue breakdown by service category</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row items-stretch gap-8">
              {/* Chart Section */}
              <div className="w-full lg:w-1/2 flex items-center justify-center">
                <div className="w-full h-[280px] max-w-[280px] mx-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={serviceData}
                        cx="50%"
                        cy="50%"
                        innerRadius="55%"
                        outerRadius="85%"
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2}
                        startAngle={90}
                        endAngle={450}
                      >
                        {serviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                        formatter={(value: number) => [`${value}%`, 'Share']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Legend Section */}
              <div className="w-full lg:w-1/2 flex items-center">
                <div className="w-full space-y-3">
                  {serviceData.map((service, index) => (
                    <div key={index} className="flex items-center justify-between gap-4 p-3 rounded-lg border border-rose-100 hover:bg-rose-50 hover:border-rose-200 transition-all">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div 
                          className="w-4 h-4 rounded-full shrink-0 ring-2 ring-white shadow-sm" 
                          style={{ backgroundColor: service.color }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-foreground">
                            {service.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ₹{service.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <Badge 
                          variant="secondary" 
                          className="bg-gradient-to-r from-rose-100 to-purple-100 text-purple-700 border-purple-200"
                        >
                          {service.value}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointments Chart and List */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Weekly Appointments */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={appointmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="day" stroke="#a3a3a3" />
                <YAxis stroke="#a3a3a3" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(212, 175, 55, 0.2)' }} />
                <Legend />
                <Bar dataKey="scheduled" fill="#d4af37" radius={[8, 8, 0, 0]} />
                <Bar dataKey="completed" fill="#ffd700" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-rose-300 to-purple-300 rounded-full flex items-center justify-center text-purple-700 shadow-lg shadow-rose-300/30 shrink-0">
                    {appointment.client.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{appointment.client}</p>
                    <p className="text-xs text-muted-foreground truncate">{appointment.service}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs bg-yellow-600/10 text-yellow-600 border-yellow-600/20">
                        <Clock className="w-3 h-3 mr-1" />
                        {appointment.time}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
