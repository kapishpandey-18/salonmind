import { useState } from 'react';
import { Package, Plus, Search, AlertTriangle, TrendingDown, TrendingUp, Box, Edit, Trash2, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';

interface Product {
  id: number;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  price: number;
  supplier: string;
  lastRestocked: string;
}

const inventoryData: Product[] = [
  { id: 1, name: 'Shampoo Professional', category: 'Hair Care', currentStock: 45, minStock: 20, maxStock: 100, unit: 'bottles', price: 24.99, supplier: 'Beauty Supply Co', lastRestocked: '2025-11-01' },
  { id: 2, name: 'Conditioner Premium', category: 'Hair Care', currentStock: 38, minStock: 20, maxStock: 100, unit: 'bottles', price: 26.99, supplier: 'Beauty Supply Co', lastRestocked: '2025-11-01' },
  { id: 3, name: 'Hair Color - Black', category: 'Coloring', currentStock: 12, minStock: 15, maxStock: 50, unit: 'tubes', price: 18.50, supplier: 'ColorPro Inc', lastRestocked: '2025-10-28' },
  { id: 4, name: 'Hair Color - Blonde', category: 'Coloring', currentStock: 8, minStock: 15, maxStock: 50, unit: 'tubes', price: 18.50, supplier: 'ColorPro Inc', lastRestocked: '2025-10-28' },
  { id: 5, name: 'Developer 20 Vol', category: 'Coloring', currentStock: 25, minStock: 10, maxStock: 60, unit: 'bottles', price: 12.99, supplier: 'ColorPro Inc', lastRestocked: '2025-11-03' },
  { id: 6, name: 'Hair Gel Strong Hold', category: 'Styling', currentStock: 32, minStock: 15, maxStock: 80, unit: 'bottles', price: 15.99, supplier: 'Style Masters', lastRestocked: '2025-11-05' },
  { id: 7, name: 'Hairspray Flexible', category: 'Styling', currentStock: 28, minStock: 15, maxStock: 80, unit: 'bottles', price: 14.99, supplier: 'Style Masters', lastRestocked: '2025-11-05' },
  { id: 8, name: 'Deep Conditioning Mask', category: 'Treatment', currentStock: 5, minStock: 10, maxStock: 40, unit: 'jars', price: 32.99, supplier: 'Premium Care Ltd', lastRestocked: '2025-10-20' },
  { id: 9, name: 'Hair Serum Argan Oil', category: 'Treatment', currentStock: 18, minStock: 12, maxStock: 50, unit: 'bottles', price: 28.99, supplier: 'Premium Care Ltd', lastRestocked: '2025-10-30' },
  { id: 10, name: 'Disposable Capes', category: 'Supplies', currentStock: 150, minStock: 100, maxStock: 500, unit: 'pieces', price: 0.50, supplier: 'Salon Essentials', lastRestocked: '2025-11-02' },
  { id: 11, name: 'Gloves (Box of 100)', category: 'Supplies', currentStock: 8, minStock: 10, maxStock: 30, unit: 'boxes', price: 12.99, supplier: 'Salon Essentials', lastRestocked: '2025-10-25' },
  { id: 12, name: 'Towels Professional', category: 'Supplies', currentStock: 45, minStock: 30, maxStock: 100, unit: 'pieces', price: 8.99, supplier: 'Salon Essentials', lastRestocked: '2025-11-04' },
];

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [editProductOpen, setEditProductOpen] = useState(false);
  const [deleteProductOpen, setDeleteProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    currentStock: '',
    minStock: '',
    maxStock: '',
    unit: '',
    price: '',
    supplier: ''
  });
  const [editProduct, setEditProduct] = useState({
    name: '',
    category: '',
    currentStock: '',
    minStock: '',
    maxStock: '',
    unit: '',
    price: '',
    supplier: ''
  });

  const filteredProducts = inventoryData.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (product: Product) => {
    const percentage = (product.currentStock / product.maxStock) * 100;
    if (product.currentStock <= product.minStock) {
      return { status: 'critical', label: 'Low Stock', color: 'bg-red-500/10 text-red-500 border-red-500/20' };
    } else if (percentage <= 50) {
      return { status: 'warning', label: 'Reorder Soon', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' };
    } else {
      return { status: 'good', label: 'In Stock', color: 'bg-green-500/10 text-green-500 border-green-500/20' };
    }
  };

  const lowStockCount = inventoryData.filter(p => p.currentStock <= p.minStock).length;
  const totalValue = inventoryData.reduce((sum, p) => sum + (p.currentStock * p.price), 0);
  const totalItems = inventoryData.reduce((sum, p) => sum + p.currentStock, 0);

  const categories = ['all', 'Hair Care', 'Coloring', 'Styling', 'Treatment', 'Supplies'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-foreground">Inventory Management</h2>
          <p className="text-muted-foreground">Track and manage your salon products</p>
        </div>
        <Button 
          onClick={() => setAddProductOpen(true)}
          className="bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500 text-white shadow-lg shadow-rose-400/20 whitespace-nowrap"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Products */}
        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Total Products</p>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-2xl text-foreground">{inventoryData.length}</span>
                  <span className="text-xs text-muted-foreground">active items</span>
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Stock */}
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Total Stock</p>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-2xl text-foreground">{totalItems}</span>
                  <span className="text-xs text-muted-foreground">items in stock</span>
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Box className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Value */}
        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Inventory Value</p>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-2xl text-foreground">₹{totalValue.toFixed(2)}</span>
                  <span className="text-xs text-muted-foreground">total worth</span>
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Low Stock Alerts</p>
                <div className="text-2xl text-foreground mb-1">{lowStockCount}</div>
                <div className="flex items-center gap-1 text-xs">
                  <div className="flex items-center gap-1 bg-red-50 text-red-700 px-1.5 py-0.5 rounded-full">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Urgent</span>
                  </div>
                  <span className="text-muted-foreground">needs reorder</span>
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products or suppliers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-input-background border-border"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48 bg-input-background border-border">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Product Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product) => {
          const stockStatus = getStockStatus(product);
          const stockPercentage = (product.currentStock / product.maxStock) * 100;
          
          return (
            <Card key={product.id} className="bg-card border-border hover:shadow-lg transition-all hover:scale-[1.02] relative overflow-hidden">
              {/* Status indicator stripe */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${
                stockStatus.status === 'critical' ? 'bg-red-500' :
                stockStatus.status === 'warning' ? 'bg-yellow-500' :
                'bg-gradient-to-r from-green-500 to-emerald-400'
              }`} />
              
              <CardContent className="p-4 pt-5">
                {/* Header with Category Badge */}
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="outline" className="border-purple-600/20 text-purple-600 bg-purple-50/50">
                    {product.category}
                  </Badge>
                  <Badge variant="outline" className={stockStatus.color}>
                    {stockStatus.label}
                  </Badge>
                </div>

                {/* Product Name */}
                <div className="mb-4">
                  <h3 className="text-foreground line-clamp-1 mb-1">{product.name}</h3>
                  <p className="text-xs text-muted-foreground">{product.unit}</p>
                </div>

                {/* Stock Level Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Stock Level</span>
                    <span className="text-foreground">{product.currentStock} / {product.maxStock}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        stockStatus.status === 'critical' ? 'bg-red-500' :
                        stockStatus.status === 'warning' ? 'bg-yellow-500' :
                        'bg-gradient-to-r from-green-500 to-emerald-400'
                      }`}
                      style={{ width: `${stockPercentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">Min: {product.minStock}</span>
                    <span className="text-xs text-muted-foreground">{stockPercentage.toFixed(0)}%</span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between py-1.5 border-t border-border">
                    <span className="text-xs text-muted-foreground">Price</span>
                    <span className="text-foreground">₹{product.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-t border-border">
                    <span className="text-xs text-muted-foreground">Supplier</span>
                    <span className="text-xs text-foreground truncate ml-2 max-w-[150px]">{product.supplier}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-t border-border">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Last Restocked
                    </span>
                    <span className="text-xs text-foreground">
                      {new Date(product.lastRestocked).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 h-9"
                    onClick={() => {
                      setSelectedProduct(product);
                      setEditProduct({
                        name: product.name,
                        category: product.category,
                        currentStock: product.currentStock.toString(),
                        minStock: product.minStock.toString(),
                        maxStock: product.maxStock.toString(),
                        unit: product.unit,
                        price: product.price.toString(),
                        supplier: product.supplier
                      });
                      setEditProductOpen(true);
                    }}
                  >
                    <Edit className="w-3 h-3 mr-2" />
                    <span className="truncate">Edit</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-9 px-3"
                    onClick={() => {
                      setSelectedProduct(product);
                      setDeleteProductOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || categoryFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Add your first product to get started'}
            </p>
            {!searchQuery && categoryFilter === 'all' && (
              <Button 
                onClick={() => setAddProductOpen(true)}
                className="bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Product
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Low Stock Alert */}
      {lowStockCount > 0 && (
        <Card className="bg-red-500/5 border-red-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="w-5 h-5" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {lowStockCount} product{lowStockCount !== 1 ? 's' : ''} need{lowStockCount === 1 ? 's' : ''} to be restocked
            </p>
            <div className="flex flex-wrap gap-2">
              {inventoryData
                .filter(p => p.currentStock <= p.minStock)
                .map(product => (
                  <Badge key={product.id} className="bg-red-500/10 text-red-500 border-red-500/20">
                    {product.name} ({product.currentStock} left)
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Product Dialog */}
      <Dialog open={addProductOpen} onOpenChange={setAddProductOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Add a new product to your inventory
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-name">Product Name *</Label>
                <Input 
                  id="product-name" 
                  placeholder="e.g., Shampoo Professional"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-category">Category *</Label>
                <Select 
                  value={newProduct.category} 
                  onValueChange={(value) => setNewProduct({...newProduct, category: value})}
                >
                  <SelectTrigger id="product-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hair Care">Hair Care</SelectItem>
                    <SelectItem value="Coloring">Coloring</SelectItem>
                    <SelectItem value="Styling">Styling</SelectItem>
                    <SelectItem value="Treatment">Treatment</SelectItem>
                    <SelectItem value="Supplies">Supplies</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current-stock">Current Stock *</Label>
                <Input 
                  id="current-stock" 
                  type="number"
                  placeholder="50"
                  value={newProduct.currentStock}
                  onChange={(e) => setNewProduct({...newProduct, currentStock: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min-stock">Min Stock *</Label>
                <Input 
                  id="min-stock" 
                  type="number"
                  placeholder="20"
                  value={newProduct.minStock}
                  onChange={(e) => setNewProduct({...newProduct, minStock: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-stock">Max Stock *</Label>
                <Input 
                  id="max-stock" 
                  type="number"
                  placeholder="100"
                  value={newProduct.maxStock}
                  onChange={(e) => setNewProduct({...newProduct, maxStock: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Select 
                  value={newProduct.unit} 
                  onValueChange={(value) => setNewProduct({...newProduct, unit: value})}
                >
                  <SelectTrigger id="unit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottles">Bottles</SelectItem>
                    <SelectItem value="tubes">Tubes</SelectItem>
                    <SelectItem value="jars">Jars</SelectItem>
                    <SelectItem value="pieces">Pieces</SelectItem>
                    <SelectItem value="boxes">Boxes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input 
                  id="price" 
                  type="number"
                  step="0.01"
                  placeholder="24.99"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier *</Label>
              <Input 
                id="supplier" 
                placeholder="e.g., Beauty Supply Co"
                value={newProduct.supplier}
                onChange={(e) => setNewProduct({...newProduct, supplier: e.target.value})}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => {
                setAddProductOpen(false);
                setNewProduct({ name: '', category: '', currentStock: '', minStock: '', maxStock: '', unit: '', price: '', supplier: '' });
              }}>
                Cancel
              </Button>
              <Button 
                className="bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500 text-white"
                onClick={() => {
                  if (newProduct.name && newProduct.category && newProduct.currentStock && 
                      newProduct.minStock && newProduct.maxStock && newProduct.unit && 
                      newProduct.price && newProduct.supplier) {
                    setAddProductOpen(false);
                    setNewProduct({ name: '', category: '', currentStock: '', minStock: '', maxStock: '', unit: '', price: '', supplier: '' });
                    // In a real app, this would save to the database
                  }
                }}
                disabled={!newProduct.name || !newProduct.category || !newProduct.currentStock || 
                         !newProduct.minStock || !newProduct.maxStock || !newProduct.unit || 
                         !newProduct.price || !newProduct.supplier}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={editProductOpen} onOpenChange={setEditProductOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product details for {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-product-name">Product Name *</Label>
                <Input 
                  id="edit-product-name" 
                  placeholder="e.g., Shampoo Professional"
                  value={editProduct.name}
                  onChange={(e) => setEditProduct({...editProduct, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-product-category">Category *</Label>
                <Select 
                  value={editProduct.category} 
                  onValueChange={(value) => setEditProduct({...editProduct, category: value})}
                >
                  <SelectTrigger id="edit-product-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hair Care">Hair Care</SelectItem>
                    <SelectItem value="Coloring">Coloring</SelectItem>
                    <SelectItem value="Styling">Styling</SelectItem>
                    <SelectItem value="Treatment">Treatment</SelectItem>
                    <SelectItem value="Supplies">Supplies</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-current-stock">Current Stock *</Label>
                <Input 
                  id="edit-current-stock" 
                  type="number"
                  placeholder="50"
                  value={editProduct.currentStock}
                  onChange={(e) => setEditProduct({...editProduct, currentStock: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-min-stock">Min Stock *</Label>
                <Input 
                  id="edit-min-stock" 
                  type="number"
                  placeholder="20"
                  value={editProduct.minStock}
                  onChange={(e) => setEditProduct({...editProduct, minStock: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-max-stock">Max Stock *</Label>
                <Input 
                  id="edit-max-stock" 
                  type="number"
                  placeholder="100"
                  value={editProduct.maxStock}
                  onChange={(e) => setEditProduct({...editProduct, maxStock: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-unit">Unit *</Label>
                <Select 
                  value={editProduct.unit} 
                  onValueChange={(value) => setEditProduct({...editProduct, unit: value})}
                >
                  <SelectTrigger id="edit-unit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottles">Bottles</SelectItem>
                    <SelectItem value="tubes">Tubes</SelectItem>
                    <SelectItem value="jars">Jars</SelectItem>
                    <SelectItem value="pieces">Pieces</SelectItem>
                    <SelectItem value="boxes">Boxes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price (₹) *</Label>
                <Input 
                  id="edit-price" 
                  type="number"
                  step="0.01"
                  placeholder="24.99"
                  value={editProduct.price}
                  onChange={(e) => setEditProduct({...editProduct, price: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-supplier">Supplier *</Label>
              <Input 
                id="edit-supplier" 
                placeholder="e.g., Beauty Supply Co"
                value={editProduct.supplier}
                onChange={(e) => setEditProduct({...editProduct, supplier: e.target.value})}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => {
                setEditProductOpen(false);
                setSelectedProduct(null);
                setEditProduct({ name: '', category: '', currentStock: '', minStock: '', maxStock: '', unit: '', price: '', supplier: '' });
              }}>
                Cancel
              </Button>
              <Button 
                className="bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500 text-white"
                onClick={() => {
                  if (editProduct.name && editProduct.category && editProduct.currentStock && 
                      editProduct.minStock && editProduct.maxStock && editProduct.unit && 
                      editProduct.price && editProduct.supplier) {
                    setEditProductOpen(false);
                    setSelectedProduct(null);
                    setEditProduct({ name: '', category: '', currentStock: '', minStock: '', maxStock: '', unit: '', price: '', supplier: '' });
                    // In a real app, this would update the database
                    console.log('Product updated:', editProduct);
                  }
                }}
                disabled={!editProduct.name || !editProduct.category || !editProduct.currentStock || 
                         !editProduct.minStock || !editProduct.maxStock || !editProduct.unit || 
                         !editProduct.price || !editProduct.supplier}
              >
                <Edit className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Product Dialog */}
      <Dialog open={deleteProductOpen} onOpenChange={setDeleteProductOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedProduct && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Product Name</span>
                  <span className="text-foreground">{selectedProduct.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Category</span>
                  <Badge variant="outline" className="border-purple-600/20 text-purple-600">
                    {selectedProduct.category}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current Stock</span>
                  <span className="text-foreground">{selectedProduct.currentStock} {selectedProduct.unit}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Price</span>
                  <span className="text-foreground">₹{selectedProduct.price.toFixed(2)}</span>
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => {
                setDeleteProductOpen(false);
                setSelectedProduct(null);
              }}>
                Cancel
              </Button>
              <Button 
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  setDeleteProductOpen(false);
                  setSelectedProduct(null);
                  // In a real app, this would delete from the database
                  console.log('Product deleted:', selectedProduct?.name);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Product
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
