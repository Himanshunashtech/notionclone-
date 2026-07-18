"use client";

import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton } from "@/components/auth-components";
import { useConvexAuth } from "@/components/providers/supabase-provider";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const Heading = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-3xl font-bold sm:text-5xl md:text-5xl leading-tight">
        Your Ideas<span className="inline-block text-4xl sm:text-6xl md:text-6xl mx-1.5 transition duration-200 hover:scale-125 select-none hover:rotate-12 cursor-default">💡</span>, Documents<span className="inline-block text-4xl sm:text-6xl md:text-6xl mx-1.5 transition duration-200 hover:scale-125 select-none hover:-rotate-12 cursor-default">📕</span>, & Plans<span className="inline-block text-4xl sm:text-6xl md:text-6xl mx-1.5 transition duration-200 hover:scale-125 select-none hover:translate-y-[-4px] cursor-default">🚀</span>. Welcome to{" "}
        <span className="underline">Zotion</span>
      </h1>
      <h2 className="text-base font-medium sm:text-xl">
        Zotion is the connected workspace where <br /> better, faster work
        happens.
      </h2>
      {isLoading && (
        <div className="flex w-full items-center justify-center">
          <Spinner size="md" />
        </div>
      )}
      {isAuthenticated && !isLoading && (
        <Button asChild>
          <Link href="/documents">
            Enter Zotion
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      )}
      {!isAuthenticated && !isLoading && (
        <SignUpButton mode="modal">
          <Button>
            Get Zotion free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </SignUpButton>
      )}
    </div>
  );
};
