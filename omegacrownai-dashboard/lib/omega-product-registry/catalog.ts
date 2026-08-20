import {
  omegaProducts,
} from "./products";

import {
  omegaProductFamilies,
} from "./families";

export function getOmegaPlatformCatalog() {
  return omegaProductFamilies
    .filter(
      family =>
        family.visible
    )
    .sort(
      (a, b) =>
        a.priority -
        b.priority
    )
    .map(
      family => ({
        ...family,
        products:
          omegaProducts.filter(
            product =>
              product.visible &&
              product.area ===
                family.area
          ),
      })
    );
}

export function searchOmegaProducts(
  query: string
) {
  const term =
    query
      .trim()
      .toLowerCase();

  if (!term) {
    return omegaProducts.filter(
      product =>
        product.visible
    );
  }

  return omegaProducts.filter(
    product => {
      const searchable = [
        product.name,
        product.shortName,
        product.description,
        ...(product.aliases || []),
        ...product.capabilities,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(
        term
      );
    }
  );
}
