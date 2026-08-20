import {
  omegaProductFamilies,
} from "./families";

function normalize(
  value: string
) {
  return value
    .toLowerCase()
    .replace(/\[[^\]]+\]/g, ":param")
    .replace(/:[^/]+/g, ":param")
    .replace(/\/+/g, "/")
    .replace(/\/$/, "") || "/";
}

export function classifyOmegaRoute(
  route: string
) {
  const normalized =
    normalize(route);

  const matches =
    omegaProductFamilies
      .map(family => {
        let score = 0;

        for (
          const prefix of
          family.routePrefixes
        ) {
          const normalizedPrefix =
            normalize(prefix);

          if (
            normalized ===
              normalizedPrefix ||
            normalized.startsWith(
              normalizedPrefix + "/"
            )
          ) {
            score += 10;
          }
        }

        for (
          const keyword of
          family.keywords
        ) {
          if (
            normalized.includes(
              keyword
                .toLowerCase()
                .replace(/\s+/g, "-")
            ) ||
            normalized.includes(
              keyword.toLowerCase()
            )
          ) {
            score += 2;
          }
        }

        return {
          family,
          score,
        };
      })
      .filter(
        item =>
          item.score > 0
      )
      .sort(
        (a, b) =>
          b.score -
          a.score
      );

  return {
    route,
    classified:
      matches.length > 0,
    familyId:
      matches[0]
        ?.family.id ||
      null,
    confidence:
      matches[0]
        ? Math.min(
            100,
            matches[0].score * 10
          )
        : 0,
    alternatives:
      matches
        .slice(1, 4)
        .map(item => ({
          familyId:
            item.family.id,
          score:
            item.score,
        })),
  };
}
