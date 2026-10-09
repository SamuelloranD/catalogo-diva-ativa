"use client";

import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type CatalogDropdownOption = {
  label: string;
  value: string;
};

type CatalogDropdownProps = {
  label: string;
  value: string;
  options: readonly CatalogDropdownOption[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  showLabel?: boolean;
  compact?: boolean;
  className?: string;
};

export function CatalogDropdown({
  label,
  value,
  options,
  onValueChange,
  placeholder,
  showLabel = true,
  compact = false,
  className,
}: CatalogDropdownProps) {
  const selectedOption = options.find((option) => option.value === value);
  const displayLabel = selectedOption?.label ?? placeholder ?? options[0]?.label;

  if (!displayLabel) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="dropdown"
          className={cn(
            "min-w-56 max-w-none justify-between",
            compact && "catalog-dropdown-trigger-compact",
            className,
          )}
          aria-label={selectedOption ? `${label}: ${selectedOption.label}` : displayLabel}
        >
          {showLabel ? <span className="text-muted-foreground">{label}:</span> : null}
          <span className={cn(!selectedOption && "text-muted-foreground")}>{displayLabel}</span>
          <ChevronDown className="ml-1 text-muted-foreground" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="catalog-dropdown-content">
        <DropdownMenuRadioGroup value={value} onValueChange={onValueChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem
              key={option.value}
              value={option.value}
              className="catalog-dropdown-item"
            >
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
