"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/supabase-db";
import { Doc } from "@/lib/supabase-db";
import { useMutation } from "@/hooks/use-supabase-db";
import { ChangeEvent, useRef, useState } from "react";
import { DocumentIcon } from "@/components/document-icon";

interface TitleProps {
  initialData: Doc<"documents">;
}

export const Title = ({ initialData }: TitleProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const update = useMutation(api.documents.update);

  const [title, setTitle] = useState(initialData.title || "Untitled");
  const [isEditing, setIsEditing] = useState(false);

  const enableInput = () => {
    setTitle(initialData.title);
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(0, inputRef.current.value.length);
    }, 0);
  };

  const disabledInput = () => {
    setIsEditing(false);
    update({
      id: initialData._id,
      title: title || "Untitled",
    });
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      disabledInput();
    }
  };

  return (
    <div className="flex min-w-0 items-center gap-x-1">
      {!!initialData.icon && (
        <DocumentIcon icon={initialData.icon} className="mr-2 h-5 w-5 shrink-0 text-lg" />
      )}
      {isEditing ? (
        <Input
          ref={inputRef}
          onClick={enableInput}
          onBlur={disabledInput}
          onChange={onChange}
          onKeyDown={onKeyDown}
          value={title}
          className="h-7 px-2 focus-visible:ring-transparent lg:min-w-120"
        />
      ) : (
        <Button
          onClick={enableInput}
          title={initialData.title}
          variant="ghost"
          size="sm"
          className="h-auto max-w-[45vw] min-w-0 shrink overflow-hidden p-1 text-left font-normal md:max-w-[80vw]"
        >
          <span className="block min-w-0 truncate">{initialData?.title}</span>
        </Button>
      )}
    </div>
  );
};

Title.Skeleton = function TitleSkeleton() {
  return <Skeleton className="h-6 w-20 rounded-md" />;
};
