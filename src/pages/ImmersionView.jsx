import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

const ImmersionView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch client details with immersion data
  const {
    data: client,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["client", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#fafafa" }}
      >
        <div
          className="inline-block animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: "#297fb2" }}
        ></div>
      </div>
    );
  }

  if (error || !client || !client.immersion_data) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ backgroundColor: "#fafafa" }}
      >
        <p className="text-gray-600 mb-4">មិនមានទិន្នន័យ Immersion</p>
        <button
          onClick={() => navigate(`/client/${id}`)}
          className="px-6 py-2 rounded font-light transition duration-200"
          style={{ backgroundColor: "#297fb2", color: "#ffffff" }}
        >
          ត្រលប់ក្រោយ
        </button>
      </div>
    );
  }

  const immersion = client.immersion_data;

  const handleExport = () => {
    if (!immersion || !client) return;

    const typologiesData = immersion.userTypologies
      ? [
          `\n`,
          `V. USER TYPOLOGIES (អ្នកប្រើប្រាស់)`,
          `-----------------------------------`,
          ...immersion.userTypologies.flatMap((typology, index) => [
            `\n${index + 1}. ${typology.typologyName}`,
            `   Mindset (របៀបគិត): ${typology.mindset}`,
            `   Core Pain (ចំណុចឈឺចាប់ស្នូល): ${typology.corePain}`,
            `   Core Desire (បំណងប្រាថ្នាស្នូល): ${typology.coreDesire}`,
            `   Buying Trigger (កត្តាទិញ): ${typology.buyingTrigger}`,
            `   Best Content Angle (មុំមាតិកាល្អបំផុត): ${typology.bestContentAngle}`,

            `   CTA Style (ស្ទីល CTA): ${typology.ctaStyle}`,
          ]),
        ]
      : [];

    const data = [
      `CUSTOMER AVATAR IMMERSION REPORT`,
      `================================`,
      `Product: ${client.product_name}`,
      `Country: ${client.country}`,
      `Price: ${client.price}`,
      `Date: ${new Date().toLocaleDateString()}`,
      `\n`,
      `I. AVATAR PROFILE (ប្រវត្តិរូប AVATAR)`,
      `------------------------------------`,
      `Demographics (ប្រជាសាស្ត្រ): ${immersion.avatarProfile.demographics}`,
      `Psychographics (ចិត្តសាស្ត្រ): ${immersion.avatarProfile.psychographics}`,
      `Pain Points (ចំណុចឈឺចាប់):`,
      ...immersion.avatarProfile.painPoints.map((p) => `- ${p}`),
      `Desires (បំណងប្រាថ្នា):`,
      ...immersion.avatarProfile.desires.map((d) => `- ${d}`),
      `Fears (ការភ័យខ្លាច):`,
      ...immersion.avatarProfile.fears.map((f) => `- ${f}`),
      `Objections (ការជំទាស់):`,
      ...immersion.avatarProfile.objections.map((o) => `- ${o}`),
      `\n`,
      `II. OFFER ANALYSIS (ការវិភាគការផ្តល់ជូន)`,
      `---------------------------------------`,
      `Core Value (តម្លៃស្នូល): ${immersion.offerAnalysis.coreValue}`,
      `Emotional Triggers (កត្តាអារម្មណ៍):`,
      ...immersion.offerAnalysis.emotionalTriggers.map((t) => `- ${t}`),
      `Logical Benefits (អត្ថប្រយោជន៍តក្កវិជ្ជា):`,
      ...immersion.offerAnalysis.logicalBenefits.map((b) => `- ${b}`),
      `Unique Selling Points (ចំណុចលក់តែមួយគត់):`,
      ...immersion.offerAnalysis.uniqueSellingPoints.map((u) => `- ${u}`),
      `Guarantee Strength (កម្លាំងធានា): ${immersion.offerAnalysis.guaranteeStrength}`,
      `Promotion Impact (ផលប៉ះពាល់ប្រម៉ូសិន): ${immersion.offerAnalysis.promotionImpact}`,
      `\n`,
      `III. MARKETING INSIGHTS (ការយល់ដឹងទីផ្សារ)`,
      `----------------------------------------`,
      `Buying Motivation (ការលើកទឹកចិត្តទិញ): ${immersion.marketingInsights.buyingMotivation}`,
      `Decision Factors (កត្តាសម្រេចចិត្ត):`,
      ...immersion.marketingInsights.decisionFactors.map((f) => `- ${f}`),
      `Messaging Angle (មុំសារ): ${immersion.marketingInsights.messagingAngle}`,
      `Call to Action (ការអំពាវនាវឱ្យធ្វើសកម្មភាព): ${immersion.marketingInsights.callToAction}`,
      `Competitive Advantage (អត្ថប្រយោជន៍ប្រកួតប្រជែង): ${immersion.marketingInsights.competitiveAdvantage}`,
      `\n`,
      `IV. RECOMMENDATIONS (អនុសាសន៍)`,
      `----------------------------`,
      `Content Strategy (យុទ្ធសាស្ត្រមាតិកា): ${immersion.recommendations.contentStrategy}`,
      `Channel Strategy (យុទ្ធសាស្ត្រឆានែល): ${immersion.recommendations.channelStrategy}`,
      `Timing Strategy (យុទ្ធសាស្ត្រពេលវេលា): ${immersion.recommendations.timingStrategy}`,
      `Follow-up Strategy (យុទ្ធសាស្ត្រតាមដាន): ${immersion.recommendations.followUpStrategy}`,
      ...typologiesData,
    ].join("\n");

    const blob = new Blob([data], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Avatar_Immersion_${client.product_name.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)",
      }}
    >
      {/* Hero Header */}
      <header
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #297fb2 0%, #1e5d8a 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute -top-24 -right-24 w-96 h-96 rounded-full"
            style={{ background: "rgba(255,255,255,0.3)" }}
          ></div>
          <div
            className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full"
            style={{ background: "rgba(255,255,255,0.2)" }}
          ></div>
        </div>

        <div className="container mx-auto px-6 py-8 relative z-10">
          <div className="flex justify-between items-start mb-6">
            <button
              onClick={() => navigate(`/client/${id}`)}
              className="px-4 py-2 rounded-lg font-light transition duration-200 flex items-center gap-2 backdrop-blur-sm"
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "#ffffff",
              }}
              onMouseEnter={(e) =>
                (e.target.style.backgroundColor = "rgba(255,255,255,0.3)")
              }
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = "rgba(255,255,255,0.2)")
              }
            >
              ← ថយក្រោយ
            </button>

            <button
              onClick={handleExport}
              className="px-6 py-2 rounded-lg font-medium transition duration-200 flex items-center gap-2 backdrop-blur-sm shadow-lg"
              style={{
                backgroundColor: "#ffffff",
                color: "#297fb2",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow =
                  "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
            >
              <span>📥</span>
              ទាញយកជា Text
            </button>
          </div>

          <div className="max-w-3xl">
            <div
              className="inline-block px-4 py-1 rounded-full mb-4 text-sm font-medium"
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "#ffffff",
              }}
            >
              ✨ Customer Avatar Immersion
            </div>
            <h1 className="text-5xl font-bold mb-4 text-white">
              {client.product_name}
            </h1>
            <p className="text-xl text-white/90 flex items-center gap-3">
              <span className="flex items-center gap-2">
                <span className="text-2xl">🌍</span>
                {client.country}
              </span>
              <span>•</span>
              <span className="flex items-center gap-2">
                <span className="text-2xl">💵</span>
                {client.price}
              </span>
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-7xl relative -mt-8">
        {/* Grid Layout - Pinterest/Magazine Style */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar Profile - Large Featured Card */}
          <div className="lg:col-span-2 lg:row-span-2">
            <div className="bg-white rounded-3xl shadow-xl p-10 h-full relative overflow-hidden">
              <div
                className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5"
                style={{
                  background:
                    "linear-gradient(135deg, #297fb2 0%, #cce49e 100%)",
                  transform: "translate(30%, -30%)",
                }}
              ></div>

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl"
                    style={{
                      background:
                        "linear-gradient(135deg, #297fb2 0%, #1e5d8a 100%)",
                    }}
                  >
                    👤
                  </div>
                  <div>
                    <h3
                      className="text-3xl font-bold"
                      style={{ color: "#297fb2" }}
                    >
                      ប្រវត្តិរូប Avatar
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Customer Profile Deep Dive
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  <FeatureSection
                    title="ប្រជាសាស្ត្រ"
                    icon="📊"
                    content={immersion.avatarProfile.demographics}
                    gradient="from-blue-50 to-cyan-50"
                  />
                  <FeatureSection
                    title="ចិត្តសាស្ត្រ"
                    icon="🧠"
                    content={immersion.avatarProfile.psychographics}
                    gradient="from-purple-50 to-pink-50"
                  />
                  <PillListSection
                    title="ចំណុចឈឺចាប់"
                    icon="😣"
                    items={immersion.avatarProfile.painPoints}
                    color="#ef4444"
                  />
                  <PillListSection
                    title="បំណងប្រាថ្នា"
                    icon="✨"
                    items={immersion.avatarProfile.desires}
                    color="#10b981"
                  />
                  <PillListSection
                    title="ការភ័យខ្លាច"
                    icon="😰"
                    items={immersion.avatarProfile.fears}
                    color="#f59e0b"
                  />
                  <PillListSection
                    title="ការជំទាស់"
                    icon="🤔"
                    items={immersion.avatarProfile.objections}
                    color="#8b5cf6"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Offer Analysis - Accent Card */}
          <div className="lg:row-span-2">
            <div
              className="rounded-3xl shadow-xl p-8 h-full relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
              }}
            >
              <div
                className="absolute bottom-0 right-0 w-48 h-48 rounded-full opacity-20"
                style={{
                  background: "#f97316",
                  transform: "translate(30%, 30%)",
                }}
              ></div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="text-4xl">🎁</div>
                  <div>
                    <h3
                      className="text-2xl font-bold"
                      style={{ color: "#ea580c" }}
                    >
                      ការវិភាគការផ្តល់ជូន
                    </h3>
                  </div>
                </div>

                <div className="space-y-6">
                  <CompactSection
                    title="តម្លៃស្នូល"
                    icon="💎"
                    content={immersion.offerAnalysis.coreValue}
                  />
                  <TagListSection
                    title="កត្តាអារម្មណ៍"
                    icon="❤️"
                    items={immersion.offerAnalysis.emotionalTriggers}
                  />
                  <TagListSection
                    title="អត្ថប្រយោជន៍តក្កវិជ្ជា"
                    icon="🔍"
                    items={immersion.offerAnalysis.logicalBenefits}
                  />
                  <TagListSection
                    title="ចំណុចលក់តែមួយគត់"
                    icon="⭐"
                    items={immersion.offerAnalysis.uniqueSellingPoints}
                  />
                  <CompactSection
                    title="កម្លាំងធានា"
                    icon="🛡️"
                    content={immersion.offerAnalysis.guaranteeStrength}
                  />
                  <CompactSection
                    title="ផលប៉ះពាល់ប្រម៉ូសិន"
                    icon="🎉"
                    content={immersion.offerAnalysis.promotionImpact}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Marketing Insights - Feature Card */}
          <div className="lg:col-span-2">
            <div
              className="rounded-3xl shadow-xl p-8 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
              }}
            >
              <div
                className="absolute top-0 left-0 w-40 h-40 rounded-full opacity-20"
                style={{
                  background: "#22c55e",
                  transform: "translate(-30%, -30%)",
                }}
              ></div>

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
                    style={{
                      background:
                        "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                    }}
                  >
                    📈
                  </div>
                  <div>
                    <h3
                      className="text-2xl font-bold"
                      style={{ color: "#16a34a" }}
                    >
                      ការយល់ដឹងទីផ្សារ
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Strategic Market Intelligence
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InsightCard
                    title="ការលើកទឹកចិត្តទិញ"
                    icon="💰"
                    content={immersion.marketingInsights.buyingMotivation}
                  />
                  <NumberedListCard
                    title="កត្តាសម្រេចចិត្ត"
                    icon="✅"
                    items={immersion.marketingInsights.decisionFactors}
                  />
                  <InsightCard
                    title="មុំសារ"
                    icon="💬"
                    content={immersion.marketingInsights.messagingAngle}
                  />
                  <InsightCard
                    title="ការអំពាវនាវឱ្យធ្វើសកម្មភាព"
                    icon="🎯"
                    content={immersion.marketingInsights.callToAction}
                  />
                </div>

                <div
                  className="mt-6 p-6 rounded-2xl"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.7)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <h4
                    className="flex items-center gap-2 font-bold mb-3 text-lg"
                    style={{ color: "#16a34a" }}
                  >
                    <span className="text-2xl">🏆</span>
                    អត្ថប្រយោជន៍ប្រកួតប្រជែង
                  </h4>
                  <p className="text-gray-800 leading-relaxed">
                    {immersion.marketingInsights.competitiveAdvantage}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations - Action Card */}
          <div>
            <div
              className="rounded-3xl shadow-xl p-8 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
              }}
            >
              <div
                className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-30"
                style={{
                  background: "#f59e0b",
                  transform: "translate(-20%, 20%)",
                }}
              ></div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="text-4xl">💡</div>
                  <div>
                    <h3
                      className="text-2xl font-bold"
                      style={{ color: "#d97706" }}
                    >
                      អនុសាសន៍
                    </h3>
                  </div>
                </div>

                <div className="space-y-5">
                  <ActionCard
                    title="យុទ្ធសាស្ត្រមាតិកា"
                    icon="📝"
                    content={immersion.recommendations.contentStrategy}
                  />
                  <ActionCard
                    title="យុទ្ធសាស្ត្រឆានែល"
                    icon="📡"
                    content={immersion.recommendations.channelStrategy}
                  />
                  <ActionCard
                    title="យុទ្ធសាស្ត្រពេលវេលា"
                    icon="⏰"
                    content={immersion.recommendations.timingStrategy}
                  />
                  <ActionCard
                    title="យុទ្ធសាស្ត្រតាមដាន"
                    icon="📞"
                    content={immersion.recommendations.followUpStrategy}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Typologies Section - Full Width */}
        {immersion.userTypologies && immersion.userTypologies.length > 0 && (
          <div className="mt-6">
            <div className="bg-white rounded-3xl shadow-xl p-10 relative overflow-hidden">
              <div
                className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5"
                style={{
                  background:
                    "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
                  transform: "translate(40%, -40%)",
                }}
              ></div>

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl"
                    style={{
                      background:
                        "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                    }}
                  >
                    👥
                  </div>
                  <div>
                    <h3
                      className="text-3xl font-bold"
                      style={{ color: "#7c3aed" }}
                    >
                      12 User Typologies អ្នកប្រើប្រាស់
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Detailed User Behavior Typologies
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {immersion.userTypologies.map((typology, idx) => (
                    <TypologyCard
                      key={idx}
                      typology={typology}
                      index={idx + 1}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// Feature Section Component (with gradient background)
const FeatureSection = ({ title, icon, content, gradient }) => (
  <div className={`p-6 rounded-2xl bg-linear-to-br ${gradient}`}>
    <h4
      className="flex items-center gap-2 font-bold mb-3 text-base"
      style={{ color: "#1f2937" }}
    >
      <span className="text-xl">{icon}</span>
      {title}
    </h4>
    <p className="text-gray-700 leading-relaxed text-sm">{content}</p>
  </div>
);

// Pill List Section Component
const PillListSection = ({ title, icon, items, color }) => (
  <div>
    <h4
      className="flex items-center gap-2 font-bold mb-3 text-base"
      style={{ color: "#1f2937" }}
    >
      <span className="text-xl">{icon}</span>
      {title}
    </h4>
    <div className="flex flex-wrap gap-2">
      {items.map((item, idx) => (
        <span
          key={idx}
          className="px-4 py-2 rounded-full text-sm font-medium shadow-sm"
          style={{
            backgroundColor: `${color}15`,
            color: color,
            border: `1px solid ${color}30`,
          }}
        >
          {item}
        </span>
      ))}
    </div>
  </div>
);

// Compact Section Component
const CompactSection = ({ title, icon, content }) => (
  <div className="p-4 rounded-xl bg-white/50 backdrop-blur-sm">
    <h4
      className="flex items-center gap-2 font-bold mb-2 text-sm"
      style={{ color: "#78350f" }}
    >
      <span>{icon}</span>
      {title}
    </h4>
    <p className="text-gray-700 text-sm leading-relaxed">{content}</p>
  </div>
);

// Tag List Section Component
const TagListSection = ({ title, icon, items }) => (
  <div>
    <h4
      className="flex items-center gap-2 font-bold mb-2 text-sm"
      style={{ color: "#78350f" }}
    >
      <span>{icon}</span>
      {title}
    </h4>
    <div className="flex flex-wrap gap-2">
      {items.map((item, idx) => (
        <span
          key={idx}
          className="px-3 py-1 rounded-lg text-xs font-medium bg-white/60 text-gray-700 shadow-sm"
        >
          {item}
        </span>
      ))}
    </div>
  </div>
);

// Insight Card Component
const InsightCard = ({ title, icon, content }) => (
  <div className="p-5 rounded-2xl bg-white/70 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow">
    <h4
      className="flex items-center gap-2 font-bold mb-3 text-sm"
      style={{ color: "#15803d" }}
    >
      <span className="text-lg">{icon}</span>
      {title}
    </h4>
    <p className="text-gray-700 text-sm leading-relaxed">{content}</p>
  </div>
);

// Numbered List Card Component
const NumberedListCard = ({ title, icon, items }) => (
  <div className="p-5 rounded-2xl bg-white/70 backdrop-blur-sm shadow-md">
    <h4
      className="flex items-center gap-2 font-bold mb-3 text-sm"
      style={{ color: "#15803d" }}
    >
      <span className="text-lg">{icon}</span>
      {title}
    </h4>
    <ol className="space-y-2">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
          <span
            className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: "#16a34a" }}
          >
            {idx + 1}
          </span>
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ol>
  </div>
);

// Action Card Component
const ActionCard = ({ title, icon, content }) => (
  <div className="p-4 rounded-xl bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all shadow-sm">
    <h4
      className="flex items-center gap-2 font-bold mb-2 text-sm"
      style={{ color: "#92400e" }}
    >
      <span>{icon}</span>
      {title}
    </h4>
    <p className="text-gray-700 text-sm leading-relaxed">{content}</p>
  </div>
);

// Typology Card Component
const TypologyCard = ({ typology, index }) => {
  const colors = [
    { bg: "#fef3c7", border: "#f59e0b", text: "#d97706" },
    { bg: "#dbeafe", border: "#3b82f6", text: "#1d4ed8" },
    { bg: "#fce7f3", border: "#ec4899", text: "#be185d" },
    { bg: "#dcfce7", border: "#22c55e", text: "#15803d" },
    { bg: "#f3e8ff", border: "#a855f7", text: "#7e22ce" },
    { bg: "#ffedd5", border: "#f97316", text: "#c2410c" },
    { bg: "#e0e7ff", border: "#6366f1", text: "#4338ca" },
    { bg: "#fecdd3", border: "#f43f5e", text: "#be123c" },
    { bg: "#ccfbf1", border: "#14b8a6", text: "#0f766e" },
    { bg: "#fef2f2", border: "#ef4444", text: "#dc2626" },
    { bg: "#f0fdf4", border: "#16a34a", text: "#15803d" },
    { bg: "#fdf4ff", border: "#c026d3", text: "#a21caf" },
  ];

  const color = colors[(index - 1) % colors.length];

  return (
    <div
      className="rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border-2"
      style={{
        backgroundColor: color.bg,
        borderColor: color.border,
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
          style={{ backgroundColor: color.border }}
        >
          {index}
        </div>
        <h4 className="font-bold text-lg flex-1" style={{ color: color.text }}>
          {typology.typologyName}
        </h4>
      </div>

      <div className="space-y-3">
        <div className="p-3 rounded-lg bg-white/60 backdrop-blur-sm">
          <p className="text-xs font-semibold text-gray-600 mb-1">🧠 Mindset</p>
          <p className="text-sm text-gray-800 leading-relaxed">
            {typology.mindset}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-white/60 backdrop-blur-sm">
          <p className="text-xs font-semibold text-gray-600 mb-1">
            😣 Core Pain
          </p>
          <p className="text-sm text-gray-800 leading-relaxed">
            {typology.corePain}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-white/60 backdrop-blur-sm">
          <p className="text-xs font-semibold text-gray-600 mb-1">
            ✨ Core Desire
          </p>
          <p className="text-sm text-gray-800 leading-relaxed">
            {typology.coreDesire}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-white/60 backdrop-blur-sm">
          <p className="text-xs font-semibold text-gray-600 mb-1">
            🎯 Buying Trigger
          </p>
          <p className="text-sm text-gray-800 leading-relaxed">
            {typology.buyingTrigger}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-white/60 backdrop-blur-sm">
          <p className="text-xs font-semibold text-gray-600 mb-1">
            💡 Best Content Angle
          </p>
          <p className="text-sm text-gray-800 leading-relaxed">
            {typology.bestContentAngle}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-white/60 backdrop-blur-sm">
          <p className="text-xs font-semibold text-gray-600 mb-1">
            📢 CTA Style
          </p>
          <p className="text-sm text-gray-800 leading-relaxed">
            {typology.ctaStyle}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImmersionView;
