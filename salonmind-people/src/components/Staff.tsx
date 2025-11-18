import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Plus,
  Star,
  Calendar,
  DollarSign,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { Progress } from "./ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const staff = [
  {
    id: 1,
    name: "Emma Wilson",
    role: "Senior Stylist",
    photo:
      "https://images.unsplash.com/photo-1737063935340-f9af0940c4c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoYWlyc3R5bGlzdCUyMHdvbWFufGVufDF8fHx8MTc2MjgyMDI5Mnww&ixlib=rb-4.1.0&q=80&w=1080",
    specialties: ["Haircut", "Coloring", "Styling"],
    rating: 4.9,
    reviews: 248,
    appointmentsToday: 8,
    appointmentsWeek: 42,
    revenue: 3240,
    availability: 85,
    status: "active",
  },
  {
    id: 2,
    name: "James Carter",
    role: "Barber",
    photo:
      "https://images.unsplash.com/photo-1741345980697-f3c43eba44a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBiYXJiZXIlMjBtYW58ZW58MXx8fHwxNzYyOTM4NzYzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    specialties: ["Haircut", "Beard Trim", "Shaving"],
    rating: 4.8,
    reviews: 186,
    appointmentsToday: 6,
    appointmentsWeek: 38,
    revenue: 2180,
    availability: 92,
    status: "active",
  },
  {
    id: 3,
    name: "Alex Morgan",
    role: "Stylist",
    photo:
      "https://images.unsplash.com/photo-1761931403671-d020a14928d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWlyJTIwc3R5bGlzdCUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NjI4Mjg2ODV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    specialties: ["Haircut", "Styling"],
    rating: 4.7,
    reviews: 134,
    appointmentsToday: 7,
    appointmentsWeek: 35,
    revenue: 2450,
    availability: 78,
    status: "active",
  },
  {
    id: 4,
    name: "Sophie Chen",
    role: "Hair Colorist",
    photo:
      "https://images.unsplash.com/photo-1623104086040-35e17b8a8819?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWlyJTIwY29sb3Jpc3QlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzYyOTM4NzcyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    specialties: ["Coloring", "Balayage", "Highlights"],
    rating: 4.9,
    reviews: 212,
    appointmentsToday: 5,
    appointmentsWeek: 28,
    revenue: 4280,
    availability: 65,
    status: "active",
  },
  {
    id: 5,
    name: "Michael Ross",
    role: "Junior Stylist",
    photo:
      "https://images.unsplash.com/photo-1721697956161-f1584fad9d37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGhhaXJzdHlsaXN0JTIwbWFsZXxlbnwxfHx8fDE3NjI5Mzg3NzV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    specialties: ["Haircut", "Treatments"],
    rating: 4.5,
    reviews: 89,
    appointmentsToday: 4,
    appointmentsWeek: 25,
    revenue: 1420,
    availability: 88,
    status: "active",
  },
  {
    id: 6,
    name: "Isabella Garcia",
    role: "Nail Technician",
    photo:
      "https://images.unsplash.com/photo-1526907279934-3c9d2e53170f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYWlsJTIwdGVjaG5pY2lhbiUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NjI5Mzg3ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    specialties: ["Manicure", "Pedicure", "Nail Art"],
    rating: 4.8,
    reviews: 156,
    appointmentsToday: 0,
    appointmentsWeek: 0,
    revenue: 0,
    availability: 0,
    status: "off",
  },
];

export default function Staff() {
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: "",
    role: "",
    phone: "",
    email: "",
    specialties: "",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-foreground">Staff Management</h2>
          <p className="text-muted-foreground">
            Manage your team and track performance
          </p>
        </div>
        <Button
          onClick={() => setAddStaffOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/30 whitespace-nowrap"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Staff */}
        <Card
          className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow"
          style={{
            background: "rgba(30, 41, 59, 0.8)",
            borderColor: "rgba(59, 130, 246, 0.3)",
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-blue-300/70 mb-1">Total Staff</p>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-2xl text-blue-100">6</span>
                  <span className="text-xs text-blue-300/70">
                    · 5 active today
                  </span>
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-400/30">
                <Star className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avg. Rating */}
        <Card
          className="border-l-4 border-l-amber-500 hover:shadow-lg transition-shadow"
          style={{
            background: "rgba(30, 41, 59, 0.8)",
            borderColor: "rgba(59, 130, 246, 0.3)",
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-blue-300/70 mb-1">Average Rating</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl text-blue-100">4.8</span>
                  <span className="text-sm text-blue-300/70">/5.0</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-blue-300/70">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="w-3 h-3 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <span>Team average</span>
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center border border-amber-400/30">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Appointments */}
        <Card
          className="border-l-4 border-l-blue-400 hover:shadow-lg transition-shadow"
          style={{
            background: "rgba(30, 41, 59, 0.8)",
            borderColor: "rgba(59, 130, 246, 0.3)",
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-blue-300/70 mb-1">
                  Today's Appointments
                </p>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-2xl text-blue-100">30</span>
                  <span className="text-xs text-blue-300/70">
                    across all staff
                  </span>
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-400/30">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Revenue */}
        <Card
          className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow"
          style={{
            background: "rgba(30, 41, 59, 0.8)",
            borderColor: "rgba(59, 130, 246, 0.3)",
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-blue-300/70 mb-1">
                  Team Revenue (Week)
                </p>
                <div className="text-2xl text-blue-100 mb-1">₹13,570</div>
                <div className="flex items-center gap-1 text-xs">
                  <div className="flex items-center gap-1 bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full border border-green-400/30">
                    <TrendingUp className="w-3 h-3" />
                    <span>+8.5%</span>
                  </div>
                  <span className="text-blue-300/70">from last week</span>
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center border border-green-400/30">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {staff.map((member) => (
          <Card
            key={member.id}
            className="hover:shadow-xl transition-all duration-300 overflow-hidden shadow-md"
            style={{
              background: "rgba(30, 41, 59, 0.8)",
              borderColor: "rgba(59, 130, 246, 0.3)",
            }}
          >
            {/* Photo Header with Gradient Overlay */}
            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-900 to-slate-800">
              <Avatar className="w-full h-full rounded-none">
                <AvatarImage
                  src={member.photo}
                  alt={member.name}
                  className="object-cover"
                />
                <AvatarFallback className="rounded-none text-4xl bg-gradient-to-br from-blue-600 to-slate-700 text-blue-100">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {/* Status Badge Overlay */}
              <div className="absolute top-3 right-3">
                <Badge
                  className={`shadow-lg ${member.status === "active" ? "bg-green-500 text-white border-0" : "bg-gray-500 text-white border-0"}`}
                >
                  {member.status === "active" ? "Active Now" : "Off Duty"}
                </Badge>
              </div>
              {/* Rating Overlay */}
              <div className="absolute bottom-3 left-3 bg-slate-900/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg border border-blue-400/30">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm">{member.rating}</span>
                  <span className="text-xs text-muted-foreground">
                    ({member.reviews})
                  </span>
                </div>
              </div>
            </div>

            <CardContent className="p-6 space-y-4">
              {/* Name and Role */}
              <div className="text-center pb-2 border-b border-blue-400/30">
                <h3 className="text-xl mb-1 text-blue-100">{member.name}</h3>
                <p className="text-sm text-blue-300/70">{member.role}</p>
              </div>

              {/* Specialties */}
              <div>
                <p className="text-xs text-blue-300/70 mb-2">Specialties</p>
                <div className="flex flex-wrap gap-1.5">
                  {member.specialties.map((specialty, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="text-xs bg-blue-500/20 border-blue-400/40 text-blue-200"
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-3 gap-3 py-3 bg-blue-500/10 rounded-lg px-3 border border-blue-400/20">
                <div className="text-center">
                  <div className="text-xs text-blue-300/70 mb-1">Today</div>
                  <div className="flex items-center justify-center gap-1">
                    <Calendar className="w-3 h-3 text-blue-400" />
                    <span className="text-lg text-blue-100">
                      {member.appointmentsToday}
                    </span>
                  </div>
                </div>
                <div className="text-center border-x border-blue-400/30">
                  <div className="text-xs text-blue-300/70 mb-1">Week</div>
                  <div className="text-lg text-blue-100">
                    {member.appointmentsWeek}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-blue-300/70 mb-1">Revenue</div>
                  <div className="flex items-center justify-center gap-0.5">
                    <span className="text-xs text-blue-100">₹</span>
                    <span className="text-lg text-blue-100">
                      {(member.revenue / 1000).toFixed(1)}k
                    </span>
                  </div>
                </div>
              </div>

              {/* Availability Progress */}
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-blue-300/70">Week Capacity</span>
                  <span className="px-2 py-0.5 bg-blue-500/30 text-blue-200 rounded-full border border-blue-400/30">
                    {member.availability}%
                  </span>
                </div>
                <Progress value={member.availability} className="h-2" />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-blue-400/40 hover:bg-blue-500/20 text-blue-200"
                  onClick={() => {
                    // In a real app, this would open schedule management
                    console.log("Schedule for:", member.name);
                  }}
                >
                  Schedule
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg shadow-blue-500/30"
                  onClick={() => {
                    // In a real app, this would show detailed profile
                    console.log("View profile:", member.name);
                  }}
                >
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Staff Dialog */}
      <Dialog open={addStaffOpen} onOpenChange={setAddStaffOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
            <DialogDescription>
              Add a new team member to your salon
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="staff-name">Full Name *</Label>
              <Input
                id="staff-name"
                placeholder="Enter staff member name"
                value={newStaff.name}
                onChange={(e) =>
                  setNewStaff({ ...newStaff, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-role">Role *</Label>
              <Select
                value={newStaff.role}
                onValueChange={(value) =>
                  setNewStaff({ ...newStaff, role: value })
                }
              >
                <SelectTrigger id="staff-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Senior Stylist">Senior Stylist</SelectItem>
                  <SelectItem value="Stylist">Stylist</SelectItem>
                  <SelectItem value="Junior Stylist">Junior Stylist</SelectItem>
                  <SelectItem value="Hair Colorist">Hair Colorist</SelectItem>
                  <SelectItem value="Barber">Barber</SelectItem>
                  <SelectItem value="Nail Technician">
                    Nail Technician
                  </SelectItem>
                  <SelectItem value="Makeup Artist">Makeup Artist</SelectItem>
                  <SelectItem value="Receptionist">Receptionist</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-phone">Phone Number *</Label>
              <Input
                id="staff-phone"
                placeholder="+91 98765 43210"
                value={newStaff.phone}
                onChange={(e) =>
                  setNewStaff({ ...newStaff, phone: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-email">Email *</Label>
              <Input
                id="staff-email"
                type="email"
                placeholder="staff@salonmind.com"
                value={newStaff.email}
                onChange={(e) =>
                  setNewStaff({ ...newStaff, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-specialties">Specialties</Label>
              <Input
                id="staff-specialties"
                placeholder="e.g., Haircut, Coloring, Styling"
                value={newStaff.specialties}
                onChange={(e) =>
                  setNewStaff({ ...newStaff, specialties: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setAddStaffOpen(false);
                  setNewStaff({
                    name: "",
                    role: "",
                    phone: "",
                    email: "",
                    specialties: "",
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500 text-white"
                onClick={() => {
                  if (
                    newStaff.name &&
                    newStaff.role &&
                    newStaff.phone &&
                    newStaff.email
                  ) {
                    setAddStaffOpen(false);
                    setNewStaff({
                      name: "",
                      role: "",
                      phone: "",
                      email: "",
                      specialties: "",
                    });
                    // In a real app, this would save to the database
                  }
                }}
                disabled={
                  !newStaff.name ||
                  !newStaff.role ||
                  !newStaff.phone ||
                  !newStaff.email
                }
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Staff Member
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
