import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Search, Plus, Mail, Phone, Calendar, DollarSign, MoreVertical, User, MessageSquare, History, Edit, MapPin, Trash2 } from 'lucide-react';
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
} from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

type ClientStatus = 'vip' | 'active' | 'new';

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  visits: number;
  lastVisit: string;
  totalSpent: number;
  status: ClientStatus;
  address?: string;
  notes?: string;
}

const initialClients: Client[] = [
  { id: 1, name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '+91 98765 43210', visits: 24, lastVisit: '2025-11-05', totalSpent: 2840, status: 'vip', address: 'Mumbai, Maharashtra', notes: 'Prefers Emma for hair coloring' },
  { id: 2, name: 'Mike Brown', email: 'mike.b@email.com', phone: '+91 98765 43211', visits: 8, lastVisit: '2025-11-03', totalSpent: 620, status: 'active', address: 'Delhi, Delhi', notes: 'Regular customer' },
  { id: 3, name: 'Lisa Davis', email: 'lisa.d@email.com', phone: '+91 98765 43212', visits: 15, lastVisit: '2025-11-06', totalSpent: 1875, status: 'active', address: 'Bangalore, Karnataka' },
  { id: 4, name: 'Tom Wilson', email: 'tom.w@email.com', phone: '+91 98765 43213', visits: 32, lastVisit: '2025-11-04', totalSpent: 3520, status: 'vip', address: 'Chennai, Tamil Nadu', notes: 'VIP - Special treatment' },
  { id: 5, name: 'Anna Taylor', email: 'anna.t@email.com', phone: '+91 98765 43214', visits: 5, lastVisit: '2025-10-28', totalSpent: 485, status: 'active', address: 'Pune, Maharashtra' },
  { id: 6, name: 'John Smith', email: 'john.s@email.com', phone: '+91 98765 43215', visits: 12, lastVisit: '2025-11-02', totalSpent: 1140, status: 'active', address: 'Hyderabad, Telangana' },
  { id: 7, name: 'Emily White', email: 'emily.w@email.com', phone: '+91 98765 43216', visits: 2, lastVisit: '2025-10-15', totalSpent: 290, status: 'new', address: 'Kolkata, West Bengal', notes: 'New client - requires attention' },
  { id: 8, name: 'David Lee', email: 'david.l@email.com', phone: '+91 98765 43217', visits: 18, lastVisit: '2025-11-01', totalSpent: 2070, status: 'vip', address: 'Ahmedabad, Gujarat' },
];

// Mock appointment history
const getClientHistory = (clientId: number) => [
  { date: '2025-11-05', service: 'Haircut & Style', stylist: 'Emma Wilson', amount: 85, status: 'completed' },
  { date: '2025-10-20', service: 'Hair Coloring', stylist: 'Emma Wilson', amount: 165, status: 'completed' },
  { date: '2025-10-05', service: 'Hair Treatment', stylist: 'Sophie Chen', amount: 125, status: 'completed' },
  { date: '2025-09-18', service: 'Haircut', stylist: 'Alex Morgan', amount: 65, status: 'completed' },
  { date: '2025-09-01', service: 'Balayage', stylist: 'Emma Wilson', amount: 245, status: 'completed' },
];

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [editDetailsOpen, setEditDetailsOpen] = useState(false);
  const [viewHistoryOpen, setViewHistoryOpen] = useState(false);
  const [sendMessageOpen, setSendMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = (clientId: number, newStatus: ClientStatus) => {
    setClients(clients.map(client => 
      client.id === clientId ? { ...client, status: newStatus } : client
    ));
  };

  const handleViewDetails = (client: Client) => {
    setSelectedClient(client);
    setViewDetailsOpen(true);
  };

  const handleEditDetails = (client: Client) => {
    setSelectedClient(client);
    setEditDetailsOpen(true);
  };

  const handleViewHistory = (client: Client) => {
    setSelectedClient(client);
    setViewHistoryOpen(true);
  };

  const handleSendMessage = (client: Client) => {
    setSelectedClient(client);
    setMessageText('');
    setSendMessageOpen(true);
  };

  const getStatusBadge = (status: ClientStatus) => {
    switch (status) {
      case 'vip':
        return 'VIP';
      case 'new':
        return 'New';
      default:
        return 'Active';
    }
  };

  const getStatusColor = (status: ClientStatus) => {
    switch (status) {
      case 'vip':
        return 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white border-0';
      case 'new':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0';
      default:
        return 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-foreground">Clients</h2>
          <p className="text-muted-foreground">Manage your client database</p>
        </div>
        <Button 
          onClick={() => setAddClientOpen(true)}
          className="bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500 text-white shadow-lg shadow-rose-400/20 whitespace-nowrap"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Clients */}
        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Total Clients</p>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-2xl text-foreground">1,248</span>
                  <span className="text-xs text-muted-foreground">in database</span>
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* VIP Clients */}
        <Card className="border-l-4 border-l-amber-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">VIP Clients</p>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-2xl text-foreground">156</span>
                  <span className="text-xs text-muted-foreground">premium members</span>
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* New This Month */}
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">New This Month</p>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-2xl text-foreground">42</span>
                  <span className="text-xs text-muted-foreground">recent additions</span>
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avg. Lifetime Value */}
        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Avg. Lifetime Value</p>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-2xl text-foreground">₹1,456</span>
                  <span className="text-xs text-muted-foreground">per client</span>
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search clients by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-input-background border-border"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredClients.map((client) => (
          <Card key={client.id} className="bg-card border-border hover:shadow-lg transition-all hover:scale-[1.02] relative overflow-hidden flex flex-col">
            {/* Status indicator stripe based on client type */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${
              client.status === 'vip' ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
              client.status === 'new' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
              'bg-gradient-to-r from-green-500 to-emerald-500'
            }`} />
            
            <CardContent className="p-4 pt-5 flex flex-col flex-1">
              {/* Header with Avatar, Status, and Menu */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-300 to-purple-300 rounded-full flex items-center justify-center text-purple-700 shadow-lg shadow-rose-300/30 shrink-0 text-lg">
                  {client.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-foreground line-clamp-1 mb-2">{client.name}</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        size="sm"
                        className={`${getStatusColor(client.status)} h-6 text-xs px-2`}
                      >
                        {getStatusBadge(client.status)}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => handleStatusChange(client.id, 'vip')}>
                        Mark as VIP
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(client.id, 'active')}>
                        Mark as Active
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(client.id, 'new')}>
                        Mark as New
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {/* Three-dot menu in top right */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 -mt-1 -mr-1">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewDetails(client)}>
                      <User className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditDetails(client)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleViewHistory(client)}>
                      <History className="w-4 h-4 mr-2" />
                      View History
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSendMessage(client)}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send Message
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Client
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Contact Information */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground truncate">{client.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">{client.phone}</span>
                </div>
                {client.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground truncate">{client.address}</span>
                  </div>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <p className="text-lg text-foreground leading-tight">{client.visits}</p>
                  <p className="text-xs text-muted-foreground mt-1">Visits</p>
                </div>
                <div className="text-center border-l border-r border-border">
                  <p className="text-lg text-foreground leading-tight">₹{(client.totalSpent / 1000).toFixed(1)}k</p>
                  <p className="text-xs text-muted-foreground mt-1">Spent</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Last Visit</p>
                  <p className="text-xs text-foreground mt-1">{new Date(client.lastVisit).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                </div>
              </div>

              {/* Notes Preview */}
              {client.notes && (
                <div className="p-2 bg-amber-50/50 border border-amber-200/50 rounded text-xs text-amber-700 line-clamp-2">
                  {client.notes}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredClients.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-foreground mb-2">No clients found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? 'Try adjusting your search query' 
                : 'Add your first client to get started'}
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => setAddClientOpen(true)}
                className="bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Client
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
            <DialogDescription>
              Detailed information about {selectedClient?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-rose-50 to-purple-50 rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-300 to-purple-300 rounded-full flex items-center justify-center text-purple-700 shadow-lg shadow-rose-300/30 text-2xl">
                  {selectedClient.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-foreground">{selectedClient.name}</h3>
                  <Button 
                    size="sm"
                    className={`${getStatusColor(selectedClient.status)} mt-1`}
                  >
                    {getStatusBadge(selectedClient.status)}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="text-foreground mt-1 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {selectedClient.email}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="text-foreground mt-1 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {selectedClient.phone}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Total Visits</Label>
                  <p className="text-foreground mt-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {selectedClient.visits} visits
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Last Visit</Label>
                  <p className="text-foreground mt-1">{selectedClient.lastVisit}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Total Spent</Label>
                  <p className="text-foreground mt-1 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    ₹{selectedClient.totalSpent.toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Address</Label>
                  <p className="text-foreground mt-1">{selectedClient.address}</p>
                </div>
              </div>
              {selectedClient.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="text-foreground mt-1 p-3 bg-muted rounded-md">{selectedClient.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Details Dialog */}
      <Dialog open={editDetailsOpen} onOpenChange={setEditDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Client Details</DialogTitle>
            <DialogDescription>
              Update information for {selectedClient?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input id="edit-name" defaultValue={selectedClient.name} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input id="edit-email" type="email" defaultValue={selectedClient.email} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input id="edit-phone" defaultValue={selectedClient.phone} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input id="edit-address" defaultValue={selectedClient.address} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select defaultValue={selectedClient.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea id="edit-notes" defaultValue={selectedClient.notes} rows={3} />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setEditDetailsOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  className="bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500 text-white"
                  onClick={() => {
                    setEditDetailsOpen(false);
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

      {/* View History Dialog */}
      <Dialog open={viewHistoryOpen} onOpenChange={setViewHistoryOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Appointment History</DialogTitle>
            <DialogDescription>
              Complete visit history for {selectedClient?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-rose-50 to-purple-50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl text-foreground">{selectedClient.visits}</p>
                  <p className="text-sm text-muted-foreground">Total Visits</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl text-foreground">₹{selectedClient.totalSpent.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl text-foreground">₹{Math.round(selectedClient.totalSpent / selectedClient.visits)}</p>
                  <p className="text-sm text-muted-foreground">Avg. per Visit</p>
                </div>
              </div>
              <div className="space-y-3">
                <Label>Recent Appointments</Label>
                {getClientHistory(selectedClient.id).map((appointment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <p className="text-foreground">{appointment.service}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {appointment.date}
                        </span>
                        <span>•</span>
                        <span>{appointment.stylist}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-foreground">₹{appointment.amount}</p>
                      <Badge variant="outline" className="mt-1 bg-green-500/10 text-green-500 border-green-500/20">
                        {appointment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog open={sendMessageOpen} onOpenChange={setSendMessageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
            <DialogDescription>
              Send a message to {selectedClient?.name} via SMS or Email
            </DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-rose-300 to-purple-300 rounded-full flex items-center justify-center text-purple-700 shadow-lg shadow-rose-300/30">
                    {selectedClient.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-foreground">{selectedClient.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedClient.phone}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message-type">Message Type</Label>
                <Select defaultValue="sms">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea 
                  id="message" 
                  placeholder="Type your message here..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={5}
                />
                <p className="text-xs text-muted-foreground">
                  {messageText.length} / 160 characters
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSendMessageOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  className="bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500 text-white"
                  onClick={() => {
                    setSendMessageOpen(false);
                    // In a real app, send message here
                    console.log('Sending message to:', selectedClient.name, messageText);
                  }}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Client Dialog */}
      <Dialog open={addClientOpen} onOpenChange={setAddClientOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Add a new client to your database
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">Full Name *</Label>
              <Input 
                id="new-name" 
                placeholder="Enter client name"
                value={newClient.name}
                onChange={(e) => setNewClient({...newClient, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-email">Email *</Label>
              <Input 
                id="new-email" 
                type="email"
                placeholder="client@email.com"
                value={newClient.email}
                onChange={(e) => setNewClient({...newClient, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-phone">Phone Number *</Label>
              <Input 
                id="new-phone" 
                placeholder="+91 98765 43210"
                value={newClient.phone}
                onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-address">Address</Label>
              <Input 
                id="new-address" 
                placeholder="City, State"
                value={newClient.address}
                onChange={(e) => setNewClient({...newClient, address: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-notes">Notes</Label>
              <Textarea 
                id="new-notes" 
                placeholder="Add any notes about the client..."
                value={newClient.notes}
                onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => {
                setAddClientOpen(false);
                setNewClient({ name: '', email: '', phone: '', address: '', notes: '' });
              }}>
                Cancel
              </Button>
              <Button 
                className="bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500 text-white"
                onClick={() => {
                  if (newClient.name && newClient.email && newClient.phone) {
                    const client: Client = {
                      id: Math.max(...clients.map(c => c.id)) + 1,
                      name: newClient.name,
                      email: newClient.email,
                      phone: newClient.phone,
                      visits: 0,
                      lastVisit: new Date().toISOString().split('T')[0],
                      totalSpent: 0,
                      status: 'new',
                      address: newClient.address,
                      notes: newClient.notes
                    };
                    setClients([client, ...clients]);
                    setAddClientOpen(false);
                    setNewClient({ name: '', email: '', phone: '', address: '', notes: '' });
                  }
                }}
                disabled={!newClient.name || !newClient.email || !newClient.phone}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Client
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
