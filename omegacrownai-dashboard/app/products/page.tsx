
import {
  getOmegaPlatformCatalog,
} from "@/lib/omega-product-registry";

function productBuildUrl(product: {
  builderType: string;
  builderDepartment: string;
  buildPrompt: string;
}) {
  const params = new URLSearchParams({
    type: product.builderType,
    department: product.builderDepartment,
    prompt: product.buildPrompt,
  });

  return `/create?${params.toString()}`;
}

export default function ProductsPage() {
  const catalog =
    getOmegaPlatformCatalog();

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg,#05070d 0%,#0a0f1d 100%)",
        color: "#f8fafc",
        padding:
          "72px clamp(24px,5vw,80px)",
      }}
    >
      <section
        style={{
          maxWidth: 1400,
          margin:
            "0 auto 64px",
        }}
      >
        <p
          style={{
            textTransform:
              "uppercase",
            letterSpacing:
              ".24em",
            fontSize: 12,
            fontWeight: 800,
            color: "#a5b4fc",
          }}
        >
          OmegaCrownAI Platform
        </p>

        <h1
          style={{
            margin:
              "16px 0 20px",
            fontSize:
              "clamp(48px,7vw,92px)",
            lineHeight: .95,
            maxWidth: 1100,
          }}
        >
          One AI operating system.
          Every major business
          capability.
        </h1>

        <p
          style={{
            maxWidth: 820,
            fontSize: 20,
            lineHeight: 1.7,
            color: "#aeb8cc",
          }}
        >
          Build applications,
          coordinate AI agents,
          automate workflows,
          create media,
          analyze markets,
          operate companies,
          manage projects,
          deploy production
          systems, and control
          trust and governance.
        </p>

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginTop: 28,
          }}
        >
          <a
            href="/create"
            style={{
              padding:
                "14px 20px",
              borderRadius: 999,
              background:
                "#f8fafc",
              color: "#05070d",
              fontWeight: 800,
            }}
          >
            Start Building
          </a>

          <a
            href="/projects"
            style={{
              padding:
                "14px 20px",
              borderRadius: 999,
              border:
                "1px solid rgba(255,255,255,.18)",
              fontWeight: 800,
            }}
          >
            Open Projects
          </a>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          display: "grid",
          gap: 28,
        }}
      >
        {catalog.map(
          family => (
            <article
              key={
                family.id
              }
              style={{
                border:
                  "1px solid rgba(255,255,255,.1)",
                borderRadius: 28,
                padding: 30,
                background:
                  "rgba(255,255,255,.035)",
              }}
            >
              <div
                style={{
                  display:
                    "flex",
                  gap: 20,
                  justifyContent:
                    "space-between",
                  alignItems:
                    "flex-start",
                  flexWrap:
                    "wrap",
                }}
              >
                <div>
                  <p
                    style={{
                      color:
                        "#818cf8",
                      fontWeight:
                        800,
                      fontSize: 12,
                      letterSpacing:
                        ".16em",
                      textTransform:
                        "uppercase",
                      margin: 0,
                    }}
                  >
                    Product Family
                  </p>

                  <h2
                    style={{
                      fontSize: 36,
                      margin:
                        "10px 0",
                    }}
                  >
                    {
                      family.name
                    }
                  </h2>

                  <p
                    style={{
                      color:
                        "#aeb8cc",
                      maxWidth:
                        760,
                      lineHeight:
                        1.7,
                    }}
                  >
                    {
                      family.description
                    }
                  </p>
                </div>

                <a
                  href={family.href}
                  style={{
                    border:
                      "1px solid rgba(255,255,255,.15)",
                    borderRadius:
                      999,
                    padding:
                      "12px 16px",
                    fontWeight:
                      800,
                  }}
                >
                  Open
                </a>
              </div>

              {family.products
                .length > 0 && (
                <div
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit,minmax(260px,1fr))",
                    gap: 16,
                    marginTop: 24,
                  }}
                >
                  {family.products.map(
                    product => (
                      <div
                        key={
                          product.id
                        }
                        style={{
                          border:
                            "1px solid rgba(255,255,255,.08)",
                          borderRadius:
                            20,
                          padding: 20,
                          background:
                            "rgba(255,255,255,.025)",
                        }}
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            justifyContent:
                              "space-between",
                            gap: 12,
                          }}
                        >
                          <strong>
                            {
                              product.name
                            }
                          </strong>

                          <span
                            style={{
                              color:
                                "#86efac",
                              fontSize:
                                12,
                            }}
                          >
                            {
                              product.status
                            }
                          </span>
                        </div>

                        <p
                          style={{
                            color:
                              "#94a3b8",
                            lineHeight:
                              1.6,
                          }}
                        >
                          {
                            product.description
                          }
                        </p>

                        <div
                          style={{
                            display:
                              "flex",
                            flexWrap:
                              "wrap",
                            gap: 8,
                          }}
                        >
                          {product.capabilities
                            .slice(
                              0,
                              5
                            )
                            .map(
                              capability => (
                                <span
                                  key={
                                    capability
                                  }
                                  style={{
                                    fontSize:
                                      12,
                                    padding:
                                      "7px 9px",
                                    borderRadius:
                                      999,
                                    background:
                                      "rgba(129,140,248,.12)",
                                    color:
                                      "#c7d2fe",
                                  }}
                                >
                                  {
                                    capability
                                  }
                                </span>
                              )
                            )}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 10,
                            marginTop: 18,
                          }}
                        >
                          <a
                            href={product.href}
                            style={{
                              padding: "10px 14px",
                              borderRadius: 999,
                              border: "1px solid rgba(255,255,255,.14)",
                              color: "#e2e8f0",
                              fontSize: 13,
                              fontWeight: 800,
                            }}
                          >
                            Open Product
                          </a>

                          <a
                            href={productBuildUrl(product)}
                            style={{
                              padding: "10px 14px",
                              borderRadius: 999,
                              background: "#f8fafc",
                              color: "#05070d",
                              fontSize: 13,
                              fontWeight: 900,
                            }}
                          >
                            Build This Product
                          </a>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </article>
          )
        )}
      </section>
    </main>
  );
}
