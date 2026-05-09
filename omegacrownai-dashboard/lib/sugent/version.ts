export const SugentVersion = {
  major: 1,
  minor: 0,
  patch: 0,
  codename: "Crown",
  label: "Sugent OS v1.0 Crown",
};

export function getSugentVersionString() {
  return `${SugentVersion.major}.${SugentVersion.minor}.${SugentVersion.patch}`;
}
