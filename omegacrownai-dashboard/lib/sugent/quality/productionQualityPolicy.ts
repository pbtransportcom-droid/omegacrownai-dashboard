export type QualityMode = "factual" | "legendary" | "cinematic" | "brand" | "general";

export const omegaProductionQualityPolicy = {
  name: "OmegaCrownAI Production Quality Policy",
  version: "phase24-quality-v1",
  priorities: [
    "Prompt accuracy",
    "Detailed prompt interpretation",
    "Factual consistency when factual output is requested",
    "Legendary, mythic, or cinematic consistency when stylized output is requested",
    "Brand alignment",
    "Production-grade polish",
  ],
  rules: {
    promptAccuracy: [
      "The output must closely follow the user's prompt.",
      "Important prompt details must not be ignored.",
      "Scene, subject, mood, setting, action, and style should match the prompt.",
      "If details conflict, preserve the highest-priority user instruction.",
    ],
    factualConsistency: [
      "If the prompt asks for factual output, avoid invented claims.",
      "Use verifiable, grounded phrasing for factual content.",
      "Mark uncertainty where facts are unknown.",
      "Do not mix fictional or legendary elements into factual output unless requested.",
    ],
    legendaryConsistency: [
      "If the prompt asks for legendary, mythic, royal, ancient, divine, futuristic, or cinematic output, the style must be visibly clear.",
      "Legendary output should feel intentional, detailed, and coherent.",
      "Characters, symbols, environments, lighting, and tone should match the requested lore or mythology.",
      "Do not flatten legendary prompts into generic modern visuals.",
    ],
    productionQuality: [
      "Visuals should be clean, sharp, and high composition quality.",
      "Scripts should have strong pacing, clear structure, and strong hooks.",
      "Voiceover text should be clear, speakable, and polished.",
      "Video scenes should have strong transitions, brand-safe overlays, and coherent flow.",
      "Final outputs should feel premium, not rough or placeholder-like.",
    ],
    qaReview: [
      "Reviewer Agent must check prompt match before approval.",
      "Reviewer Agent must check factual or legendary consistency.",
      "Reviewer Agent must flag weak composition, missing details, generic output, or low production quality.",
      "Approval should require no major prompt-mismatch issues.",
    ],
  },
};

export function buildQualityChecklist(mode: QualityMode = "general") {
  const base = [
    {
      key: "prompt_accuracy",
      label: "Prompt Accuracy",
      question: "Does the output clearly match the user's prompt and preserve important details?",
      required: true,
    },
    {
      key: "detail_alignment",
      label: "Detail Alignment",
      question: "Are scene, subject, mood, action, style, and brand details represented accurately?",
      required: true,
    },
    {
      key: "production_quality",
      label: "Production Quality",
      question: "Is the output polished, coherent, clean, and production-grade?",
      required: true,
    },
    {
      key: "brand_alignment",
      label: "Brand Alignment",
      question: "Does the output feel aligned with OmegaCrownAI's premium, sovereign, high-quality identity?",
      required: true,
    },
  ];

  if (mode === "factual") {
    base.splice(2, 0, {
      key: "factual_consistency",
      label: "Factual Consistency",
      question: "Are factual claims accurate, grounded, and free from unsupported invention?",
      required: true,
    });
  }

  if (mode === "legendary" || mode === "cinematic") {
    base.splice(2, 0, {
      key: "legendary_consistency",
      label: "Legendary / Cinematic Consistency",
      question: "Does the output strongly match the requested legendary, mythic, royal, or cinematic style?",
      required: true,
    });
  }

  return base;
}

export function inferQualityMode(prompt: string): QualityMode {
  const text = prompt.toLowerCase();

  if (
    text.includes("fact") ||
    text.includes("real") ||
    text.includes("historical") ||
    text.includes("accurate") ||
    text.includes("documentary")
  ) {
    return "factual";
  }

  if (
    text.includes("legend") ||
    text.includes("legendary") ||
    text.includes("myth") ||
    text.includes("mythic") ||
    text.includes("royal") ||
    text.includes("ancient") ||
    text.includes("divine") ||
    text.includes("crown")
  ) {
    return "legendary";
  }

  if (
    text.includes("cinematic") ||
    text.includes("movie") ||
    text.includes("film") ||
    text.includes("epic")
  ) {
    return "cinematic";
  }

  if (
    text.includes("brand") ||
    text.includes("logo") ||
    text.includes("marketing") ||
    text.includes("campaign")
  ) {
    return "brand";
  }

  return "general";
}
