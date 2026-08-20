import {
  omegaProducts,
} from "./products";

export function validateOmegaProductRegistry() {
  const errors: string[] = [];

  const ids = new Set<string>();

  for (const product of omegaProducts) {
    if (!product.id) {
      errors.push(
        `Product missing id: ${product.name}`
      );
    }

    if (ids.has(product.id)) {
      errors.push(
        `Duplicate product id: ${product.id}`
      );
    }

    ids.add(product.id);

    if (!product.name) {
      errors.push(
        `Product ${product.id} missing name`
      );
    }

    if (!product.href) {
      errors.push(
        `Product ${product.id} missing href`
      );
    }

    if (
      !Array.isArray(product.capabilities) ||
      product.capabilities.length === 0
    ) {
      errors.push(
        `Product ${product.id} has no capabilities`
      );
    }
  }

  return {
    ok: errors.length === 0,
    productCount: omegaProducts.length,
    errors,
  };
}
