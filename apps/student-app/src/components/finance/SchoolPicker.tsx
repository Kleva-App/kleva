import { Check, ChevronsUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@nudle/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@nudle/ui/command";
import { Label } from "@nudle/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@nudle/ui/popover";
import { schoolLevelLabel, searchSchools, type ZimbabweSchool } from "@/lib/zimbabwe-schools";
import { cn } from "@/lib/utils";

export function SchoolPicker({
  schools,
  selectedId,
  onSelect,
}: {
  schools: ZimbabweSchool[];
  selectedId: string;
  onSelect: (school: ZimbabweSchool) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const { matches, total, needsQuery } = useMemo(
    () => searchSchools(schools, query),
    [schools, query],
  );

  const selected = schools.find((s) => s.id === selectedId) ?? null;

  return (
    <div className="space-y-2">
      <Label>School</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-auto min-h-10 w-full justify-between px-3 py-2 font-normal"
          >
            {selected ? (
              <span className="flex min-w-0 flex-col items-start text-left">
                <span className="truncate">{selected.name}</span>
                <span className="text-xs text-muted-foreground">
                  {schoolLevelLabel(selected.level)} · {selected.district}, {selected.province}
                </span>
              </span>
            ) : (
              <span className="text-muted-foreground">Search by school name</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Type a school name"
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              <CommandEmpty>
                {needsQuery ? "Type at least 2 letters to search." : "No matching school."}
              </CommandEmpty>
              <CommandGroup>
                {matches.map((school) => (
                  <CommandItem
                    key={school.id}
                    value={school.id}
                    onSelect={() => {
                      onSelect(school);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedId === school.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate">{school.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {schoolLevelLabel(school.level)} · {school.district}, {school.province}
                      </span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <p className="text-xs text-muted-foreground">
        {needsQuery
          ? "Type at least 2 letters of the school name."
          : total === 0
            ? "No schools match that search."
            : total > matches.length
              ? `Showing ${matches.length} of ${total.toLocaleString()} matches. Type more of the name to narrow the list.`
              : `${total.toLocaleString()} matching ${total === 1 ? "school" : "schools"}.`}
      </p>
    </div>
  );
}
