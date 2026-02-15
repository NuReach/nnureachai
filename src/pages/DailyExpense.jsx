import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useAuth";
import {
  useExpenseCategories,
  useExpenses,
  useExpenseSummary,
  useCreateExpenseCategory,
  useDeleteExpenseCategory,
  useCreateExpense,
  useDeleteExpense,
} from "../hooks/useExpenses";
import {
  Wallet,
  Plus,
  Trash2,
  Calendar,
  Tag,
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  LayoutGrid,
  CreditCard,
  X,
  Filter,
  CalendarRange,
  ChevronDown,
  Loader2,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";

const DailyExpense = () => {
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newExpense, setNewExpense] = useState({
    amount: "",
    category_id: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    type: "expense",
  });
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: "",
    to: "",
  });
  const navigate = useNavigate();

  // TanStack Query hooks
  const { data: user, isLoading: userLoading } = useUser();
  const { data: categories = [], isLoading: categoriesLoading } =
    useExpenseCategories();

  // Paginated expenses for the transaction list
  const {
    data: expensesData,
    isLoading: expensesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useExpenses();

  // Lightweight summary for stats (all expenses, minimal fields)
  const { data: expenseSummary = [], isLoading: summaryLoading } =
    useExpenseSummary();

  // Flatten paginated pages into a single array
  const expenses = expensesData?.pages?.flatMap((page) => page.data) ?? [];

  const createCategoryMutation = useCreateExpenseCategory();
  const deleteCategoryMutation = useDeleteExpenseCategory();
  const createExpenseMutation = useCreateExpense();
  const deleteExpenseMutation = useDeleteExpense();

  const loading = expensesLoading || categoriesLoading || summaryLoading;

  // Redirect if not logged in
  useEffect(() => {
    if (!userLoading && !user) {
      navigate("/login");
    }
  }, [user, userLoading, navigate]);

  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!newCategory.trim() || !user) return;

    createCategoryMutation.mutate(
      {
        name: newCategory,
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        user_id: user.id,
      },
      {
        onSuccess: () => {
          setNewCategory("");
          setShowCategoryForm(false);
        },
        onError: (error) => {
          console.error("Error creating category:", error);
          alert("Failed to create category");
        },
      },
    );
  };

  const handleCreateExpense = (e) => {
    e.preventDefault();
    if (!newExpense.amount || !newExpense.category_id || !user) return;

    createExpenseMutation.mutate(
      {
        amount: parseFloat(newExpense.amount),
        category_id: newExpense.category_id,
        description: newExpense.description,
        date: newExpense.date,
        type: newExpense.type,
        user_id: user.id,
      },
      {
        onSuccess: () => {
          setNewExpense({
            amount: "",
            category_id: "",
            description: "",
            date: new Date().toISOString().split("T")[0],
            type: "expense",
          });
          setShowExpenseForm(false);
        },
        onError: (error) => {
          console.error("Error creating expense:", error);
          alert("Failed to create expense");
        },
      },
    );
  };

  const handleDeleteCategory = (id) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    deleteCategoryMutation.mutate(id, {
      onError: (error) => {
        console.error("Error deleting category:", error);
        alert("Failed to delete category");
      },
    });
  };

  const handleDeleteExpense = (id) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    deleteExpenseMutation.mutate(id, {
      onError: (error) => {
        console.error("Error deleting expense:", error);
        alert("Failed to delete expense");
      },
    });
  };

  // Filter expenses based on active filter
  const applyFilter = (items) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (activeFilter) {
      case "7days": {
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return items.filter((e) => new Date(e.date) >= sevenDaysAgo);
      }
      case "month": {
        const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return items.filter((e) => new Date(e.date) >= firstOfMonth);
      }
      case "range": {
        if (!dateRange.from || !dateRange.to) return items;
        const from = new Date(dateRange.from);
        const to = new Date(dateRange.to);
        to.setHours(23, 59, 59, 999);
        return items.filter((e) => {
          const d = new Date(e.date);
          return d >= from && d <= to;
        });
      }
      default:
        return items;
    }
  };

  // Apply type filter
  const applyTypeFilter = (items) => {
    if (transactionTypeFilter === "all") return items;
    return items.filter((e) => (e.type || "expense") === transactionTypeFilter);
  };

  // Filtered paginated expenses for the transaction list
  const filteredExpenses = applyTypeFilter(applyFilter(expenses));

  // Filtered summary data for accurate stats (uses ALL expenses, not paginated)
  const filteredSummary = applyFilter(expenseSummary);

  const getFilterLabel = () => {
    switch (activeFilter) {
      case "7days":
        return "Last 7 Days";
      case "month":
        return "This Month";
      case "range":
        return dateRange.from && dateRange.to
          ? `${dateRange.from} — ${dateRange.to}`
          : "Date Range";
      default:
        return "All Time";
    }
  };

  // Use filteredSummary (all expenses) for accurate calculations
  const calculateTotalByFilteredCategory = () => {
    const totals = {};
    filteredSummary
      .filter((e) => (e.type || "expense") === "expense")
      .forEach((expense) => {
        const categoryName =
          expense.expense_categories?.name || "Uncategorized";
        const categoryColor = expense.expense_categories?.color || "#888888";
        if (!totals[categoryName]) {
          totals[categoryName] = { amount: 0, color: categoryColor };
        }
        totals[categoryName].amount += parseFloat(expense.amount);
      });
    return totals;
  };

  const calculateIncomeByFilteredCategory = () => {
    const totals = {};
    filteredSummary
      .filter((e) => (e.type || "expense") === "income")
      .forEach((income) => {
        const categoryName = income.expense_categories?.name || "Uncategorized";
        const categoryColor = income.expense_categories?.color || "#888888";
        if (!totals[categoryName]) {
          totals[categoryName] = { amount: 0, color: categoryColor };
        }
        totals[categoryName].amount += parseFloat(income.amount);
      });
    return totals;
  };

  const getFilteredTotalExpenses = () => {
    return filteredSummary
      .filter((e) => (e.type || "expense") === "expense")
      .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  };

  const getFilteredTotalIncome = () => {
    return filteredSummary
      .filter((e) => (e.type || "expense") === "income")
      .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  };

  const categoryTotals = calculateTotalByFilteredCategory();
  const incomeTotals = calculateIncomeByFilteredCategory();
  const totalExpenses = getFilteredTotalExpenses();
  const totalIncome = getFilteredTotalIncome();
  const netBalance = totalIncome - totalExpenses;

  // Sort categories by spend amount for chart
  const sortedCategories = Object.entries(categoryTotals).sort(
    (a, b) => b[1].amount - a[1].amount,
  );

  // Sort income categories by amount
  const sortedIncomeCategories = Object.entries(incomeTotals).sort(
    (a, b) => b[1].amount - a[1].amount,
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Wallet className="w-8 h-8 text-blue-600" />
              Daily Expenses
            </h1>
            <p className="text-gray-500 mt-1">
              Track your spending and manage your budget
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCategoryForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition shadow-sm"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Categories</span>
            </button>
            <button
              onClick={() => {
                setNewExpense({ ...newExpense, type: "income" });
                setShowExpenseForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm"
            >
              <ArrowUpCircle className="w-4 h-4" />
              <span>Add Income</span>
            </button>
            <button
              onClick={() => {
                setNewExpense({ ...newExpense, type: "expense" });
                setShowExpenseForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
            >
              <ArrowDownCircle className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <Filter className="w-4 h-4" />
              <span>Filter by:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setActiveFilter("all");
                  setShowFilterDropdown(false);
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                  activeFilter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => {
                  setActiveFilter("7days");
                  setShowFilterDropdown(false);
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                  activeFilter === "7days"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => {
                  setActiveFilter("month");
                  setShowFilterDropdown(false);
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                  activeFilter === "month"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => {
                  setActiveFilter("range");
                  setShowFilterDropdown(!showFilterDropdown);
                }}
                className={`flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-medium transition ${
                  activeFilter === "range"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <CalendarRange className="w-3.5 h-3.5" />
                Date Range
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Date Range Picker */}
          {activeFilter === "range" && showFilterDropdown && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-end gap-4">
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  From
                </label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, from: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  To
                </label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, to: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => setShowFilterDropdown(false)}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
              >
                Apply
              </button>
            </div>
          )}
        </div>

        {/* Stats Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <ArrowUpCircle className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Income</p>
              <h3 className="text-2xl font-bold text-green-600">
                ${totalIncome.toFixed(2)}
              </h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
              <ArrowDownCircle className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Spent</p>
              <h3 className="text-2xl font-bold text-red-600">
                ${totalExpenses.toFixed(2)}
              </h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <DollarSign className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Net Balance</p>
              <h3
                className={`text-2xl font-bold ${netBalance >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {netBalance >= 0 ? "+" : "-"}${Math.abs(netBalance).toFixed(2)}
              </h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Transactions</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {filteredSummary.length}
              </h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main List Section (Left) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-gray-50/50">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-gray-500" />
                  Recent Transactions
                </h2>
                <div className="flex items-center gap-3">
                  <div className="flex bg-gray-100 rounded-lg p-0.5">
                    <button
                      onClick={() => setTransactionTypeFilter("all")}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                        transactionTypeFilter === "all"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setTransactionTypeFilter("income")}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                        transactionTypeFilter === "income"
                          ? "bg-white text-green-600 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Income
                    </button>
                    <button
                      onClick={() => setTransactionTypeFilter("expense")}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                        transactionTypeFilter === "expense"
                          ? "bg-white text-red-600 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Expense
                    </button>
                  </div>
                  <div className="flex gap-2 items-center text-sm text-blue-600 font-medium">
                    <Filter className="w-4 h-4" />
                    <span>{getFilterLabel()}</span>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="p-12 text-center text-gray-500">
                  Loading transactions...
                </div>
              ) : filteredExpenses.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {filteredExpenses.map((expense) => {
                    const isIncome = (expense.type || "expense") === "income";
                    return (
                      <div
                        key={expense.id}
                        className="p-4 hover:bg-gray-50 transition flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${
                              isIncome
                                ? "bg-green-100 text-green-600"
                                : "text-white"
                            }`}
                            style={
                              isIncome
                                ? {}
                                : {
                                    backgroundColor:
                                      expense.expense_categories?.color ||
                                      "#94a3b8",
                                  }
                            }
                          >
                            {isIncome ? (
                              <ArrowUpCircle className="w-5 h-5" />
                            ) : (
                              <Tag className="w-5 h-5 opacity-90" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900">
                                {expense.expense_categories?.name ||
                                  "Uncategorized"}
                              </p>
                              <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                                  isIncome
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {isIncome ? "Income" : "Expense"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(expense.date).toLocaleDateString()}
                              </span>
                              {expense.description && (
                                <>
                                  <span>•</span>
                                  <span>{expense.description}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span
                            className={`font-bold ${isIncome ? "text-green-600" : "text-red-600"}`}
                          >
                            {isIncome ? "+" : "-"} $
                            {parseFloat(expense.amount).toFixed(2)}
                          </span>
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">
                    No transactions yet
                  </h3>
                  <p className="text-gray-500 mt-1">
                    Add your first transaction to see it here.
                  </p>
                </div>
              )}

              {/* Load More Pagination */}
              {hasNextPage && filteredExpenses.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="w-full py-2.5 text-sm font-medium text-blue-600 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isFetchingNextPage ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading more...
                      </>
                    ) : (
                      "Load More Transactions"
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Section (Right) */}
          <div className="space-y-6">
            {/* Income Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <ArrowUpCircle className="w-5 h-5 text-green-500" />
                Income Breakdown
              </h2>

              {sortedIncomeCategories.length > 0 ? (
                <div className="space-y-4">
                  {sortedIncomeCategories.map(([category, data]) => {
                    const percentage =
                      totalIncome > 0 ? (data.amount / totalIncome) * 100 : 0;
                    return (
                      <div key={category}>
                        <div className="flex justify-between items-center mb-1 text-sm">
                          <span className="font-medium text-gray-700">
                            {category}
                          </span>
                          <span className="text-green-600 font-semibold">
                            ${data.amount.toFixed(0)} ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              backgroundColor: data.color,
                              width: `${percentage}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  No income data to display
                </p>
              )}
            </div>

            {/* Spending Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <ArrowDownCircle className="w-5 h-5 text-red-500" />
                Spending Breakdown
              </h2>

              {sortedCategories.length > 0 ? (
                <div className="space-y-4">
                  {sortedCategories.map(([category, data]) => {
                    const percentage =
                      totalExpenses > 0
                        ? (data.amount / totalExpenses) * 100
                        : 0;
                    return (
                      <div key={category}>
                        <div className="flex justify-between items-center mb-1 text-sm">
                          <span className="font-medium text-gray-700">
                            {category}
                          </span>
                          <span className="text-red-600 font-semibold">
                            ${data.amount.toFixed(0)} ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              backgroundColor: data.color,
                              width: `${percentage}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  No expense data to display
                </p>
              )}
            </div>

            {/* Quick Categories List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Categories
                </h2>
                <button
                  onClick={() => setShowCategoryForm(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  Manage
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <span
                    key={cat.id}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200"
                    style={{
                      borderLeftColor: cat.color,
                      borderLeftWidth: "4px",
                    }}
                  >
                    {cat.name}
                  </span>
                ))}
                {categories.length === 0 && (
                  <p className="text-gray-500 text-sm">
                    No categories created.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Transaction Modal */}
      {showExpenseForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div
              className={`px-6 py-4 border-b border-gray-100 flex justify-between items-center ${
                newExpense.type === "income" ? "bg-green-50" : "bg-gray-50"
              }`}
            >
              <h2 className="text-xl font-bold text-gray-800">
                {newExpense.type === "income" ? "Add Income" : "Add Expense"}
              </h2>
              <button
                onClick={() => setShowExpenseForm(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="p-6 space-y-4">
              {/* Type Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Type
                </label>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() =>
                      setNewExpense({ ...newExpense, type: "expense" })
                    }
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
                      newExpense.type === "expense"
                        ? "bg-white text-red-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <ArrowDownCircle className="w-4 h-4" />
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setNewExpense({ ...newExpense, type: "income" })
                    }
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
                      newExpense.type === "income"
                        ? "bg-white text-green-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <ArrowUpCircle className="w-4 h-4" />
                    Income
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount ($)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={newExpense.amount}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, amount: e.target.value })
                    }
                    className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newExpense.category_id}
                  onChange={(e) =>
                    setNewExpense({
                      ...newExpense,
                      category_id: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <div className="mt-1 text-xs text-amber-600">
                    You need to create categories first.
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newExpense.date}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, date: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={newExpense.description}
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={
                      newExpense.type === "income"
                        ? "e.g. Salary"
                        : "e.g. Lunch"
                    }
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowExpenseForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createExpenseMutation.isPending}
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                    newExpense.type === "income"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {createExpenseMutation.isPending
                    ? "Saving..."
                    : newExpense.type === "income"
                      ? "Save Income"
                      : "Save Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">
                Manage Categories
              </h2>
              <button
                onClick={() => setShowCategoryForm(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleCreateCategory} className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Category Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Transport"
                    required
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={createCategoryMutation.isPending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createCategoryMutation.isPending ? "Adding..." : "Add"}
                  </button>
                </div>
              </form>

              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                  Existing Categories
                </h3>
                {categories.length > 0 ? (
                  <div className="max-h-75 overflow-y-auto space-y-2 pr-2">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full shadow-sm"
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <span className="font-medium text-gray-800">
                            {category.name}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-gray-400 hover:text-red-600 transition opacity-0 group-hover:opacity-100"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-4 italic">
                    No categories yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyExpense;
