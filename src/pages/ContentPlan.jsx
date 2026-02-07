import React, { useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useScripts } from "../hooks/useScripts";

const ContentPlan = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: savedScripts = [] } = useScripts(id);

  const getScriptCount = useCallback(
    (title) => {
      return savedScripts.filter((s) => s.angle_title === title).length;
    },
    [savedScripts],
  );

  const angles = useMemo(() => {
    const rawAngles = [
      {
        title: "Problem–Solution",
        icon: "💡",
        description:
          "Open with one very real daily problem Cambodians face and sit inside that stress moment so viewers immediately relate. Then naturally show how the product or service removed that pain and made daily life calmer. Best for: Cold audience, fast clarity, instant relevance.",
        color: "#3b82f6",
        bg: "#eff6ff",
      },
      {
        title: "Curiosity",
        icon: "❓",
        description:
          "Create an information gap by showing or saying something incomplete, strange, or unexpected. Make people pause because they feel confused or curious and want the answer. Best for: Strong hooks in the first 1–3 seconds.",
        color: "#8b5cf6",
        bg: "#f5f3ff",
      },
      {
        title: "Price Anchoring",
        icon: "⚓",
        description:
          "Mention a more expensive, risky, or tiring alternative that Cambodians already know, then introduce your option so it feels smarter and more reasonable without saying cheap. Best for: Selling value without discounts.",
        color: "#10b981",
        bg: "#ecfdf5",
      },
      {
        title: "Promotion",
        icon: "🎁",
        description:
          "Casually bring up a limited deal, bonus, or special condition as if sharing a useful tip with a friend, not announcing a sale. Best for: Short campaigns and promo periods.",
        color: "#ef4444",
        bg: "#fef2f2",
      },
      {
        title: "Urgency",
        icon: "⏰",
        description:
          "Create urgency by showing what people might lose or miss if they wait, using time, availability, or personal regret instead of pressure. Best for: Moving hesitant buyers.",
        color: "#f59e0b",
        bg: "#fffbeb",
      },
      {
        title: "Feedback",
        icon: "⭐",
        description:
          "Use real comments, inbox messages, or reactions from Cambodian customers and respond naturally like chatting back. Best for: Trust, relatability, and social proof.",
        color: "#6366f1",
        bg: "#eef2ff",
      },
      {
        title: "Before–After",
        icon: "🌗",
        description:
          "Clearly show the emotional or lifestyle difference before and after using the product or service, focusing on relief and confidence. Best for: Skincare, service results, lifestyle change.",
        color: "#ec4899",
        bg: "#fdf2f8",
      },
      {
        title: "Person A vs Person B",
        icon: "👥",
        description:
          "Compare two people facing the same situation but making different choices, leading to different outcomes. Let viewers judge for themselves. Best for: Behavior change content.",
        color: "#14b8a6",
        bg: "#f0fdfa",
      },
      {
        title: "Pattern Interruption",
        icon: "⚡",
        description:
          "Start with something visually or verbally unexpected that doesn’t feel like an ad, forcing people to stop scrolling. Best for: High-competition niches.",
        color: "#f97316",
        bg: "#fff7ed",
      },
      {
        title: "Reply to Comment",
        icon: "💬",
        description:
          "Turn a real comment or doubt into content and answer it honestly and calmly, like talking to one person. Best for: Engagement and credibility.",
        color: "#06b6d4",
        bg: "#ecfeff",
      },
      {
        title: "Customer Testimonial",
        icon: "🗣️",
        description:
          "Let a real customer share their experience in their own words, even if imperfect. Authenticity matters more than polish. Best for: Warm audience conversion.",
        color: "#8b5cf6",
        bg: "#f5f3ff",
      },
      {
        title: "Storytelling",
        icon: "📖",
        description:
          "Tell a relatable real-life story with a clear struggle, turning point, and outcome where the product fits naturally into daily life. Best for: Emotional connection.",
        color: "#3b82f6",
        bg: "#eff6ff",
      },
      {
        title: "Relatable Struggle",
        icon: "🤝",
        description:
          "Talk about a common frustration Cambodians experience but rarely say out loud, making viewers feel seen and understood. Best for: Emotional resonance.",
        color: "#10b981",
        bg: "#ecfdf5",
      },
      {
        title: "Breaking False Beliefs",
        icon: "🔨",
        description:
          "Call out a common wrong belief stopping people from buying and gently replace it with real-life experience. Best for: Unlocking hesitation.",
        color: "#ef4444",
        bg: "#fef2f2",
      },
      {
        title: "Speed & Ease",
        icon: "🚀",
        description:
          "Show how quick, simple, or effortless it is to get results, reducing fear of complexity. Best for: Busy or lazy buyers.",
        color: "#f59e0b",
        bg: "#fffbeb",
      },
      {
        title: "Make It a Method",
        icon: "🔢",
        description:
          "Turn your solution into a simple named routine or method that feels easy to remember and repeat. Best for: Authority and memorability.",
        color: "#6366f1",
        bg: "#eef2ff",
      },
      {
        title: "Compounding Consequences",
        icon: "📉",
        description:
          "Show how ignoring the problem slowly creates bigger stress, cost, or regret over time, without scaring people. Best for: Soft fear motivation.",
        color: "#ec4899",
        bg: "#fdf2f8",
      },
      {
        title: "The Great Paradox",
        icon: "🔄",
        description:
          "Say something that sounds opposite or wrong at first, then explain why it’s actually true in real life. Best for: Standing out and rethinking.",
        color: "#14b8a6",
        bg: "#f0fdfa",
      },
      {
        title: "Compare the Alternatives",
        icon: "⚖️",
        description:
          "Compare your solution with common options Cambodians already use and show why those options are tiring, risky, or inconvenient. Best for: Decision-stage buyers.",
        color: "#f97316",
        bg: "#fff7ed",
      },
      {
        title: "Mistake Angle",
        icon: "❌",
        description:
          "Highlight common mistakes people make before or after buying, speaking from experience, not blame. Best for: Education and positioning.",
        color: "#06b6d4",
        bg: "#ecfeff",
      },
      {
        title: "Myth vs Reality",
        icon: "🔮",
        description:
          "Expose a popular myth and replace it with a grounded, real-life truth that viewers can accept. Best for: Skeptical audiences.",
        color: "#8b5cf6",
        bg: "#f5f3ff",
      },
      {
        title: "Behind the Scenes (BTS)",
        icon: "🎥",
        description:
          "Show the real process, daily work, testing, or packing to prove you’re real and transparent. Best for: Humanizing your brand.",
        color: "#3b82f6",
        bg: "#eff6ff",
      },
      {
        title: "Authority / Credibility",
        icon: "📜",
        description:
          "Show why people should trust you through experience, results, or repetition, not titles or claims. Best for: High-trust offers.",
        color: "#10b981",
        bg: "#ecfdf5",
      },
      {
        title: "Social Proof Stack",
        icon: "📚",
        description:
          "Stack multiple small proofs like comments, results, users, or reactions in one video to build confidence quickly. Best for: Strong conversion.",
        color: "#ef4444",
        bg: "#fef2f2",
      },
      {
        title: "Objection Handling",
        icon: "🛡️",
        description:
          "Address common fears like price, trust, or difficulty directly and calmly, then remove them one by one. Best for: Closing buyers.",
        color: "#f59e0b",
        bg: "#fffbeb",
      },
      {
        title: "Use Case / Scenario",
        icon: "🎭",
        description:
          "Show exactly who this is for and when it’s used in daily Cambodian life so viewers self-identify fast. Best for: Audience clarity.",
        color: "#6366f1",
        bg: "#eef2ff",
      },
      {
        title: "POV Angle",
        icon: "👁️‍🗨️",
        description:
          "Film from a first-person point of view so the viewer feels like they are living the moment themselves. Best for: Reels and TikTok virality.",
        color: "#ec4899",
        bg: "#fdf2f8",
      },
      {
        title: "Transformation Journey",
        icon: "🏔️",
        description:
          "Show gradual improvement over time instead of instant results to feel realistic and trustworthy. Best for: Long-term trust.",
        color: "#14b8a6",
        bg: "#f0fdfa",
      },
      {
        title: "Scarcity",
        icon: "💎",
        description:
          "Limit quantity, time, or access in a calm way so it feels exclusive, not pushy. Best for: Action-driven content.",
        color: "#f97316",
        bg: "#fff7ed",
      },
      {
        title: "Founder / Personal Story",
        icon: "👤",
        description:
          "Share why you started, what problem you personally experienced, and why it mattered. Best for: Brand loyalty.",
        color: "#06b6d4",
        bg: "#ecfeff",
      },
      {
        title: "Call-Out / Direct Address",
        icon: "📢",
        description:
          "Speak directly to a very specific type of person so they feel personally called out. Best for: High relevance and stopping scroll.",
        color: "#8b5cf6",
        bg: "#f5f3ff",
      },
    ];

    return [...rawAngles].sort((a, b) => {
      const countA = getScriptCount(a.title);
      const countB = getScriptCount(b.title);
      return countB - countA;
    });
  }, [getScriptCount]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-light">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate(`/client/${id}`)}
          className="mb-8 flex items-center gap-2 text-gray-500 hover:text-black transition-colors"
        >
          <span>←</span> ត្រឡប់ក្រោយ
        </button>

        <h1 className="text-2xl md:text-3xl font-medium mb-2 text-gray-800">
          យោងទៅតាមការណែនាំរបស់ Nureach Ai យើងសូមណែនាំនូវ Angles មាតិកាទាំង ៣១៖
        </h1>
        <p className="text-gray-500 mb-12">
          "According to Nureach Ai recommend 31 content angles"
        </p>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {angles.map((angle, index) => (
            <div
              key={index}
              className="p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex justify-between items-start mb-6">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110"
                  style={{ backgroundColor: angle.bg, color: angle.color }}
                >
                  {angle.icon}
                </div>
                {getScriptCount(angle.title) > 0 && (
                  <span
                    className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{ backgroundColor: angle.bg, color: angle.color }}
                  >
                    {getScriptCount(angle.title)} Scripts
                  </span>
                )}
              </div>
              <h3
                className="text-xl font-medium mb-3"
                style={{ color: angle.color }}
              >
                {angle.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {angle.description}
              </p>

              <button
                onClick={() =>
                  navigate(`/client/${id}/content/script`, {
                    state: { angle: angle },
                  })
                }
                className="mt-8 text-sm font-medium flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: angle.color }}
              >
                បង្កើតមាតិកានេះ <span>→</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContentPlan;
