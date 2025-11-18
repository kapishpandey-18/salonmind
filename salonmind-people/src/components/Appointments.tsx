import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Calendar as CalendarIcon, Clock, Search, Plus, Filter, MoreVertical, X, Check, ChevronsUpDown } from 'lucide-react';
import { Calendar } from './ui/calendar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';
import { cn } from './ui/utils';

const appointments = [
  { id: 1, client: 'Sarah Johnson', service: 'Haircut & Style', stylist: 'Emma Wilson', date: '2025-11-07', time: '10:00 AM', duration: '60 min', status: 'confirmed', price: 85 },
  { id: 2, client: 'Mike Brown', service: 'Beard Trim', stylist: 'James Carter', date: '2025-11-07', time: '10:30 AM', duration: '30 min', status: 'confirmed', price: 35 },
  { id: 3, client: 'Lisa Davis', service: 'Hair Coloring', stylist: 'Emma Wilson', date: '2025-11-07', time: '11:00 AM', duration: '120 min', status: 'pending', price: 165 },
  { id: 4, client: 'Tom Wilson', service: 'Haircut', stylist: 'Alex Morgan', date: '2025-11-07', time: '11:30 AM', duration: '45 min', status: 'confirmed', price: 65 },
  { id: 5, client: 'Anna Taylor', service: 'Hair Treatment', stylist: 'Sophie Chen', date: '2025-11-07', time: '12:00 PM', duration: '90 min', status: 'confirmed', price: 125 },
  { id: 6, client: 'John Smith', service: 'Haircut & Beard', stylist: 'James Carter', date: '2025-11-07', time: '01:00 PM', duration: '60 min', status: 'completed', price: 95 },
  { id: 7, client: 'Emily White', service: 'Balayage', stylist: 'Emma Wilson', date: '2025-11-07', time: '02:00 PM', duration: '180 min', status: 'confirmed', price: 245 },
  { id: 8, client: 'David Lee', service: 'Haircut', stylist: 'Alex Morgan', date: '2025-11-07', time: '02:30 PM', duration: '45 min', status: 'cancelled', price: 65 },
];

// Mock data for searchable dropdowns
const clients = [
  { value: 'sarah', label: 'Sarah Johnson', phone: '+91 98765 43210' },
  { value: 'mike', label: 'Mike Brown', phone: '+91 98765 43211' },
  { value: 'lisa', label: 'Lisa Davis', phone: '+91 98765 43212' },
  { value: 'tom', label: 'Tom Wilson', phone: '+91 98765 43213' },
  { value: 'anna', label: 'Anna Taylor', phone: '+91 98765 43214' },
  { value: 'john', label: 'John Smith', phone: '+91 98765 43215' },
  { value: 'emily', label: 'Emily White', phone: '+91 98765 43216' },
  { value: 'david', label: 'David Lee', phone: '+91 98765 43217' },
];

const services = [
  { value: 'haircut', label: 'Haircut', price: 65, duration: '45 min' },
  { value: 'haircut-style', label: 'Haircut & Style', price: 85, duration: '60 min' },
  { value: 'coloring', label: 'Hair Coloring', price: 165, duration: '120 min' },
  { value: 'balayage', label: 'Balayage', price: 245, duration: '180 min' },
  { value: 'treatment', label: 'Hair Treatment', price: 125, duration: '90 min' },
  { value: 'beard-trim', label: 'Beard Trim', price: 35, duration: '30 min' },
  { value: 'haircut-beard', label: 'Haircut & Beard', price: 95, duration: '60 min' },
];

const stylists = [
  { value: 'emma', label: 'Emma Wilson', specialty: 'Hair Coloring' },
  { value: 'james', label: 'James Carter', specialty: 'Beard & Grooming' },
  { value: 'alex', label: 'Alex Morgan', specialty: 'Haircuts' },
  { value: 'sophie', label: 'Sophie Chen', specialty: 'Hair Treatment' },
];

// Time slots
const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM',
];

export default function Appointments() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);

  // New Appointment form states
  const [newClientOpen, setNewClientOpen] = useState(false);
  const [newServiceOpen, setNewServiceOpen] = useState(false);
  const [newStylistOpen, setNewStylistOpen] = useState(false);
  const [newTimeOpen, setNewTimeOpen] = useState(false);
  const [newDateOpen, setNewDateOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedStylist, setSelectedStylist] = useState('');
  const [selectedNewDate, setSelectedNewDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'completed':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const formatDateForComparison = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch = apt.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    
    // Filter by selected date
    let matchesDate = true;
    if (date) {
      const aptDate = formatDateForComparison(apt.date);
      matchesDate = aptDate.toDateString() === date.toDateString();
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleViewDetails = (appointment: any) => {
    setSelectedAppointment(appointment);
    setViewDetailsOpen(true);
  };

  const handleEdit = (appointment: any) => {
    setSelectedAppointment(appointment);
    setEditDialogOpen(true);
  };

  const handleReschedule = (appointment: any) => {
    setSelectedAppointment(appointment);
    setRescheduleDialogOpen(true);
  };

  const handleCancel = (appointment: any) => {
    if (confirm(`Are you sure you want to cancel the appointment for ${appointment.client}?`)) {
      // In a real app, this would update the backend
      console.log('Cancelling appointment:', appointment);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-foreground">Appointments</h2>
          <p className="text-muted-foreground">Manage and schedule appointments</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500 text-white shadow-lg shadow-rose-400/20 whitespace-nowrap">
              <Plus className="w-4 h-4 mr-2" />
              New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Appointment</DialogTitle>
              <DialogDescription>Schedule a new appointment for a client</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Client - Searchable */}
              <div className="space-y-2">
                <Label>Client</Label>
                <Popover open={newClientOpen} onOpenChange={setNewClientOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={newClientOpen}
                      className="w-full justify-between"
                    >
                      {selectedClient
                        ? clients.find((client) => client.value === selectedClient)?.label
                        : "Select client..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search client..." />
                      <CommandList>
                        <CommandEmpty>No client found.</CommandEmpty>
                        <CommandGroup>
                          {clients.map((client) => (
                            <CommandItem
                              key={client.value}
                              value={client.value}
                              onSelect={(currentValue) => {
                                setSelectedClient(currentValue === selectedClient ? "" : currentValue);
                                setNewClientOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedClient === client.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span>{client.label}</span>
                                <span className="text-xs text-muted-foreground">{client.phone}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Service - Searchable */}
              <div className="space-y-2">
                <Label>Service</Label>
                <Popover open={newServiceOpen} onOpenChange={setNewServiceOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={newServiceOpen}
                      className="w-full justify-between"
                    >
                      {selectedService
                        ? services.find((service) => service.value === selectedService)?.label
                        : "Select service..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search service..." />
                      <CommandList>
                        <CommandEmpty>No service found.</CommandEmpty>
                        <CommandGroup>
                          {services.map((service) => (
                            <CommandItem
                              key={service.value}
                              value={service.value}
                              onSelect={(currentValue) => {
                                setSelectedService(currentValue === selectedService ? "" : currentValue);
                                setNewServiceOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedService === service.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span>{service.label}</span>
                                <span className="text-xs text-muted-foreground">
                                  ₹{service.price} • {service.duration}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Stylist - Searchable */}
              <div className="space-y-2">
                <Label>Stylist</Label>
                <Popover open={newStylistOpen} onOpenChange={setNewStylistOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={newStylistOpen}
                      className="w-full justify-between"
                    >
                      {selectedStylist
                        ? stylists.find((stylist) => stylist.value === selectedStylist)?.label
                        : "Select stylist..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search stylist..." />
                      <CommandList>
                        <CommandEmpty>No stylist found.</CommandEmpty>
                        <CommandGroup>
                          {stylists.map((stylist) => (
                            <CommandItem
                              key={stylist.value}
                              value={stylist.value}
                              onSelect={(currentValue) => {
                                setSelectedStylist(currentValue === selectedStylist ? "" : currentValue);
                                setNewStylistOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedStylist === stylist.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span>{stylist.label}</span>
                                <span className="text-xs text-muted-foreground">{stylist.specialty}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                {/* Date with Calendar Picker */}
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover open={newDateOpen} onOpenChange={setNewDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedNewDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedNewDate ? (
                          selectedNewDate.toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedNewDate}
                        onSelect={(date) => {
                          setSelectedNewDate(date);
                          setNewDateOpen(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Time Picker */}
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Popover open={newTimeOpen} onOpenChange={setNewTimeOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedTime && "text-muted-foreground"
                        )}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        {selectedTime || "Select time"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search time..." />
                        <CommandList>
                          <CommandEmpty>No time slot found.</CommandEmpty>
                          <CommandGroup>
                            {timeSlots.map((time) => (
                              <CommandItem
                                key={time}
                                value={time}
                                onSelect={(currentValue) => {
                                  setSelectedTime(currentValue);
                                  setNewTimeOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedTime === time ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {time}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500 text-white"
                onClick={() => {
                  // In a real app, create appointment here
                  console.log({
                    client: selectedClient,
                    service: selectedService,
                    stylist: selectedStylist,
                    date: selectedNewDate,
                    time: selectedTime
                  });
                }}
              >
                Create Appointment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Today's Appointments */}
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Today's Appointments</p>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-2xl text-foreground">8</span>
                  <span className="text-xs text-muted-foreground">total scheduled</span>
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confirmed */}
        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Confirmed</p>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-2xl text-foreground">6</span>
                  <span className="text-xs text-muted-foreground">ready to serve</span>
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card className="border-l-4 border-l-amber-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Pending</p>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-2xl text-foreground">1</span>
                  <span className="text-xs text-muted-foreground">awaiting confirmation</span>
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Completed</p>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-2xl text-foreground">1</span>
                  <span className="text-xs text-muted-foreground">successfully done</span>
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointments List */}
      <Card className="overflow-hidden border-yellow-600/20">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10"
              />
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-rose-400/10"
                  >
                    <CalendarIcon className="w-4 h-4 text-rose-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-rose-300" align="end">
                  <Card className="border-0 shadow-none">
                    <CardHeader className="border-b border-rose-200 pb-3">
                      <CardTitle className="text-sm">Select Date</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(newDate) => {
                          setDate(newDate);
                          setCalendarOpen(false);
                        }}
                        className="rounded-md"
                      />
                      <div className="mt-4 pt-4 border-t border-rose-200 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Selected Date:</span>
                          <span className="text-foreground">
                            {date?.toLocaleDateString('en-IN', { 
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </PopoverContent>
              </Popover>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {date && (
            <div className="px-6 pb-4 flex items-center gap-2">
              <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
                <CalendarIcon className="w-3 h-3 mr-1" />
                Filtered by: {date.toLocaleDateString('en-IN', { 
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDate(undefined)}
                className="h-6 text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Clear
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="overflow-hidden">
          <div className="space-y-3">
            {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors overflow-hidden"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0 overflow-hidden">
                    <div className="w-12 h-12 bg-gradient-to-br from-rose-300 to-purple-300 rounded-full flex items-center justify-center text-purple-700 shadow-lg shadow-rose-300/30 shrink-0">
                      {appointment.client.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground truncate">{appointment.client}</p>
                      <p className="text-sm text-muted-foreground truncate">{appointment.service}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1 whitespace-nowrap">
                          <CalendarIcon className="w-3 h-3" />
                          {appointment.date}
                        </span>
                        <span className="flex items-center gap-1 whitespace-nowrap">
                          <Clock className="w-3 h-3" />
                          {appointment.time}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <div className="hidden md:block text-right min-w-0">
                      <p className="text-sm text-foreground whitespace-nowrap">₹{appointment.price}</p>
                      <p className="text-xs text-muted-foreground truncate">{appointment.stylist}</p>
                    </div>
                    <Badge variant="outline" className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(appointment)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(appointment)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleReschedule(appointment)}>
                          Reschedule
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600" 
                          onClick={() => handleCancel(appointment)}
                        >
                          Cancel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Client</Label>
                  <p className="text-foreground mt-1">{selectedAppointment.client}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Service</Label>
                  <p className="text-foreground mt-1">{selectedAppointment.service}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Stylist</Label>
                  <p className="text-foreground mt-1">{selectedAppointment.stylist}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date</Label>
                  <p className="text-foreground mt-1">{selectedAppointment.date}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Time</Label>
                  <p className="text-foreground mt-1">{selectedAppointment.time}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Duration</Label>
                  <p className="text-foreground mt-1">{selectedAppointment.duration}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Price</Label>
                  <p className="text-foreground mt-1">₹{selectedAppointment.price}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge variant="outline" className={getStatusColor(selectedAppointment.status)}>
                      {selectedAppointment.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
            <DialogDescription>Update appointment details</DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-client">Client</Label>
                <Input id="edit-client" defaultValue={selectedAppointment.client} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-service">Service</Label>
                <Select defaultValue={selectedAppointment.service}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Haircut & Style">Haircut & Style</SelectItem>
                    <SelectItem value="Hair Coloring">Hair Coloring</SelectItem>
                    <SelectItem value="Beard Trim">Beard Trim</SelectItem>
                    <SelectItem value="Hair Treatment">Hair Treatment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Date</Label>
                  <Input id="edit-date" type="date" defaultValue={selectedAppointment.date} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-time">Time</Label>
                  <Input id="edit-time" type="time" defaultValue={selectedAppointment.time} />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  className="bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500 text-white"
                  onClick={() => {
                    setEditDialogOpen(false);
                    // In a real app, save changes here
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Rescheduling appointment for {selectedAppointment?.client}
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Current appointment:</p>
                <div className="space-y-1">
                  <p className="text-foreground">
                    <span className="font-medium">Service:</span> {selectedAppointment.service}
                  </p>
                  <p className="text-foreground">
                    <span className="font-medium">Date:</span> {selectedAppointment.date}
                  </p>
                  <p className="text-foreground">
                    <span className="font-medium">Time:</span> {selectedAppointment.time}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reschedule-date">New Date</Label>
                <Input id="reschedule-date" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reschedule-time">New Time</Label>
                <Input id="reschedule-time" type="time" />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setRescheduleDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  className="bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500 text-white"
                  onClick={() => {
                    setRescheduleDialogOpen(false);
                    // In a real app, save new date/time here
                  }}
                >
                  Confirm Reschedule
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
