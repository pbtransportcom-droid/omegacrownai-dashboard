export type BrandProfile = {
  name?: string;
  styleDescription?: string;
  primaryColor?: string;
  secondaryColor?: string;
  personality?: string;
  avatarStyle?: string;
  avatarGenderPreference?: string;
  avatarEthnicityPreference?: string;
  voiceGender?: string;
};

export type CampaignContext = {
  title: string;
  description?: string | null;
  tone?: string | null;
};

export type SceneContext = {
  index: number;
  scriptSegment: string;
  voiceoverText: string;
};

function sanitize(text: string | undefined | null): string {
  return (text ?? "").trim();
}

function short(text: string | undefined | null, max = 700): string {
  const clean = sanitize(text);
  return clean.length <= max ? clean : clean.slice(0, max) + "...";
}

function defaultBrand(brand?: Partial<BrandProfile> | null): BrandProfile {
  return {
    name: brand?.name || "OmegaCrown AI",
    styleDescription: brand?.styleDescription || "premium, sovereign, futuristic, executive, dark luxury",
    primaryColor: brand?.primaryColor || "gold",
    secondaryColor: brand?.secondaryColor || "electric blue",
    personality: brand?.personality || "confident, intelligent, trustworthy, royal",
    avatarStyle: brand?.avatarStyle || "realistic, professional",
    avatarGenderPreference: brand?.avatarGenderPreference || "neutral",
    avatarEthnicityPreference: brand?.avatarEthnicityPreference || "inclusive and unspecified",
    voiceGender: brand?.voiceGender || "neutral",
  };
}

export function buildImagePrompt(
  scene: SceneContext,
  campaign: CampaignContext,
  brandInput?: Partial<BrandProfile> | null
): string {
  const brand = defaultBrand(brandInput);

  return [
    "Create a cinematic scene image for a marketing video.",
    "",
    "Scene summary:",
    `"${short(scene.scriptSegment)}"`,
    "",
    "Visual goals:",
    `- Emotion: ${campaign.tone || "premium and confident"}`,
    `- Brand style: ${brand.styleDescription}`,
    `- Brand personality: ${brand.personality}`,
    `- Color palette: ${brand.primaryColor}, ${brand.secondaryColor}`,
    "- Composition: clear subject focus, readable at a glance",
    "- Lighting: professional cinematic lighting",
    "",
    "Technical:",
    "- Ultra-sharp detail",
    "- 4K-ready composition",
    "- Clean background unless required by the scene",
    "- No text in the image",
    "- No watermarks",
    "- No logos",
    "",
    "Output: A single high-quality image representing this scene.",
  ].join("\\n");
}

export function buildVideoPrompt(
  scene: SceneContext,
  campaign: CampaignContext,
  brandInput?: Partial<BrandProfile> | null
): string {
  const brand = defaultBrand(brandInput);

  return [
    "Generate a 3-5 second cinematic b-roll video clip for a marketing video.",
    "",
    "Scene summary:",
    `"${short(scene.scriptSegment)}"`,
    "",
    "Visual goals:",
    "- Motion style: slow, smooth cinematic movement",
    `- Emotion: ${campaign.tone || "premium and confident"}`,
    `- Brand style: ${brand.styleDescription}`,
    `- Brand personality: ${brand.personality}`,
    `- Color palette: ${brand.primaryColor}, ${brand.secondaryColor}`,
    "",
    "Technical:",
    "- 1080p or 4K-ready composition",
    "- Smooth camera motion",
    "- No text overlays",
    "- No logos",
    "- No talking characters unless clearly required",
    "",
    "Output: A short, loop-friendly video clip.",
  ].join("\\n");
}

export function buildAvatarPrompt(
  scene: SceneContext,
  campaign: CampaignContext,
  brandInput?: Partial<BrandProfile> | null
): string {
  const brand = defaultBrand(brandInput);

  return [
    "Generate a talking-head presenter delivering the following line:",
    "",
    `"${short(scene.voiceoverText)}"`,
    "",
    "Avatar requirements:",
    `- Style: ${brand.avatarStyle}`,
    `- Gender: ${brand.avatarGenderPreference}`,
    `- Ethnicity: ${brand.avatarEthnicityPreference}`,
    `- Clothing: brand-aligned colors (${brand.primaryColor}, ${brand.secondaryColor})`,
    `- Tone: ${campaign.tone || "professional and confident"}`,
    `- Brand personality: ${brand.personality}`,
    "",
    "Technical:",
    "- Accurate lip-sync to the provided line",
    "- Neutral background or subtle brand gradient",
    "- Natural eye contact",
    "- Smooth, subtle head movement",
    "",
    "Output: A presenter clip speaking the line.",
  ].join("\\n");
}

export function buildVoicePrompt(
  scene: SceneContext,
  campaign: CampaignContext,
  brandInput?: Partial<BrandProfile> | null
): { text: string; metaPrompt: string } {
  const brand = defaultBrand(brandInput);

  return {
    text: sanitize(scene.voiceoverText),
    metaPrompt: [
      "Generate a voiceover reading the provided text exactly as written.",
      "",
      "Voice profile:",
      `- Gender: ${brand.voiceGender}`,
      `- Tone: ${campaign.tone || "professional and confident"}`,
      "- Pace: medium",
      "- Clarity: high",
      "- Emotion: subtle and controlled",
      "",
      "Technical:",
      "- WAV format",
      "- Clean studio sound",
      "- No background noise",
      "- Minimize breaths and mouth clicks",
    ].join("\\n"),
  };
}

export function buildMusicPrompt(
  campaign: CampaignContext,
  brandInput?: Partial<BrandProfile> | null
): string {
  const brand = defaultBrand(brandInput);

  return [
    "Generate background music for a marketing video.",
    "",
    `Mood: ${campaign.tone || "premium and confident"}`,
    `Brand personality: ${brand.personality}`,
    `Brand style: ${brand.styleDescription}`,
    "",
    "Musical requirements:",
    "- Tempo: 90-120 BPM",
    "- Style: cinematic, modern, clean",
    "- Energy: medium",
    "- Loopable: yes",
    "",
    "Technical:",
    "- WAV format",
    "- No vocals",
    "- No sudden transitions",
    "- Consistent rhythm and texture",
  ].join("\\n");
}
