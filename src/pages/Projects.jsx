import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "../components/Navbar";
import ClientCard from "../components/ClientCard";
import { supabase } from "../lib/supabase";

const Projects = () => {
  const queryClient = useQueryClient();
  const [language, setLanguage] = useState("en");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    productName: "",
    country: "",
    price: "",
    status: "Active",
    problems: ["", "", ""],
    targetCustomers: "",
    warranty: "",
    promotion: "",
    uniqueness: "",
  });
  const [errors, setErrors] = useState({});

  // Fetch current user
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    },
  });

  // Fetch clients using TanStack Query (only for current user)
  const {
    data: clients = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["clients", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Create client mutation
  const createClient = useMutation({
    mutationFn: async (newClient) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("clients")
        .insert([{ ...newClient, user_id: user.id }])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients", user?.id] });
      alert("បង្កើតអតិថិជនថ្មីជោគជ័យ! ✓");
      setIsModalOpen(false);
      setFormData({
        productName: "",
        country: "",
        price: "",
        status: "Active",
        problems: ["", "", ""],
        targetCustomers: "",
        warranty: "",
        promotion: "",
        uniqueness: "",
      });
      setErrors({});
    },
    onError: (error) => {
      console.error("Error saving to database:", error);
      alert("មានបញ្ហាក្នុងការរក្សាទុក។ សូមព្យាយាមម្តងទៀត។");
    },
  });

  const translations = {
    en: {
      myProjects: "My Projects",
      createNewClient: "Create New Client",
      clickToCreate: "Click to create a new client project",
    },
    km: {
      myProjects: "គម្រោងរបស់ខ្ញុំ",
      createNewClient: "បង្កើតអតិថិជនថ្មី",
      clickToCreate: "ចុចដើម្បីបង្កើតគម្រោងអតិថិជនថ្មី",
    },
  };

  const t = translations[language];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#cce49e" }}
    >
      <Navbar language={language} setLanguage={setLanguage} />

      {/* Projects Section */}
      <main className="grow py-16 px-6" style={{ backgroundColor: "#ffffff" }}>
        <div className="container mx-auto max-w-6xl">
          <h1
            className="text-5xl font-light mb-12"
            style={{ color: "#297fb2" }}
          >
            {t.myProjects}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Loading State */}
            {isLoading && (
              <div className="col-span-full text-center py-12">
                <div
                  className="inline-block animate-spin rounded-full h-12 w-12 border-b-2"
                  style={{ borderColor: "#297fb2" }}
                ></div>
                <p className="mt-4 font-light" style={{ color: "#297fb2" }}>
                  Loading projects...
                </p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="col-span-full text-center py-12">
                <p className="font-light text-red-500">
                  Error loading projects: {error.message}
                </p>
              </div>
            )}

            {/* Client Cards from Database */}
            {!isLoading &&
              !error &&
              clients.map((client) => (
                <ClientCard key={client.id} client={client} />
              ))}

            {/* Create New Client Card */}
            {!isLoading && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="rounded-lg overflow-hidden shadow-lg transition duration-300 hover:shadow-xl flex flex-col items-center justify-center p-8 min-h-96"
                style={{
                  backgroundColor: "#ffffff",
                  border: "2px dashed #297fb2",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f0f9ff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#ffffff";
                }}
              >
                <div className="text-6xl mb-4" style={{ color: "#297fb2" }}>
                  +
                </div>
                <h3
                  className="text-2xl font-light mb-2"
                  style={{ color: "#297fb2" }}
                >
                  {t.createNewClient}
                </h3>
                <p
                  className="text-center font-light"
                  style={{ color: "#6b7280" }}
                >
                  {t.clickToCreate}
                </p>
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Create Client Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-light" style={{ color: "#297fb2" }}>
                បង្កើតអតិថិជនថ្មី
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-4xl font-light"
                style={{ color: "#297fb2" }}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const newErrors = {};

                if (!formData.productName) newErrors.productName = "Required";
                if (!formData.country) newErrors.country = "Required";
                if (!formData.price) newErrors.price = "Required";
                if (formData.problems.filter((p) => p.trim()).length < 3)
                  newErrors.problems = "សូមផ្តល់យ៉ាងតិច ៣ចម្លើយ";
                if (!formData.targetCustomers)
                  newErrors.targetCustomers = "Required";
                if (!formData.warranty) newErrors.warranty = "Required";
                if (!formData.promotion) newErrors.promotion = "Required";
                if (!formData.uniqueness) newErrors.uniqueness = "Required";

                if (Object.keys(newErrors).length > 0) {
                  setErrors(newErrors);
                  return;
                }

                // Use mutation to create client
                createClient.mutate({
                  product_name: formData.productName,
                  country: formData.country,
                  price: formData.price,
                  status: formData.status,
                  problems: formData.problems.filter((p) => p.trim()),
                  target_customers: formData.targetCustomers,
                  warranty: formData.warranty,
                  promotion: formData.promotion,
                  uniqueness: formData.uniqueness,
                });
              }}
            >
              {/* Question 1 */}
              <div className="mb-6">
                <label
                  className="block font-light mb-2"
                  style={{ color: "#297fb2" }}
                >
                  1. ផលិតឈ្មោះអ្វី? ផលិតពីប្រទេសណា? តម្លៃប៉ុន្មាន? *
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="ឈ្មោះផលិតផល"
                    value={formData.productName}
                    onChange={(e) =>
                      setFormData({ ...formData, productName: e.target.value })
                    }
                    className="w-full p-3 border rounded font-light"
                    style={{
                      borderColor: errors.productName ? "#ef4444" : "#e5e7eb",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="ប្រទេសផលិត"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    className="w-full p-3 border rounded font-light"
                    style={{
                      borderColor: errors.country ? "#ef4444" : "#e5e7eb",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="តម្លៃ"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full p-3 border rounded font-light"
                    style={{
                      borderColor: errors.price ? "#ef4444" : "#e5e7eb",
                    }}
                  />
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full p-3 border rounded font-light"
                    style={{ borderColor: "#e5e7eb", color: "#6b7280" }}
                  >
                    <option value="Active">Active</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
              </div>

              {/* Question 2 */}
              <div className="mb-6">
                <label
                  className="block font-light mb-2"
                  style={{ color: "#297fb2" }}
                >
                  2. តើផលិតផលនេះជួយដោះស្រាយបញ្ហាអ្វីខ្លះ? (សុំ៣ទៅ៦ចម្លើយ) *
                </label>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <input
                    key={index}
                    type="text"
                    placeholder={`ចម្លើយទី ${index + 1}${index < 3 ? " *" : ""}`}
                    value={formData.problems[index] || ""}
                    onChange={(e) => {
                      const newProblems = [...formData.problems];
                      newProblems[index] = e.target.value;
                      setFormData({ ...formData, problems: newProblems });
                    }}
                    className="w-full p-3 border rounded font-light mb-3"
                    style={{
                      borderColor:
                        errors.problems && index < 3 ? "#ef4444" : "#e5e7eb",
                    }}
                  />
                ))}
                {errors.problems && (
                  <p className="text-red-500 text-sm">{errors.problems}</p>
                )}
              </div>

              {/* Question 3 */}
              <div className="mb-6">
                <label
                  className="block font-light mb-2"
                  style={{ color: "#297fb2" }}
                >
                  3. អតិថិជនគោលដៅរបស់បងបែបណាដែរ? (អាយុ ភេទ និងផ្សេងៗ) *
                </label>
                <textarea
                  placeholder="ពិពណ៌នាអំពីអតិថិជនគោលដៅ"
                  value={formData.targetCustomers}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      targetCustomers: e.target.value,
                    })
                  }
                  className="w-full p-3 border rounded font-light h-24"
                  style={{
                    borderColor: errors.targetCustomers ? "#ef4444" : "#e5e7eb",
                  }}
                />
              </div>

              {/* Question 4 */}
              <div className="mb-6">
                <label
                  className="block font-light mb-2"
                  style={{ color: "#297fb2" }}
                >
                  4. តើយើងមានការធានាអត់? *
                </label>
                <textarea
                  placeholder="ពិពណ៌នាអំពីការធានា"
                  value={formData.warranty}
                  onChange={(e) =>
                    setFormData({ ...formData, warranty: e.target.value })
                  }
                  className="w-full p-3 border rounded font-light h-20"
                  style={{
                    borderColor: errors.warranty ? "#ef4444" : "#e5e7eb",
                  }}
                />
              </div>

              {/* Question 5 */}
              <div className="mb-6">
                <label
                  className="block font-light mb-2"
                  style={{ color: "#297fb2" }}
                >
                  5. តើយើងមានប្រម៉ូសិនអត់? *
                </label>
                <textarea
                  placeholder="ពិពណ៌នាអំពីប្រម៉ូសិន"
                  value={formData.promotion}
                  onChange={(e) =>
                    setFormData({ ...formData, promotion: e.target.value })
                  }
                  className="w-full p-3 border rounded font-light h-20"
                  style={{
                    borderColor: errors.promotion ? "#ef4444" : "#e5e7eb",
                  }}
                />
              </div>

              {/* Question 6 */}
              <div className="mb-6">
                <label
                  className="block font-light mb-2"
                  style={{ color: "#297fb2" }}
                >
                  6. អ្វីដែលផលិតយើងខុសពីដៃគូរប្រកួតប្រជែងរបស់យើង *
                </label>
                <textarea
                  placeholder="ពិពណ៌នាអំពីភាពខុសគ្នា"
                  value={formData.uniqueness}
                  onChange={(e) =>
                    setFormData({ ...formData, uniqueness: e.target.value })
                  }
                  className="w-full p-3 border rounded font-light h-24"
                  style={{
                    borderColor: errors.uniqueness ? "#ef4444" : "#e5e7eb",
                  }}
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={createClient.isPending}
                  className="flex-1 py-3 rounded font-light transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "#297fb2", color: "#ffffff" }}
                  onMouseEnter={(e) =>
                    !createClient.isPending && (e.target.style.opacity = "0.9")
                  }
                  onMouseLeave={(e) =>
                    !createClient.isPending && (e.target.style.opacity = "1")
                  }
                >
                  {createClient.isPending ? "កំពុងបង្កើត..." : "បង្កើត"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={createClient.isPending}
                  className="flex-1 py-3 rounded font-light transition duration-200 disabled:opacity-50"
                  style={{ border: "1px solid #297fb2", color: "#297fb2" }}
                >
                  បោះបង់
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
