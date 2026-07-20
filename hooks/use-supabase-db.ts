import { useState, useEffect, useCallback } from "react";
import { useSupabaseAuth } from "@/components/providers/supabase-provider";
import { dbQueries, dbMutations } from "@/lib/supabase-db";

type DbQueries = typeof dbQueries;
type DbMutations = typeof dbMutations;

// A simple client-side event bus to enable reactive query updates on mutation
class DBEventBus {
  private listeners: Record<string, Function[]> = {};

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
  }

  emit(event: string) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach((cb) => cb());
  }
}

export const dbBus = new DBEventBus();

export function useQuery<K extends keyof DbQueries>(
  queryKey: K,
  args?: Parameters<DbQueries[K]>[1] | "skip" | {} | Record<string, any>
): ReturnType<DbQueries[K]> extends Promise<infer U> ? U | undefined : never {
  const { userId, isLoading: authLoading } = useSupabaseAuth();
  const [data, setData] = useState<any>(undefined);

  const fetchData = useCallback(async () => {
    // If the query is marked to skip, do nothing
    if (args === "skip") {
      setData(undefined);
      return;
    }
    
    if (authLoading) return;

    try {
      const queryFn = dbQueries[queryKey];
      if (!queryFn) {
        console.warn(`Query ${queryKey} not found in dbQueries`);
        return;
      }
      
      const result = await (queryFn as any)(userId, args);
      setData(result);
    } catch (error) {
      console.error(`Error executing query ${queryKey}:`, error);
      setData(null);
    }
  }, [userId, authLoading, queryKey, JSON.stringify(args)]);

  useEffect(() => {
    fetchData();

    const handleMutation = () => {
      fetchData();
    };

    dbBus.on("mutation", handleMutation);
    return () => {
      dbBus.off("mutation", handleMutation);
    };
  }, [fetchData]);

  return data as any;
}

export function useMutation<K extends keyof DbMutations>(
  mutationKey: K
): (args?: Parameters<DbMutations[K]>[1]) => Promise<ReturnType<DbMutations[K]> extends Promise<infer U> ? U : never> {
  const { userId } = useSupabaseAuth();

  const mutate = useCallback(
    async (args: any) => {
      if (!userId && mutationKey !== "create") {
        throw new Error("Not authenticated");
      }

      const mutationFn = dbMutations[mutationKey];
      if (!mutationFn) {
        throw new Error(`Mutation ${mutationKey} not found in dbMutations`);
      }

      const result = await (mutationFn as any)(userId || null, args);

      // Emit mutation event to notify all active queries to refresh
      dbBus.emit("mutation");

      return result;
    },
    [userId, mutationKey]
  );

  return mutate as any;
}
