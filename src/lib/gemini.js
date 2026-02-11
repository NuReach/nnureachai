import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const generateImmersion = async (clientData) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const input = {
      productInfo: `${clientData.product_name} / ${clientData.country} / ${clientData.price}`,
      problemsSolved: clientData.problems.join(", "),
      targetAudience: clientData.target_customers,
      warranty: clientData.warranty,
      promotion: clientData.promotion,
      differentiation: clientData.uniqueness,
      competitors: "N/A", // This can be added to the form later if needed
    };

    const prompt = `Act as a world-class Direct Response Marketing Strategist and Consumer Psychologist.

Transform the following raw product data (provided in Khmer) into a comprehensive "Offer, Avatar & User Typology Immersion Research" report.

IMPORTANT:
- The entire response MUST be returned as a valid JSON object.
- ALL string values in the JSON MUST be written in high-quality, professional Khmer language.
- Be realistic, behavior-based, and conversion-focused.
- Avoid generic or theoretical explanations.

RAW DATA (KHMER):
1. Product Name / Country / Price: ${input.productInfo}
2. Problems Solved: ${input.problemsSolved}
3. Target Audience: ${input.targetAudience}
4. Warranty: ${input.warranty}
5. Promotion: ${input.promotion}
6. Differentiation: ${input.differentiation}
7. Competitors: ${input.competitors}

Your goal is to deeply understand how different types of users THINK, FEEL, and DECIDE to buy.
Focus on psychological drivers, objections, and emotional triggers—especially in short-form video and social media contexts.

Return a JSON object with the following structure (ALL CONTENT IN KHMER):

{
  "avatarProfile": {
    "demographics": "string (age range, gender, location, income level, lifestyle context)",
    "psychographics": "string (beliefs, values, attitudes, habits, digital behavior)",
    "painPoints": ["string", "string", "string"],
    "desires": ["string", "string", "string"],
    "fears": ["string", "string", "string"],
    "objections": ["string", "string", "string"]
  },

  "userTypologies": [
    {
      "typologyName": "string (clear behavioral name)",
      "mindset": "string (how this user thinks when scrolling)",
      "corePain": "string (main problem or frustration)",
      "coreDesire": "string (main emotional or practical desire)",
      "buyingTrigger": "string (what finally pushes them to buy)",
      "bestContentAngle": "string (most effective marketing angle)",
      "ctaStyle": "string (best CTA tone: urgency, reassurance, soft, direct, etc.)"
    },
    {
      "typologyName": "string",
      "mindset": "string",
      "corePain": "string",
      "coreDesire": "string",
      "buyingTrigger": "string",
      "bestContentAngle": "string",
      "ctaStyle": "string"
    },
    {
      "typologyName": "string",
      "mindset": "string",
      "corePain": "string",
      "coreDesire": "string",
      "buyingTrigger": "string",
      "bestContentAngle": "string",
      "ctaStyle": "string"
    },
    {
      "typologyName": "string",
      "mindset": "string",
      "corePain": "string",
      "coreDesire": "string",
      "buyingTrigger": "string",
      "bestContentAngle": "string",
      "ctaStyle": "string"
    },
    {
      "typologyName": "string",
      "mindset": "string",
      "corePain": "string",
      "coreDesire": "string",
      "buyingTrigger": "string",
      "bestContentAngle": "string",
      "ctaStyle": "string"
    },
    {
      "typologyName": "string",
      "mindset": "string",
      "corePain": "string",
      "coreDesire": "string",
      "buyingTrigger": "string",
      "bestContentAngle": "string",
      "ctaStyle": "string"
    },
    {
      "typologyName": "string",
      "mindset": "string",
      "corePain": "string",
      "coreDesire": "string",
      "buyingTrigger": "string",
      "bestContentAngle": "string",
      "ctaStyle": "string"
    },
    {
      "typologyName": "string",
      "mindset": "string",
      "corePain": "string",
      "coreDesire": "string",
      "buyingTrigger": "string",
      "bestContentAngle": "string",
      "ctaStyle": "string"
    },
    {
      "typologyName": "string",
      "mindset": "string",
      "corePain": "string",
      "coreDesire": "string",
      "buyingTrigger": "string",
      "bestContentAngle": "string",
      "ctaStyle": "string"
    },
    {
      "typologyName": "string",
      "mindset": "string",
      "corePain": "string",
      "coreDesire": "string",
      "buyingTrigger": "string",
      "bestContentAngle": "string",
      "ctaStyle": "string"
    },
    {
      "typologyName": "string",
      "mindset": "string",
      "corePain": "string",
      "coreDesire": "string",
      "buyingTrigger": "string",
      "bestContentAngle": "string",
      "ctaStyle": "string"
    },
    {
      "typologyName": "string",
      "mindset": "string",
      "corePain": "string",
      "coreDesire": "string",
      "buyingTrigger": "string",
      "bestContentAngle": "string",
      "ctaStyle": "string"
    }
  ],

  "offerAnalysis": {
    "coreValue": "string",
    "emotionalTriggers": ["string", "string", "string"],
    "logicalBenefits": ["string", "string", "string"],
    "uniqueSellingPoints": ["string", "string", "string"],
    "guaranteeStrength": "string",
    "promotionImpact": "string"
  },

  "marketingInsights": {
    "buyingMotivation": "string",
    "decisionFactors": ["string", "string", "string"],
    "messagingAngle": "string",
    "callToAction": "string",
    "competitiveAdvantage": "string"
  },

  "recommendations": {
    "contentStrategy": "string",
    "channelStrategy": "string",
    "timingStrategy": "string",
    "followUpStrategy": "string"
  }
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response (handling markdown code blocks)
    let jsonText = text;
    if (text.includes("```json")) {
      jsonText = text.split("```json")[1].split("```")[0].trim();
    } else if (text.includes("```")) {
      jsonText = text.split("```")[1].split("```")[0].trim();
    }

    const immersionData = JSON.parse(jsonText);
    return immersionData;
  } catch (error) {
    console.error("Error generating immersion:", error);
    throw error;
  }
};

export const generateScript = async (
  clientData,
  angle,
  typology = null,
  userGuidance = "",
) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const typologyContext = typology
      ? `

TARGET USER TYPOLOGY (FOCUS ON THIS SPECIFIC AUDIENCE):
Typology Name: ${typology.typologyName}
Mindset: ${typology.mindset}
Core Pain: ${typology.corePain}
Core Desire: ${typology.coreDesire}
Buying Trigger: ${typology.buyingTrigger}
Best Content Angle: ${typology.bestContentAngle}
CTA Style: ${typology.ctaStyle}

IMPORTANT: You MUST craft this script specifically for this typology. Use their exact mindset, pain point, and desire. Follow their preferred CTA style.
`
      : "";

    const guidanceContext = userGuidance
      ? `

USER'S CONTENT GUIDANCE (MUST FOLLOW):
${userGuidance}

⚠️ CRITICAL: Respect the user's guidance above. If they want something included, include it naturally. If they want something excluded, do NOT mention it at all.
`
      : "";

    const prompt = `Role:
You are a Khmer product or service content creator and social media storyteller who deeply understands Cambodian buying psychology, especially fear, peace of mind, convenience, modern lifestyle, social status, and daily-life stress. You think like a real Cambodian buyer, not a marketer.

Task:
Create a Khmer script for a Facebook Reel or TikTok (20–35 seconds) that feels real, raw, and authentic, like a casual video filmed during real daily life at home, borey, condo, shop, office, or outside, and later added with voice-over.
The goal is to softly sell [PRODUCT NAME: ${clientData.product_name}] without sounding like selling at all.
The video must feel like sharing a real personal experience with a close friend.

Marketing Angle Context (VERY IMPORTANT):
Angle Title: ${angle.title}
Angle Description: ${angle.description}

You MUST follow the angle description when deciding:
1.  **Colloquial & Conversational:** Use spoken Khmer slang (ហាស, ហ្មង, អត់, ម៉ោ, ណ៎ា,បងៗ,បងប្អូនយើង, មិនចឹងអី). Do NOT use formal/news-reporter Khmer.
2.  **High Energy & Enthusiastic:** Sound like a best friend sharing a secret tip.
3.  **Persuasive:** Focus on speed of results (e.g., "in 3 days") and sensory details (texture, feeling).
4.  **Script angles** : ${angle.title} (${angle.description})
${typologyContext}${guidanceContext}
Client/Product Data:
Product: ${clientData.product_name}
Target Customers: ${clientData.target_customers}
Problem Solved: ${clientData.problems.join(", ")}
Uniqueness: ${clientData.uniqueness}
Warranty/Guarantee: ${clientData.warranty}
Promotion: ${clientData.promotion}

Immersion Research Context:
${JSON.stringify(clientData.immersion_data || {})}

STYLE & TONE:
• Storytelling flow (beginning → problem → moment → product/service → result)
• Relatable, slightly funny, real-life stress
• Natural spoken Khmer (street Khmer, not formal)
• Sounds spontaneous, human, slightly imperfect
• Short, punchy sentences
• Conversational rhythm with natural pauses
• Emotional, believable, and grounded

STRUCTURE (ANGLE-DRIVEN):

1. 🔥 HOOK (First 2–3 seconds)
Create the hook STRICTLY based on the selected marketing angle:
- focus on the result of ${typology} may get after using product.

2. 💚 PRODUCT / SERVICE MOMENT (Soft Sell)
Introduce ${clientData.product_name} naturally according to the angle.${typology}
No technical specs.
Mention only ONE simple benefit.
Focus on relief, ease, or peace of mind.

3. 🎬 STORY / PAIN POINT
Develop the story according to the angle logic.${
      typology
        ? `
⚠️ FOCUS: The story MUST revolve around the typology's CORE PAIN: "${typology.corePain}"
Make them feel seen, understood, and like you're inside their head.`
        : ""
    }
Stay natural and conversational.
Use real Cambodian habits, stress, or situations.
Light humor or exaggeration is allowed.


4. 🤔 DOUBT → TURNING POINT → MICRO PROOF
Show hesitation first (price, trust, complexity, fear).${
      typology
        ? `
⚠️ TRIGGER MOMENT: Address their BUYING TRIGGER: "${typology.buyingTrigger}"
This is what pushes them over the edge—use it wisely.`
        : ""
    }
Flip softly using one believable moment:
• First-time use
• Family reaction
• Daily-life convenience
• Feeling calmer or more confident

5. A strong recommendation to comment or share or buy now (soft CTA, not hard selling)
IMPORTANT RULES:
.Hook->Product/Service Momoment
• Write fully in Khmer language only
• No emojis, no hashtags, no explanations
• No obvious sales language
• No long sentences
• Must sound like real voice-over (filmed first, scripted later)
• Must feel filmed first, scripted later
• Avoid technical specs and over-claiming

Final Output:
Generate ONE high-retention Khmer Reel (20-30s) or TikTok script that strictly follows the selected marketing angle and feels real, human, and trustworthy.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating script:", error);
    throw error;
  }
};

export const generateSaleScript = async (
  clientData,
  angle,
  typology = null,
  userGuidance = "",
) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const typologyContext = typology
      ? `

TARGET USER TYPOLOGY (FOCUS ON THIS SPECIFIC AUDIENCE):
Typology Name: ${typology.typologyName}
Mindset: ${typology.mindset}
Core Pain: ${typology.corePain}
Core Desire: ${typology.coreDesire}
Buying Trigger: ${typology.buyingTrigger}
Best Content Angle: ${typology.bestContentAngle}
CTA Style: ${typology.ctaStyle}

IMPORTANT: You MUST craft this sale script specifically for this typology. Use their exact mindset, pain point, and desire. Follow their preferred CTA style to maximize conversion.
`
      : "";

    const guidanceContext = userGuidance
      ? `

USER'S CONTENT GUIDANCE (MUST FOLLOW):
${userGuidance}

⚠️ CRITICAL: Respect the user's guidance above. If they want something included, include it naturally. If they want something excluded, do NOT mention it at all.
`
      : "";

    const prompt = `
ROLE:
Act as an expert Khmer Content Creator and Copywriter for TikTok and Facebook Reels. You specialize in "User Generated Content" (UGC) scripts that go viral in Cambodia.
TASK:
Create ONE viral video script (20-30 seconds) designed to hook viewers instantly and drive sales through "friend-to-friend" persuasion.
INPUT DATA:
Product Name: ${clientData.product_name}
Target Problems: ${clientData.problems.join(", ")}
Key Features/Origin: ${clientData.uniqueness}
Promise/Guarantee: ${clientData.warranty}
Current Promotion: ${clientData.promotion}

Your writing style must be:
1.  **Colloquial & Conversational:** Use spoken Khmer slang (ហាស, មែនទែន, ហ្មង, អត់, ម៉ោ, ណ៎ា,បងៗ,បងប្អូនយើង, មិនចឹងអី). Do NOT use formal/news-reporter Khmer.
2.  **High Energy & Enthusiastic:** Sound like a best friend sharing a secret tip.
3.  **Persuasive:** Focus on speed of results (e.g., "in 3 days") and sensory details (texture, feeling).
4. Script angles : ${angle.title} (${angle.description})
${typologyContext}${guidanceContext}
You will generate a 40-55 second video script following this structure:
* **Hook:** Create the hook STRICTLY based on the selected marketing angle:
- focus on the result of ${typology} may get after using product.
* **Solution:** Introduce the product${
      typology
        ? `
  ⚠️ Position as the answer to their core desire: "${typology.coreDesire}"`
        : ""
    }. Mention its texture, color, or origin (e.g., Korean, Natural).
* **Agitation:** Describe the pain point vividly (3 second only)
* **Promise/Proof:** How fast does it work? How does it feel?${
      typology
        ? `
  ⚠️ Trigger their buying decision with: "${typology.buyingTrigger}"`
        : ""
    }
* **CTA:** A strong recommendation to comment or share or buy now 

FINAL OUTPUT RULES:
• Write in Khmer language (Unicode) ONLY.
• Do NOT use emojis.
• Do NOT include timestamps or scene descriptions.
• Return ONLY the spoken dialogue text.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating sale script:", error);
    throw error;
  }
};

export const generateBrandingTopics = async (clientData) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `
Based on the following product or industry information, generate 5 creative and engaging BRANDING video script topics in Khmer language for TikTok, Facebook Reels, or YouTube Shorts.

Content Purpose:
- Focus on education, advice, awareness, or useful insights related to the product, its usage, or the broader industry.
- The content should NOT feel like direct selling.
- The product can appear naturally as context, example, or experience — not as a hard promotion.

Tone & Style:
- Speak like a real Cambodian talking to a friend.
- Simple Khmer words, casual, emotional, and believable.
- Avoid textbook explanations and corporate marketing language.
- Sound helpful, honest, and relatable.

Content Angles to Consider:
- Common mistakes people make in this category
- Things sellers rarely tell customers
- Simple tips or habits that improve results
- Myths vs reality
- Advice you'd give to a close friend
- Before/after mindset or behavior change
- Industry truths that affect everyday people

Product Information:
- Product Name: ${clientData.product_name}
- Country: ${clientData.country}
- Price: ${clientData.price}
- Target Customers: ${clientData.target_customers}
- Problems Solved: ${clientData.problems?.join(", ")}
- Uniqueness: ${clientData.uniqueness}
- Warranty: ${clientData.warranty}
- Promotion: ${clientData.promotion}

Each topic should be short (3-7 words in Khmer), engaging, and focused on different aspects like:
1. Product benefits
2. Customer pain points
3. Lifestyle transformation
4. Social proof/testimonials
5. Special promotions or features

Return ONLY a JSON array of 5 topic strings in Khmer. Example format:
["ប្រធានបទទី១", "ប្រធានបទទី២", "ប្រធានបទទី៣", "ប្រធានបទទី៤", "ប្រធានបទទី៥"]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up the response
    if (text.includes("```json")) {
      text = text.split("```json")[1].split("```")[0].trim();
    } else if (text.includes("```")) {
      text = text.split("```")[1].split("```")[0].trim();
    }

    const topics = JSON.parse(text);
    return topics;
  } catch (error) {
    console.error("Error generating branding topics:", error);
    throw error;
  }
};

export const generateBrandingScript = async (topic, angle) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const angleContext = angle
      ? `
Marketing Angle Context (VERY IMPORTANT):
Angle Title: ${angle.title}
Angle Description: ${angle.description}

You MUST follow the angle description when deciding:
• How the HOOK is written
• How the story is framed
• How the content is structured and presented
`
      : "";

    const prompt = `Please create a script for a 30-second short-form video (e.g., for TikTok/Reels/Shorts) in Khmer Language.

The video should follow a fast-paced, list-style format, highlighting three to five distinct points. Each benefit/tip should be introduced quickly and explained in 4-5 seconds max.

Topic: ${topic}

${angleContext}

Format Requirements:
1. A powerful attention-grabbing opening line${angle ? ` (based on the ${angle.title} angle)` : ""}
2. First benefit/tip with brief explanation
3. Second benefit/tip with brief explanation
4. Third benefit/tip with brief explanation
5. (optional according to the topic ) Fourth benefit/tip with brief explanation
6. (optional according to the topic ) Fifth benefit/tip with brief explanation
7. Strong call-to-action

Make it energetic, direct, and use simple Khmer language that resonates with the target audience. Focus on the product's unique value proposition and how it solves customer problems.

Return ONLY the script text in Khmer, formatted with clear sections.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating branding script:", error);
    throw error;
  }
};
