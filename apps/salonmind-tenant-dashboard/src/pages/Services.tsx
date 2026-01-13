import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  Clock,
  Eye,
  IndianRupee,
  Package,
  Pencil,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { Skeleton } from "../components/ui/skeleton";
import { EntityPageHeader } from "../components/EntityPageHeader";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import {
  useServices,
  useServiceActions,
} from "../hooks/owner/useServices";
import type { OwnerService } from "../types/owner";

interface ServicesPageProps {
  activeBranchId: string | null;
}

const INITIAL_FORM = {
  name: "",
  category: "",
  price: 0,
  duration: 60,
  description: "",
  isActive: true,
};

export default function Services({ activeBranchId }: ServicesPageProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [formState, setFormState] = useState(INITIAL_FORM);
  const [selectedService, setSelectedService] = useState<OwnerService | null>(
    null
  );
  const debouncedSearch = useDebouncedValue(search);
  const limit = 8;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeBranchId]);

  const { data, isLoading } = useServices({
    branchId: activeBranchId,
    search: debouncedSearch,
    page,
    limit,
  });
  const services = data?.items ?? [];
  const pagination = data?.pagination;

  const { create, update, updateStatus, remove } = useServiceActions(
    activeBranchId
  );

  const isMutating =
    create.isPending || update.isPending || updateStatus.isPending || remove.isPending;

  const openCreateModal = () => {
    setSelectedService(null);
    setFormState(INITIAL_FORM);
    setIsFormOpen(true);
  };

  const openEditModal = (service: OwnerService) => {
    setSelectedService(service);
    setFormState({
      name: service.name,
      category: service.category || "",
      price: service.price || 0,
      duration: service.duration || 60,
      description: service.description || "",
      isActive: service.isActive !== false,
    });
    setIsFormOpen(true);
  };

  const openViewModal = (service: OwnerService) => {
    setSelectedService(service);
    setIsViewOpen(true);
  };

  const handleSubmit = async () => {
    if (!formState.name) {
      toast.error("Name is required");
      return;
    }
    try {
      if (selectedService) {
        await update.mutateAsync({
          id: selectedService._id,
          data: formState,
        });
        toast.success("Service updated");
      } else {
        await create.mutateAsync({
          ...formState,
          branchId: activeBranchId || undefined,
        });
        toast.success("Service created");
      }
      setIsFormOpen(false);
    } catch (error: any) {
      toast.error(error?.message || "Unable to save service");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove.mutateAsync(id);
      toast.success("Service deleted");
    } catch (error: any) {
      toast.error(error?.message || "Unable to delete service");
    }
  };

  const handleToggle = async (service: OwnerService, value: boolean) => {
    try {
      await updateStatus.mutateAsync({ id: service._id, isActive: value });
      toast.success(`Service ${value ? "enabled" : "disabled"}`);
    } catch (error: any) {
      toast.error(error?.message || "Unable to update status");
    }
  };

  const summary = useMemo(() => {
    const total = pagination?.total ?? services.length;
    const active = services.filter((service) => service.isActive !== false).length;
    const inactive = total - active;
    const avgPrice =
      total > 0
        ? services.reduce((sum, service) => sum + (Number(service.price) || 0), 0) /
          total
        : 0;
    return { total, active, inactive, avgPrice: Math.round(avgPrice) };
  }, [services, pagination?.total]);

  if (!activeBranchId) {
    return (
      <EmptyState
        title="Select a branch"
        description="Choose a branch to manage services."
      />
    );
  }

  return (
    <div className="space-y-6">
      <EntityPageHeader
        title="Services"
        description="Manage the catalog visible to salon owners."
        onCreate={openCreateModal}
        createLabel="Add Service"
        isCreateDisabled={!activeBranchId}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">
                  Total Services
                </p>
                <div className="text-2xl text-foreground mb-1">
                  {summary.total}
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Active</p>
                <div className="text-2xl text-foreground mb-1">
                  {summary.active}
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Inactive</p>
                <div className="text-2xl text-foreground mb-1">
                  {summary.inactive}
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Avg. Price</p>
                <div className="text-2xl text-foreground mb-1">
                  ₹{summary.avgPrice}
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-10 bg-input-background border-border"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="space-y-3 py-6">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : services.length === 0 ? (
        <EmptyState
          title="No services yet"
          description="Create services to help owners offer packages to clients."
          actionLabel="Add service"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <Card key={service._id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>{service.name}</CardTitle>
                <Badge variant={service.isActive ? "default" : "secondary"}>
                  {service.category || "General"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-4 w-4" />
                  {service.price ?? 0}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {service.duration ?? 0} mins
                </div>
                <div>{service.description || "No description"}</div>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={service.isActive !== false}
                    onCheckedChange={(value) => handleToggle(service, value)}
                    disabled={updateStatus.isPending}
                  />
                  <span className="text-xs text-muted-foreground">
                    {service.isActive !== false ? "Active" : "Disabled"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openViewModal(service)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openEditModal(service)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <ConfirmDialog
                    title="Delete service"
                    description="This service will be hidden from scheduling."
                    onConfirm={() => handleDelete(service._id)}
                    trigger={
                      <Button size="icon" variant="ghost">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    }
                    disabled={remove.isPending}
                  />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {pagination && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={!pagination.hasPrev}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={!pagination.hasNext}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedService ? "Edit Service" : "Add Service"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {selectedService
                ? "Update service details."
                : "Enter service details."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formState.name}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input
                value={formState.category}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    category: event.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Price (₹)</Label>
                <Input
                  type="number"
                  value={formState.price}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      price: Number(event.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (mins)</Label>
                <Input
                  type="number"
                  value={formState.duration}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      duration: Number(event.target.value),
                    }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={formState.description}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsFormOpen(false)}
              disabled={isMutating}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isMutating}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedService?.name}</DialogTitle>
            <DialogDescription className="sr-only">
              Review service details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div>Category: {selectedService?.category || "—"}</div>
            <div>Price: ₹{selectedService?.price ?? 0}</div>
            <div>Duration: {selectedService?.duration ?? 0} mins</div>
            <div>Description: {selectedService?.description || "—"}</div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
