
import {
  omegaProductFamilies,
} from "@/lib/omega-product-registry";

export function OmegaPlatformNav() {
  const families =
    omegaProductFamilies
      .filter(
        family =>
          family.visible
      )
      .sort(
        (a, b) =>
          a.priority -
          b.priority
      );

  return (
    <nav
      style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
      }}
      aria-label="OmegaCrownAI platform"
    >
      {families.map(
        family => (
          <a
            key={
              family.id
            }
            href={family.href}
            style={{
              padding:
                "9px 12px",
              borderRadius:
                999,
              border:
                "1px solid rgba(255,255,255,.1)",
              fontSize: 13,
              fontWeight:
                700,
            }}
          >
            {family.name}
          </a>
        )
      )}
    </nav>
  );
}
