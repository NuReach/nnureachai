import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

const PAGE_SIZE = 12;

// Fetch all expense categories
export function useExpenseCategories() {
  return useQuery({
    queryKey: ["expense_categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expense_categories")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });
}

// Fetch expenses with infinite scroll pagination
export function useExpenses() {
  return useInfiniteQuery({
    queryKey: ["expenses"],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error, count } = await supabase
        .from("expenses")
        .select("*, expense_categories(name, color)", { count: "exact" })
        .order("date", { ascending: false })
        .range(from, to);

      if (error) throw error;
      return { data, count, page: pageParam };
    },
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.page + 1;
      const totalPages = Math.ceil((lastPage.count || 0) / PAGE_SIZE);
      return nextPage < totalPages ? nextPage : undefined;
    },
    initialPageParam: 0,
  });
}

// Lightweight query for stats — fetches only amounts, type, and category info
export function useExpenseSummary() {
  return useQuery({
    queryKey: ["expenses_summary"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("amount, date, type, expense_categories(name, color)");

      if (error) throw error;
      return data;
    },
  });
}

// Create a new expense category
export function useCreateExpenseCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newCategory) => {
      const { data, error } = await supabase
        .from("expense_categories")
        .insert([newCategory])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense_categories"] });
    },
  });
}

// Delete an expense category
export function useDeleteExpenseCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from("expense_categories")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense_categories"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenses_summary"] });
    },
  });
}

// Create a new expense
export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newExpense) => {
      const { data, error } = await supabase
        .from("expenses")
        .insert([newExpense])
        .select("*, expense_categories(name, color)")
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenses_summary"] });
    },
  });
}

// Delete an expense
export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("expenses").delete().eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenses_summary"] });
    },
  });
}
