import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import {
  Plus,
  Search,
  Droplet,
  Palette,
  Sparkles,
  Heart,
  PaintBucket,
  Scissors,
  MoreVertical,
  Edit,
  Trash2,
  Package,
  TrendingUp,
  ShoppingBag,
  Grid3x3,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  usage: string;
  description: string;
  inStock: boolean;
}

const initialProducts: Product[] = [
  {
    id: "1",
    name: "Keratin Smoothing Treatment",
    brand: "L'Oréal Professional",
    category: "haircare",
    price: 2800,
    usage: "Hair smoothing and straightening",
    description: "Professional keratin treatment for frizz-free, smooth hair",
    inStock: true,
  },
  {
    id: "2",
    name: "Argan Oil Shampoo",
    brand: "Moroccanoil",
    category: "haircare",
    price: 1200,
    usage: "Deep cleansing and nourishment",
    description: "Infused with argan oil for shiny, healthy hair",
    inStock: true,
  },
  {
    id: "3",
    name: "Permanent Hair Color - Platinum Blonde",
    brand: "Wella Koleston",
    category: "haircolor",
    price: 650,
    usage: "Full hair coloring",
    description: "Long-lasting professional hair color with 100% gray coverage",
    inStock: true,
  },
  {
    id: "4",
    name: "Cream Developer 20 Vol",
    brand: "Wella Professionals",
    category: "haircolor",
    price: 380,
    usage: "Hair color activation",
    description: "Professional cream developer for optimal color results",
    inStock: true,
  },
  {
    id: "5",
    name: "Strong Hold Hair Gel",
    brand: "Got2b",
    category: "styling",
    price: 450,
    usage: "Styling and hold",
    description: "Extra strong hold gel for all-day styling",
    inStock: true,
  },
  {
    id: "6",
    name: "Texture Spray",
    brand: "Schwarzkopf",
    category: "styling",
    price: 890,
    usage: "Volume and texture",
    description: "Creates natural texture and volume",
    inStock: false,
  },
  {
    id: "7",
    name: "Anti-Aging Facial Serum",
    brand: "Kaya",
    category: "skincare",
    price: 1850,
    usage: "Face treatments",
    description: "Reduces fine lines and brightens complexion",
    inStock: true,
  },
  {
    id: "8",
    name: "Charcoal Face Mask",
    brand: "Mamaearth",
    category: "skincare",
    price: 599,
    usage: "Deep cleansing facial",
    description: "Detoxifies and purifies skin",
    inStock: true,
  },
  {
    id: "9",
    name: "Gel Nail Polish - Ruby Red",
    brand: "OPI",
    category: "nails",
    price: 720,
    usage: "Gel manicure",
    description: "Long-lasting gel polish with brilliant shine",
    inStock: true,
  },
  {
    id: "10",
    name: "Cuticle Oil",
    brand: "Sally Hansen",
    category: "nails",
    price: 350,
    usage: "Nail care",
    description: "Nourishes and conditions cuticles",
    inStock: true,
  },
  {
    id: "11",
    name: "Professional Hair Cutting Scissors",
    brand: "Joewell",
    category: "tools",
    price: 4500,
    usage: "Hair cutting",
    description: "Japanese steel professional cutting shears",
    inStock: true,
  },
  {
    id: "12",
    name: "Ionic Hair Dryer",
    brand: "Philips",
    category: "tools",
    price: 3200,
    usage: "Hair drying",
    description: "Fast drying with ionic technology for less frizz",
    inStock: true,
  },
];

const categories = [
  { id: "all", name: "All Products", icon: Sparkles },
  { id: "haircare", name: "Hair Care", icon: Droplet },
  { id: "haircolor", name: "Hair Color", icon: Palette },
  { id: "styling", name: "Styling", icon: Sparkles },
  { id: "skincare", name: "Skin Care", icon: Heart },
  { id: "nails", name: "Nail Products", icon: PaintBucket },
  { id: "tools", name: "Tools & Equipment", icon: Scissors },
];

export default function Products() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    brand: "",
    category: "haircare",
    price: 0,
    usage: "",
    description: "",
    inStock: true,
  });

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.brand) {
      const product: Product = {
        id: Date.now().toString(),
        name: newProduct.name || "",
        brand: newProduct.brand || "",
        category: newProduct.category || "haircare",
        price: newProduct.price || 0,
        usage: newProduct.usage || "",
        description: newProduct.description || "",
        inStock: newProduct.inStock ?? true,
      };
      setProducts([...products, product]);
      setNewProduct({
        name: "",
        brand: "",
        category: "haircare",
        price: 0,
        usage: "",
        description: "",
        inStock: true,
      });
      setIsAddDialogOpen(false);
    }
  };

  const handleUpdateProduct = () => {
    if (editingProduct) {
      setProducts(
        products.map((p) => (p.id === editingProduct.id ? editingProduct : p))
      );
      setEditingProduct(null);
    }
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.icon : Sparkles;
  };

  const stats = {
    total: products.length,
    inStock: products.filter((p) => p.inStock).length,
    outOfStock: products.filter((p) => !p.inStock).length,
    categories: new Set(products.map((p) => p.category)).size,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-foreground">Products</h2>
          <p className="text-muted-foreground">
            Manage your salon products and supplies
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/30 whitespace-nowrap">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Add a new product to your salon inventory
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product-name">Product Name *</Label>
                  <Input
                    id="product-name"
                    placeholder="e.g., Keratin Treatment"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand *</Label>
                  <Input
                    id="brand"
                    placeholder="e.g., L'Oréal"
                    value={newProduct.brand}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, brand: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={newProduct.category}
                    onValueChange={(value) =>
                      setNewProduct({ ...newProduct, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="haircare">Hair Care</SelectItem>
                      <SelectItem value="haircolor">Hair Color</SelectItem>
                      <SelectItem value="styling">Styling</SelectItem>
                      <SelectItem value="skincare">Skin Care</SelectItem>
                      <SelectItem value="nails">Nail Products</SelectItem>
                      <SelectItem value="tools">Tools & Equipment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        price: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="usage">Usage</Label>
                <Input
                  id="usage"
                  placeholder="e.g., Hair smoothing and straightening"
                  value={newProduct.usage}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, usage: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Product description..."
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddProduct}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              >
                Add Product
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Products */}
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
                <p className="text-sm text-blue-300/70 mb-1">Total Products</p>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-2xl text-blue-100">{stats.total}</span>
                  <span className="text-xs text-blue-300/70">in catalog</span>
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-400/30">
                <Package className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* In Stock */}
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
                <p className="text-sm text-blue-300/70 mb-1">In Stock</p>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-2xl text-blue-100">
                    {stats.inStock}
                  </span>
                  <span className="text-xs text-blue-300/70">
                    available now
                  </span>
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center border border-green-400/30">
                <ShoppingBag className="w-5 h-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Out of Stock */}
        <Card
          className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow"
          style={{
            background: "rgba(30, 41, 59, 0.8)",
            borderColor: "rgba(59, 130, 246, 0.3)",
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-blue-300/70 mb-1">Out of Stock</p>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-2xl text-blue-100">
                    {stats.outOfStock}
                  </span>
                  <span className="text-xs text-blue-300/70">need restock</span>
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center border border-red-400/30">
                <TrendingUp className="w-5 h-5 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
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
                <p className="text-sm text-blue-300/70 mb-1">Categories</p>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-2xl text-blue-100">
                    {stats.categories}
                  </span>
                  <span className="text-xs text-blue-300/70">
                    product types
                  </span>
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-400/30">
                <Grid3x3 className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Category Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search products or brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Categories Tabs */}
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="flex-wrap h-auto gap-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <TabsTrigger
                      key={category.id}
                      value={category.id}
                      className="gap-2"
                    >
                      <Icon className="w-4 h-4" />
                      {category.name}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {categories.map((category) => (
                <TabsContent
                  key={category.id}
                  value={category.id}
                  className="mt-6"
                >
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-12 bg-blue-500/10 rounded-lg border-2 border-dashed border-blue-400/30">
                      <Package className="w-12 h-12 text-blue-300/70 mx-auto mb-3" />
                      <p className="text-blue-300/70">No products found</p>
                    </div>
                  ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredProducts.map((product) => {
                        const CategoryIcon = getCategoryIcon(product.category);
                        return (
                          <Card
                            key={product.id}
                            className="group hover:shadow-xl transition-all duration-300 overflow-hidden shadow-md border-blue-400/30"
                            style={{ background: "rgba(30, 41, 59, 0.8)" }}
                          >
                            {/* Product Image/Icon Header */}
                            <div className="relative h-40 bg-gradient-to-br from-blue-900 to-slate-800 overflow-hidden">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-20 h-20 rounded-2xl bg-blue-500/20 backdrop-blur-sm shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform border border-blue-400/30">
                                  <CategoryIcon className="w-10 h-10 text-blue-400" />
                                </div>
                              </div>

                              {/* Status Badge Overlay */}
                              <div className="absolute top-3 right-3">
                                <Badge
                                  className={
                                    product.inStock
                                      ? "bg-green-500 text-white border-0 shadow-lg"
                                      : "bg-red-500 text-white border-0 shadow-lg"
                                  }
                                >
                                  {product.inStock
                                    ? "In Stock"
                                    : "Out of Stock"}
                                </Badge>
                              </div>

                              {/* Action Menu Overlay */}
                              <div className="absolute top-3 left-3">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="secondary"
                                      size="icon"
                                      className="h-8 w-8 bg-blue-500/20 backdrop-blur-sm hover:bg-blue-500/30 shadow-lg border border-blue-400/40"
                                    >
                                      <MoreVertical className="w-4 h-4 text-blue-200" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="start">
                                    <DropdownMenuItem
                                      onClick={() => setEditingProduct(product)}
                                    >
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleDeleteProduct(product.id)
                                      }
                                      className="text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>

                            <CardContent className="p-5 space-y-4">
                              {/* Product Name and Brand */}
                              <div className="space-y-1">
                                <h3 className="line-clamp-1 text-blue-100">
                                  {product.name}
                                </h3>
                                <p className="text-sm text-blue-300/70">
                                  {product.brand}
                                </p>
                              </div>

                              {/* Price Badge */}
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-blue-300/70">
                                  Price
                                </span>
                                <div className="px-3 py-1.5 bg-blue-500/20 rounded-full border border-blue-400/30">
                                  <span className="text-sm text-blue-100">
                                    ₹{product.price.toLocaleString()}
                                  </span>
                                </div>
                              </div>

                              {/* Usage */}
                              {product.usage && (
                                <div className="space-y-1">
                                  <p className="text-xs text-blue-300/70">
                                    Usage
                                  </p>
                                  <p className="text-xs line-clamp-2 text-blue-300/70">
                                    {product.usage}
                                  </p>
                                </div>
                              )}

                              {/* Description */}
                              {product.description && (
                                <div className="space-y-1">
                                  <p className="text-xs text-blue-300/70">
                                    Description
                                  </p>
                                  <p className="text-xs text-blue-300/70 line-clamp-2">
                                    {product.description}
                                  </p>
                                </div>
                              )}

                              {/* Category Badge */}
                              <div className="pt-2 border-t border-blue-400/30">
                                <Badge
                                  variant="outline"
                                  className="bg-blue-500/20 border-blue-400/40 text-blue-200"
                                >
                                  <CategoryIcon className="w-3 h-3 mr-1" />
                                  {
                                    categories.find(
                                      (c) => c.id === product.category
                                    )?.name
                                  }
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      <Dialog
        open={!!editingProduct}
        onOpenChange={() => setEditingProduct(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product information</DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Product Name *</Label>
                  <Input
                    id="edit-name"
                    value={editingProduct.name}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-brand">Brand *</Label>
                  <Input
                    id="edit-brand"
                    value={editingProduct.brand}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        brand: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category *</Label>
                  <Select
                    value={editingProduct.category}
                    onValueChange={(value) =>
                      setEditingProduct({ ...editingProduct, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="haircare">Hair Care</SelectItem>
                      <SelectItem value="haircolor">Hair Color</SelectItem>
                      <SelectItem value="styling">Styling</SelectItem>
                      <SelectItem value="skincare">Skin Care</SelectItem>
                      <SelectItem value="nails">Nail Products</SelectItem>
                      <SelectItem value="tools">Tools & Equipment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Price (₹) *</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-usage">Usage</Label>
                <Input
                  id="edit-usage"
                  value={editingProduct.usage}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      usage: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-stock">Stock Status</Label>
                <Select
                  value={editingProduct.inStock ? "in-stock" : "out-of-stock"}
                  onValueChange={(value) =>
                    setEditingProduct({
                      ...editingProduct,
                      inStock: value === "in-stock",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-stock">In Stock</SelectItem>
                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setEditingProduct(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProduct}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              Update Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
