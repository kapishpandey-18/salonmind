import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Eye,
  Mail,
  Pencil,
  Phone,
  Search,
  Star,
  Tag,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
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
import { Skeleton } from "../components/ui/skeleton";
import { EntityPageHeader } from "../components/EntityPageHeader";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import {
  useClients,
  useClientActions,
} from "../hooks/owner/useClients";
import type { OwnerClient } from "../types/owner";

interface ClientsPageProps {
  activeBranchId: string | null;
}

const INITIAL_FORM = {
  fullName: "",
  phoneNumber: "",
  email: "",
  notes: "",
  tags: [] as string[],
};

export default function Clients({ activeBranchId }: ClientsPageProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [formState, setFormState] = useState(INITIAL_FORM);
  const [selectedClient, setSelectedClient] = useState<OwnerClient | null>(
    null
  );
  const debouncedSearch = useDebouncedValue(search);
  const limit = 8;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeBranchId]);

  const { data, isLoading } = useClients({
    branchId: activeBranchId,
    search: debouncedSearch,
    page,
    limit,
  });
  const clients: OwnerClient[] = data?.items ?? [];
  const pagination = data?.pagination;

  const { create, update, remove } = useClientActions(activeBranchId);
  const isMutating = create.isPending || update.isPending || remove.isPending;

  const summary = useMemo(() => {
    const total = pagination?.total ?? clients.length;
    const active = clients.filter((client) => client.status !== "inactive")
      .length;
    const vip = clients.filter((client) => client.status === "vip").length;
    const recent = clients.filter((client) => client.status === "new").length;
    return { total, active, vip, recent };
  }, [clients, pagination?.total]);

  const openCreateModal = () => {
    setSelectedClient(null);
    setFormState(INITIAL_FORM);
    setIsFormOpen(true);
  };

  const openEditModal = (client: OwnerClient) => {
    setSelectedClient(client);
    setFormState({
      fullName: client.fullName,
      phoneNumber: client.phoneNumber,
      email: client.email || "",
      notes: client.notes || "",
      tags: client.tags || [],
    });
    setIsFormOpen(true);
  };

  const openViewModal = (client: OwnerClient) => {
    setSelectedClient(client);
    setIsViewOpen(true);
  };

  const handleSubmit = async () => {
    if (!formState.fullName || !formState.phoneNumber) {
      toast.error("Name and phone number are required");
      return;
    }
    try {
      if (selectedClient) {
        await update.mutateAsync({
          id: selectedClient._id,
          data: formState,
        });
        toast.success("Client updated");
      } else {
        await create.mutateAsync({
          ...formState,
          branchId: activeBranchId || undefined,
        });
        toast.success("Client created");
      }
      setIsFormOpen(false);
    } catch (error: any) {
      toast.error(error?.message || "Unable to save client");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove.mutateAsync(id);
      toast.success("Client deleted");
    } catch (error: any) {
      toast.error(error?.message || "Unable to delete client");
    }
  };

  if (!activeBranchId) {
    return (
      <EmptyState
        title="Select a branch"
        description="Choose a branch to manage clients."
      />
    );
  }

  return (
    <div className="space-y-6">
      <EntityPageHeader
        title="Clients"
        description="Manage salon clients and their contact information."
        onCreate={openCreateModal}
        createLabel="Add Client"
        isCreateDisabled={!activeBranchId}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">
                  Total Clients
                </p>
                <div className="text-2xl text-foreground mb-1">
                  {summary.total}
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
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
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">VIP</p>
                <div className="text-2xl text-foreground mb-1">
                  {summary.vip}
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">New</p>
                <div className="text-2xl text-foreground mb-1">
                  {summary.recent}
                </div>
              </div>
              <div className="shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-blue-600" />
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
                placeholder="Search clients..."
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
              </CardContent>
            </Card>
          ))}
        </div>
      ) : clients.length === 0 ? (
        <EmptyState
          title="No clients yet"
          description="Add clients as they complete onboarding."
          actionLabel="Add client"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {clients.map((client) => (
            <Card key={client._id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>{client.fullName}</CardTitle>
                <Badge>{client.status || "active"}</Badge>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {client.phoneNumber}
                </div>
                {client.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {client.email}
                  </div>
                )}
                {client.tags && client.tags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    <div className="flex flex-wrap gap-1">
                      {client.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex items-center justify-end gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => openViewModal(client)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => openEditModal(client)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <ConfirmDialog
                  title="Delete client"
                  description="This action archives the client for this tenant."
                  onConfirm={() => handleDelete(client._id)}
                  trigger={
                    <Button size="icon" variant="ghost">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  }
                  disabled={remove.isPending}
                />
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
              {selectedClient ? "Edit Client" : "Add Client"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {selectedClient
                ? "Update client details."
                : "Enter client details."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input
                value={formState.fullName}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    fullName: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Phone number</Label>
              <Input
                value={formState.phoneNumber}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    phoneNumber: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formState.email}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    email: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Tags (comma separated)</Label>
              <Input
                value={formState.tags.join(", ")}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    tags: event.target.value
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                value={formState.notes}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    notes: event.target.value,
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
            <DialogTitle>{selectedClient?.fullName}</DialogTitle>
            <DialogDescription className="sr-only">
              Review client details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div>Phone: {selectedClient?.phoneNumber || "—"}</div>
            <div>Email: {selectedClient?.email || "—"}</div>
            <div>Notes: {selectedClient?.notes || "—"}</div>
            <div>
              Tags:{" "}
              {selectedClient?.tags && selectedClient.tags.length > 0
                ? selectedClient.tags.join(", ")
                : "—"}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
