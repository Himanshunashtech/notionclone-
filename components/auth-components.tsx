"use client";

import { useAuthModal } from "@/hooks/use-auth-modal";
import { useSupabaseAuth, useSupabaseUser } from "./providers/supabase-provider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { LogOut, User as UserIcon } from "lucide-react";
import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  mode?: "modal" | "redirect";
}

export const SignInButton = ({ children, mode = "modal" }: ButtonProps) => {
  const authModal = useAuthModal();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    authModal.onOpen("login");
  };

  if (React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick,
    });
  }

  return (
    <Button onClick={handleClick} variant="ghost" size="sm">
      {children}
    </Button>
  );
};

export const SignUpButton = ({ children, mode = "modal" }: ButtonProps) => {
  const authModal = useAuthModal();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    authModal.onOpen("signup");
  };

  if (React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick,
    });
  }

  return (
    <Button onClick={handleClick} size="sm">
      {children}
    </Button>
  );
};

export const SignOutButton = ({ children }: { children?: React.ReactNode }) => {
  const { signOut } = useSupabaseAuth();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    await signOut();
  };

  if (children && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick,
    });
  }

  return (
    <Button onClick={handleClick} variant="ghost" size="sm">
      Sign Out
    </Button>
  );
};

export const UserButton = ({ afterSignOutUrl }: { afterSignOutUrl?: string }) => {
  const { user } = useSupabaseUser();
  const { signOut } = useSupabaseAuth();

  if (!user) return null;

  const initials = user.fullName ? user.fullName.substring(0, 2).toUpperCase() : "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="outline-none focus:ring-0 ring-offset-0">
          <Avatar className="h-8 w-8 hover:opacity-80 transition cursor-pointer">
            <AvatarImage src={user.imageUrl} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60 dark:bg-dark" align="end" alignOffset={11} forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none truncate">{user.fullName}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user.emailAddresses[0]?.emailAddress}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-red-500 hover:text-red-500 hover:bg-red-500/10 focus:text-red-500 focus:bg-red-500/10">
          <LogOut className="h-4 w-4 mr-2" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
