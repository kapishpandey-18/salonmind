import { Search, Plus } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface EntityPageHeaderProps {
  title: string;
  description?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onCreate?: () => void;
  createLabel?: string;
  isCreateDisabled?: boolean;
}

export function EntityPageHeader({
  title,
  description,
  searchValue,
  onSearchChange,
  onCreate,
  createLabel = "Create",
  isCreateDisabled,
}: EntityPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-foreground">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
        {typeof onSearchChange === "function" && (
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              value={searchValue ?? ""}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search services..."
              className="pl-11 h-12 rounded-xl shadow-sm focus:shadow-md border border-input bg-white"
            />
          </div>
        )}
        {typeof onCreate === "function" && (
          <Button
            onClick={onCreate}
            disabled={isCreateDisabled}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/30 whitespace-nowrap"
          >
            <Plus className="mr-2 h-5 w-5" />
            {createLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
