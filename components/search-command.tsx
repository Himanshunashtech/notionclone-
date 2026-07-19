"use client";

import { useEffect, useState } from "react";
import { File } from "lucide-react";
import { useQuery } from "@/hooks/use-supabase-db";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/providers/supabase-provider";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useSearch } from "@/hooks/useSearch";
import { api } from "@/lib/supabase-db";
import { DialogTitle } from "./ui/dialog";
import { useLazySearchDocumentsQuery } from "@/lib/apiSlice";

export const SearchCommand = () => {
  const { user } = useUser();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [triggerSearch, { data: searchResults }] = useLazySearchDocumentsQuery();
  const defaultDocuments = useQuery(api.documents.getSearch);
  const [isMounted, setIsMounted] = useState(false);

  const toggle = useSearch((store) => store.toggle);
  const isOpen = useSearch((store) => store.isOpen);
  const onClose = useSearch((store) => store.onClose);

  useEffect(() => {
    if (!user?.id) return;
    if (search.trim().length > 1) {
      const delayDebounceFn = setTimeout(() => {
        triggerSearch({ userId: user.id, query: search });
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [search, user?.id, triggerSearch]);

  const documents = search.trim().length > 1 ? searchResults : defaultDocuments;

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
    }
  }, [isOpen]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggle]);

  const onSelect = (id: string) => {
    router.push(`/documents/${id}`);
    onClose();
  };

  if (!isMounted) {
    return null;
  }

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <DialogTitle hidden>Search Documents</DialogTitle>
      <Command
        loop
        shouldFilter={search.trim().length <= 1}
        filter={(value, searchVal) => {
          const [documentTitle = ""] = value.split("|");
          if (documentTitle.toLowerCase().includes(searchVal.toLowerCase()))
            return 1;
          return 0;
        }}
      >
        <CommandInput 
          value={search}
          onValueChange={setSearch}
          placeholder={`Search ${user?.fullName}'s Zotion..`} 
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Documents" className="pb-1">
            {documents?.map((document) => (
              <CommandItem
                key={document._id}
                value={`${document.title}|${document._id}`}
                title={document.title}
                onSelect={() => onSelect(document._id)}
              >
                {document.icon ? (
                  <p className="mr-2 text-[1.125rem] leading-0">
                    {document.icon}
                  </p>
                ) : (
                  <File className="mr-2 h-4 w-4" />
                )}
                <span>{document.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
};
