import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Phone, Mail, Tag, Eye, Pencil, Trash2 } from "lucide-react";
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
  const clients = data?.items ?? [];
  const pagination = data?.pagination;

  const { create, update, remove } = useClientActions(activeBranchId);
  const isMutating = create.isPending || update.isPending || remove.isPending;

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
        searchValue={search}
        onSearchChange={setSearch}
        onCreate={openCreateModal}
        createLabel="Add Client"
        isCreateDisabled={!activeBranchId}
      />

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
