import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Plus, Clock, DollarSign, TrendingUp, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';

const services = [
  {
    id: 1,
    name: 'Haircut - Men',
    category: 'Haircut',
    duration: 45,
    price: 65,
    popularity: 92,
    bookings: 156,
    revenue: 10140,
    status: 'active'
  },
  {
    id: 2,
    name: 'Haircut - Women',
    category: 'Haircut',
    duration: 60,
    price: 85,
    popularity: 88,
    bookings: 134,
    revenue: 11390,
    status: 'active'
  },
  {
    id: 3,
    name: 'Hair Coloring',
    category: 'Coloring',
    duration: 120,
    price: 165,
    popularity: 78,
    bookings: 98,
    revenue: 16170,
    status: 'active'
  },
  {
    id: 4,
    name: 'Balayage',
    category: 'Coloring',
    duration: 180,
    price: 245,
    popularity: 72,
    bookings: 67,
    revenue: 16415,
    status: 'active'
  },
  {
    id: 5,
    name: 'Highlights',
    category: 'Coloring',
    duration: 150,
    price: 195,
    popularity: 65,
    bookings: 54,
    revenue: 10530,
    status: 'active'
  },
  {
    id: 6,
    name: 'Blowout & Style',
    category: 'Styling',
    duration: 45,
    price: 55,
    popularity: 85,
    bookings: 112,
    revenue: 6160,
    status: 'active'
  },
  {
    id: 7,
    name: 'Beard Trim',
    category: 'Grooming',
    duration: 30,
    price: 35,
    popularity: 68,
    bookings: 89,
    revenue: 3115,
    status: 'active'
  },
  {
    id: 8,
    name: 'Hair Treatment',
    category: 'Treatment',
    duration: 90,
    price: 125,
    popularity: 58,
    bookings: 45,
    revenue: 5625,
    status: 'active'
  },
  {
    id: 9,
    name: 'Keratin Treatment',
    category: 'Treatment',
    duration: 180,
    price: 285,
    popularity: 42,
    bookings: 28,
    revenue: 7980,
    status: 'active'
  },
];

const categories = [
  { 
    name: 'All Services', 
    count: 9, 
    gradient: 'from-rose-400 to-purple-400',
    activeGradient: 'from-rose-500 to-purple-500'
  },
  { 
    name: 'Haircut', 
    count: 2, 
    gradient: 'from-pink-400 to-rose-400',
    activeGradient: 'from-pink-500 to-rose-500'
  },
  { 
    name: 'Coloring', 
    count: 3, 
    gradient: 'from-purple-400 to-pink-400',
    activeGradient: 'from-purple-500 to-pink-500'
  },
  { 
    name: 'Styling', 
    count: 1, 
    gradient: 'from-violet-400 to-purple-400',
    activeGradient: 'from-violet-500 to-purple-500'
  },
  { 
    name: 'Treatment', 
    count: 2, 
    gradient: 'from-fuchsia-400 to-pink-400',
    activeGradient: 'from-fuchsia-500 to-pink-500'
  },
  { 
    name: 'Grooming', 
    count: 1, 
    gradient: 'from-rose-400 to-pink-400',
    activeGradient: 'from-rose-500 to-pink-500'
  },
];

export default function Services() {
  const [selectedCategory, setSelectedCategory] = useState('All Services');
  const [addServiceOpen, setAddServiceOpen] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    category: '',
    duration: '',
    price: '',
    description: ''
  });
  
  const filteredServices = selectedCategory === 'All Services' 
    ? services 
    : services.filter(service => service.category === selectedCategory);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-foreground">Services</h2>
          <p className="text-muted-foreground">Manage your salon services and pricing</p>
        </div>
        <Button 
          onClick={() => setAddServiceOpen(true)}
          className="bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500 text-white shadow-lg shadow-rose-400/20 whitespace-nowrap"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Services */}
        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Total Services</p>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-2xl text-foreground">9</span>
                  <span className="text-xs text-muted-foreground">across 5 categories</span>
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avg. Price */}
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Avg. Price</p>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-2xl text-foreground">₹139</span>
                  <span className="text-xs text-muted-foreground">per service</span>
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Bookings */}
        <Card className="border-l-4 border-l-amber-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Total Bookings</p>
                <div className="text-2xl text-foreground mb-1">783</div>
                <div className="flex items-center gap-1 text-xs">
                  <div className="flex items-center gap-1 bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">
                    <TrendingUp className="w-3 h-3" />
                    <span>+12%</span>
                  </div>
                  <span className="text-muted-foreground">this month</span>
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Revenue */}
        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Services Revenue</p>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-2xl text-foreground">₹87,525</span>
                  <span className="text-xs text-muted-foreground">this month</span>
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => {
              const isActive = selectedCategory === category.name;
              return (
                <Button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`
                    ${isActive 
                      ? `bg-gradient-to-r ${category.activeGradient} text-white shadow-lg` 
                      : 'bg-white/5 hover:bg-white/10 text-foreground border border-white/10'
                    }
                    transition-all duration-200 whitespace-nowrap
                  `}
                >
                  <span className="flex items-center gap-2">
                    {category.name}
                    <Badge 
                      className={`
                        ${isActive 
                          ? 'bg-white/20 text-white border-0' 
                          : 'bg-gradient-to-r ' + category.gradient + ' text-white border-0'
                        }
                      `}
                    >
                      {category.count}
                    </Badge>
                  </span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Services Grid Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg text-foreground">
            {selectedCategory === 'All Services' ? 'All Services' : selectedCategory}
          </h3>
          <p className="text-sm text-muted-foreground">
            Showing {filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'}
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredServices.map((service) => (
          <Card key={service.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg truncate">{service.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{service.category}</p>
                </div>
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 shrink-0">
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Price & Duration */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-xl text-foreground">₹{service.price}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm whitespace-nowrap">{service.duration} min</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 py-3 border-y border-border">
                <div>
                  <p className="text-sm text-muted-foreground">Bookings</p>
                  <p className="text-lg text-foreground">{service.bookings}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-lg text-foreground">₹{service.revenue.toLocaleString()}</p>
                </div>
              </div>

              {/* Popularity */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Popularity</span>
                  <span className="text-foreground">{service.popularity}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-yellow-600 to-yellow-400 h-2 rounded-full transition-all shadow-lg shadow-yellow-600/30"
                    style={{ width: `${service.popularity}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 h-9"
                  onClick={() => {
                    // In a real app, this would open an edit dialog
                    console.log('Edit service:', service.name);
                  }}
                >
                  <Edit className="w-3 h-3 mr-2" />
                  <span className="truncate">Edit</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700 h-9 px-3"
                  onClick={() => {
                    // In a real app, this would show a confirmation dialog
                    console.log('Delete service:', service.name);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Service Dialog */}
      <Dialog open={addServiceOpen} onOpenChange={setAddServiceOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
            <DialogDescription>
              Create a new service for your salon
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="service-name">Service Name *</Label>
              <Input 
                id="service-name" 
                placeholder="e.g., Haircut - Men"
                value={newService.name}
                onChange={(e) => setNewService({...newService, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service-category">Category *</Label>
              <Select 
                value={newService.category} 
                onValueChange={(value) => setNewService({...newService, category: value})}
              >
                <SelectTrigger id="service-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Haircut">Haircut</SelectItem>
                  <SelectItem value="Coloring">Coloring</SelectItem>
                  <SelectItem value="Styling">Styling</SelectItem>
                  <SelectItem value="Treatment">Treatment</SelectItem>
                  <SelectItem value="Grooming">Grooming</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="service-duration">Duration (minutes) *</Label>
                <Input 
                  id="service-duration" 
                  type="number"
                  placeholder="45"
                  value={newService.duration}
                  onChange={(e) => setNewService({...newService, duration: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-price">Price (₹) *</Label>
                <Input 
                  id="service-price" 
                  type="number"
                  placeholder="500"
                  value={newService.price}
                  onChange={(e) => setNewService({...newService, price: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="service-description">Description</Label>
              <Textarea 
                id="service-description" 
                placeholder="Add service description..."
                value={newService.description}
                onChange={(e) => setNewService({...newService, description: e.target.value})}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => {
                setAddServiceOpen(false);
                setNewService({ name: '', category: '', duration: '', price: '', description: '' });
              }}>
                Cancel
              </Button>
              <Button 
                className="bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500 text-white"
                onClick={() => {
                  if (newService.name && newService.category && newService.duration && newService.price) {
                    setAddServiceOpen(false);
                    setNewService({ name: '', category: '', duration: '', price: '', description: '' });
                    // In a real app, this would save to the database
                  }
                }}
                disabled={!newService.name || !newService.category || !newService.duration || !newService.price}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
