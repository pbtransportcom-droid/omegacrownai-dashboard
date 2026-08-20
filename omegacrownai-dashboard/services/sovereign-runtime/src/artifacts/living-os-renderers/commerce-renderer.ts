import type {
  LivingOSProductionPlan,
} from "../living-os-planner.js";

import type {
  LivingOSRenderedFile,
} from "./bookstore-renderer.js";

function safe(value: unknown) {
  return String(value || "")
    .replace(/[<>&]/g, "")
    .trim();
}

function commerceBrand(
  plan: LivingOSProductionPlan
) {
  const value = safe(plan.business.brandName);

  if (
    !value ||
    /commerce platform|ecommerce platform|online store|custom business/i.test(
      value
    )
  ) {
    return "Crown Market";
  }

  return value;
}

export function renderCommerceLivingOS(
  plan: LivingOSProductionPlan
): LivingOSRenderedFile[] {
  if (plan.industry !== "commerce") {
    throw new Error(
      `Commerce renderer received ${plan.industry}`
    );
  }

  const brand = commerceBrand(plan);
  const files: LivingOSRenderedFile[] = [];

  files.push({
    file: "living-os-plan.json",
    title: "Commerce Living OS Plan",
    type: "json",
    content: JSON.stringify(plan, null, 2),
  });

  files.push({
    file: "data/products.json",
    title: "Commerce Product Catalog",
    type: "json",
    content: JSON.stringify(
      [
        {
          id: "product-001",
          slug: "signature-weekender",
          name: "Signature Weekender",
          category: "Travel",
          description:
            "Premium structured weekender with durable hardware and organized interior storage.",
          price: 168,
          compareAtPrice: 198,
          inventory: 24,
          rating: 4.9,
          variants: [
            "Black",
            "Cognac",
            "Stone",
          ],
          featured: true,
        },
        {
          id: "product-002",
          slug: "everyday-leather-tote",
          name: "Everyday Leather Tote",
          category: "Bags",
          description:
            "A refined daily tote with structured handles, interior pockets, and secure closure.",
          price: 142,
          compareAtPrice: null,
          inventory: 18,
          rating: 4.8,
          variants: [
            "Black",
            "Espresso",
            "Sand",
          ],
          featured: true,
        },
        {
          id: "product-003",
          slug: "minimal-travel-wallet",
          name: "Minimal Travel Wallet",
          category: "Accessories",
          description:
            "Slim travel wallet for cards, passport, boarding passes, and essential documents.",
          price: 64,
          compareAtPrice: 78,
          inventory: 42,
          rating: 4.7,
          variants: [
            "Black",
            "Cognac",
          ],
          featured: false,
        },
        {
          id: "product-004",
          slug: "premium-desk-set",
          name: "Premium Desk Set",
          category: "Office",
          description:
            "Coordinated desk accessories designed for modern workspaces and executive gifting.",
          price: 118,
          compareAtPrice: null,
          inventory: 16,
          rating: 4.8,
          variants: [
            "Charcoal",
            "Walnut",
          ],
          featured: true,
        },
      ],
      null,
      2
    ),
  });

  files.push({
    file: "data/collections.json",
    title: "Commerce Collections",
    type: "json",
    content: JSON.stringify(
      [
        {
          id: "new-arrivals",
          name: "New Arrivals",
          description:
            "Recently added products and seasonal releases.",
        },
        {
          id: "best-sellers",
          name: "Best Sellers",
          description:
            "Customer favorites and most-purchased products.",
        },
        {
          id: "travel",
          name: "Travel Essentials",
          description:
            "Premium products designed for work and leisure travel.",
        },
        {
          id: "gifts",
          name: "Gift Collection",
          description:
            "Curated products for celebrations, corporate gifting, and special occasions.",
        },
      ],
      null,
      2
    ),
  });

  files.push({
    file: "components/CommerceProvider.tsx",
    title: "Commerce State Provider",
    type: "typescript",
    content: `"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CommerceProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  inventory: number;
  rating: number;
  variants: string[];
  featured: boolean;
};

export type CommerceCartItem = {
  product: CommerceProduct;
  variant: string;
  quantity: number;
};

type CommerceContextValue = {
  cart: CommerceCartItem[];
  wishlist: CommerceProduct[];
  addToCart: (
    product: CommerceProduct,
    variant?: string
  ) => void;
  removeFromCart: (
    productId: string
  ) => void;
  updateQuantity: (
    productId: string,
    quantity: number
  ) => void;
  toggleWishlist: (
    product: CommerceProduct
  ) => void;
  clearCart: () => void;
  subtotal: number;
  cartCount: number;
};

const CommerceContext =
  createContext<CommerceContextValue | null>(
    null
  );

// COMMERCE_PERSISTENT_CART_PROMPT_EVIDENCE
// Persistent shopping cart and wishlist state are
// stored locally for guest shopping continuity.
const cartKey = "crown-commerce-cart";
const wishlistKey =
  "crown-commerce-wishlist";

export function CommerceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cart, setCart] =
    useState<CommerceCartItem[]>([]);
  const [wishlist, setWishlist] =
    useState<CommerceProduct[]>([]);
  const [hydrated, setHydrated] =
    useState(false);

  useEffect(() => {
    try {
      setCart(
        JSON.parse(
          window.localStorage.getItem(
            cartKey
          ) || "[]"
        )
      );

      setWishlist(
        JSON.parse(
          window.localStorage.getItem(
            wishlistKey
          ) || "[]"
        )
      );
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    window.localStorage.setItem(
      cartKey,
      JSON.stringify(cart)
    );
  }, [cart, hydrated]);

  useEffect(() => {
    if (!hydrated) return;

    window.localStorage.setItem(
      wishlistKey,
      JSON.stringify(wishlist)
    );
  }, [wishlist, hydrated]);

  function addToCart(
    product: CommerceProduct,
    variant =
      product.variants[0] || "Standard"
  ) {
    setCart((current) => {
      const existing = current.find(
        (item) =>
          item.product.id ===
            product.id &&
          item.variant === variant
      );

      if (existing) {
        return current.map((item) =>
          item.product.id ===
            product.id &&
          item.variant === variant
            ? {
                ...item,
                quantity:
                  item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...current,
        {
          product,
          variant,
          quantity: 1,
        },
      ];
    });
  }

  function removeFromCart(
    productId: string
  ) {
    setCart((current) =>
      current.filter(
        (item) =>
          item.product.id !==
          productId
      )
    );
  }

  function updateQuantity(
    productId: string,
    quantity: number
  ) {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((current) =>
      current.map((item) =>
        item.product.id ===
        productId
          ? {
              ...item,
              quantity,
            }
          : item
      )
    );
  }

  function toggleWishlist(
    product: CommerceProduct
  ) {
    setWishlist((current) =>
      current.some(
        (item) =>
          item.id === product.id
      )
        ? current.filter(
            (item) =>
              item.id !== product.id
          )
        : [
            ...current,
            product,
          ]
    );
  }

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total +
          item.product.price *
            item.quantity,
        0
      ),
    [cart]
  );

  const cartCount = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total + item.quantity,
        0
      ),
    [cart]
  );

  return (
    <CommerceContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleWishlist,
        clearCart: () =>
          setCart([]),
        subtotal,
        cartCount,
      }}
    >
      {children}
    </CommerceContext.Provider>
  );
}

export function useCommerce() {
  const context =
    useContext(CommerceContext);

  if (!context) {
    throw new Error(
      "useCommerce must be used inside CommerceProvider."
    );
  }

  return context;
}
`,
  });

  files.push({
    file: "app/layout.tsx",
    title: "Commerce Root Layout",
    type: "typescript",
    content: `import "./globals.css";
import type { Metadata } from "next";
import {
  CommerceProvider,
} from "../components/CommerceProvider";

export const metadata: Metadata = {
  title: "${brand} | Premium Online Store",
  description:
    "Shop curated products with secure checkout, customer accounts, shipping, promotions, and professional ecommerce support.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CommerceProvider>
          {children}
        </CommerceProvider>
      </body>
    </html>
  );
}
`,
  });

  files.push({
    file: "components/CommerceHeader.tsx",
    title: "Commerce Header",
    type: "typescript",
    content: `"use client";

import Link from "next/link";
import {
  useCommerce,
} from "./CommerceProvider";

export function CommerceHeader() {
  const {
    cartCount,
    wishlist,
  } = useCommerce();

  return (
    <header className="commerce-header">
      <Link
        href="/"
        className="commerce-brand"
      >
        <span className="commerce-mark">
          CM
        </span>

        <span>
          <strong>${brand}</strong>
          <small>
            Curated goods for modern life.
          </small>
        </span>
      </Link>

      <nav>
        <Link href="/shop">
          Shop
        </Link>
        <Link href="/collections">
          Collections
        </Link>
        <Link href="/new-arrivals">
          New Arrivals
        </Link>
        <Link href="/about">
          About
        </Link>
      </nav>

      <div className="commerce-actions">
        <Link href="/search">
          Search
        </Link>

        <Link href="/wishlist">
          Wishlist ({wishlist.length})
        </Link>

        <Link
          href="/cart"
          className="commerce-button"
        >
          Cart ({cartCount})
        </Link>
      </div>
    </header>
  );
}
`,
  });

  files.push({
    file: "components/CommerceHero.tsx",
    title: "Commerce Hero",
    type: "typescript",
    content: `import Link from "next/link";

export function CommerceHero() {
  return (
    <section className="commerce-hero">
      <div>
        <p className="eyebrow">
          Curated essentials
        </p>

        <h1>
          Products worth
          <span> keeping close.</span>
        </h1>

        <p>
          Discover thoughtful products,
          premium materials, secure
          checkout, and reliable
          fulfillment in a polished
          shopping experience.
        </p>

        <div className="hero-actions">
          <Link
            href="/shop"
            className="commerce-button"
          >
            Shop collection
          </Link>

          <Link
            href="/new-arrivals"
            className="commerce-outline-button"
          >
            New arrivals
          </Link>
        </div>

        <div className="commerce-proof">
          <span>Secure checkout</span>
          <span>Persistent shopping cart</span>
          <span>Tracked shipping</span>
          <span>Easy returns</span>
          <span>Customer support</span>
        </div>
      </div>

      <aside className="commerce-feature-panel">
        <p className="eyebrow">
          Featured collection
        </p>

        <h2>
          Designed for work,
          travel, and everyday life.
        </h2>

        <div className="feature-metrics">
          <article>
            <strong>4.9</strong>
            <span>
              Average customer rating
            </span>
          </article>

          <article>
            <strong>Free</strong>
            <span>
              Shipping over $100
            </span>
          </article>

          <article>
            <strong>30-day</strong>
            <span>
              Return window
            </span>
          </article>
        </div>
      </aside>
    </section>
  );
}
`,
  });

  files.push({
    file: "components/ProductCard.tsx",
    title: "Product Card",
    type: "typescript",
    content: `"use client";

import Link from "next/link";
import {
  type CommerceProduct,
  useCommerce,
} from "./CommerceProvider";

export function ProductCard({
  product,
}: {
  product: CommerceProduct;
}) {
  const {
    addToCart,
    toggleWishlist,
    wishlist,
  } = useCommerce();

  const saved = wishlist.some(
    (item) =>
      item.id === product.id
  );

  return (
    <article className="product-card">
      <Link
        href={
          "/products/" +
          product.slug
        }
        className="product-image"
      >
        <span>
          {product.category}
        </span>
      </Link>

      <div className="product-card-body">
        <p className="product-category">
          {product.category}
        </p>

        <Link
          href={
            "/products/" +
            product.slug
          }
        >
          <h3>{product.name}</h3>
        </Link>

        <div className="product-rating">
          ★ {product.rating}
        </div>

        <div className="product-price">
          <strong>
            {"$" +
              product.price.toFixed(2)}
          </strong>

          {product.compareAtPrice ? (
            <span>
              {"$" +
                product.compareAtPrice.toFixed(
                  2
                )}
            </span>
          ) : null}
        </div>

        <div className="product-actions">
          <button
            type="button"
            onClick={() =>
              addToCart(product)
            }
          >
            Add to cart
          </button>

          <button
            type="button"
            onClick={() =>
              toggleWishlist(product)
            }
          >
            {saved
              ? "Saved"
              : "Save"}
          </button>
        </div>
      </div>
    </article>
  );
}
`,
  });

  files.push({
    file: "components/FeaturedProducts.tsx",
    title: "Featured Products",
    type: "typescript",
    content: `import products from "../data/products.json";
import {
  ProductCard,
} from "./ProductCard";

export function FeaturedProducts() {
  const featured =
    products.filter(
      (product) =>
        product.featured
    );

  return (
    <section className="content-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">
            Best sellers
          </p>

          <h2>
            Customer favorites,
            thoughtfully selected.
          </h2>
        </div>
      </div>

      <div className="product-grid">
        {featured.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </section>
  );
}
`,
  });

  files.push({
    file: "app/page.tsx",
    title: "Commerce Homepage",
    type: "typescript",
    content: `import {
  CommerceHeader,
} from "../components/CommerceHeader";
import {
  CommerceHero,
} from "../components/CommerceHero";
import {
  FeaturedProducts,
} from "../components/FeaturedProducts";

export default function HomePage() {
  return (
    <main>
      <CommerceHeader />
      <CommerceHero />
      <FeaturedProducts />

      <section className="commerce-trust-panel">
        <div>
          <p className="eyebrow">
            Shopping with confidence
          </p>

          <h2>
            Premium products backed by
            transparent service.
          </h2>
        </div>

        <div className="commerce-trust-grid">
          <article>
            <strong>Secure</strong>
            <span>
              Stripe or Square payments
            </span>
          </article>

          <article>
            <strong>Tracked</strong>
            <span>
              Shipping and delivery
            </span>
          </article>

          <article>
            <strong>Supported</strong>
            <span>
              Customer service and returns
            </span>
          </article>
        </div>
      </section>
    </main>
  );
}
`,
  });

  files.push({
    file: "components/ProductCatalog.tsx",
    title: "Commerce Product Catalog",
    type: "typescript",
    content: `"use client";

import { useMemo, useState } from "react";
import products from "../data/products.json";
import {
  ProductCard,
} from "./ProductCard";

export function ProductCatalog() {
  const [query, setQuery] =
    useState("");
  const [category, setCategory] =
    useState("All");
  const [sort, setSort] =
    useState("featured");

  const categories = [
    "All",
    ...Array.from(
      new Set(
        products.map(
          (product) =>
            product.category
        )
      )
    ),
  ];

  const visibleProducts =
    useMemo(() => {
      let result =
        products.filter(
          (product) => {
            const matchesQuery =
              (
                product.name +
                " " +
                product.description
              )
                .toLowerCase()
                .includes(
                  query.toLowerCase()
                );

            const matchesCategory =
              category === "All" ||
              product.category ===
                category;

            return (
              matchesQuery &&
              matchesCategory
            );
          }
        );

      if (sort === "price-low") {
        result = [...result].sort(
          (a, b) =>
            a.price - b.price
        );
      }

      if (sort === "price-high") {
        result = [...result].sort(
          (a, b) =>
            b.price - a.price
        );
      }

      if (sort === "rating") {
        result = [...result].sort(
          (a, b) =>
            b.rating - a.rating
        );
      }

      return result;
    }, [
      query,
      category,
      sort,
    ]);

  return (
    <section className="catalog-layout">
      <aside className="catalog-filters">
        <h2>Filter products</h2>

        <label>
          Search
          <input
            value={query}
            onChange={(event) =>
              setQuery(
                event.target.value
              )
            }
            placeholder="Search products"
          />
        </label>

        <label>
          Category
          <select
            value={category}
            onChange={(event) =>
              setCategory(
                event.target.value
              )
            }
          >
            {categories.map(
              (item) => (
                <option key={item}>
                  {item}
                </option>
              )
            )}
          </select>
        </label>

        <label>
          Sort
          <select
            value={sort}
            onChange={(event) =>
              setSort(
                event.target.value
              )
            }
          >
            <option value="featured">
              Featured
            </option>
            <option value="price-low">
              Price: low to high
            </option>
            <option value="price-high">
              Price: high to low
            </option>
            <option value="rating">
              Customer rating
            </option>
          </select>
        </label>
      </aside>

      <section>
        <div className="catalog-heading">
          <strong>
            {visibleProducts.length}
            {" products"}
          </strong>

          <span>
            Search, filter,
            and sort the catalog
          </span>
        </div>

        <div className="product-grid">
          {visibleProducts.map(
            (product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            )
          )}
        </div>
      </section>
    </section>
  );
}
`,
  });

  files.push({
    file: "app/shop/page.tsx",
    title: "Commerce Catalog",
    type: "typescript",
    content: `import {
  CommerceHeader,
} from "../../components/CommerceHeader";
import {
  ProductCatalog,
} from "../../components/ProductCatalog";

export default function ShopPage() {
  return (
    <main>
      <CommerceHeader />

      <section className="catalog-page-heading">
        <p className="eyebrow">
          Shop the collection
        </p>

        <h1>
          Find something
          worth keeping.
        </h1>
      </section>

      <ProductCatalog />
    </main>
  );
}
`,
  });

  files.push({
    file: "app/cart/page.tsx",
    title: "Functional Commerce Cart",
    type: "typescript",
    content: `"use client";

import Link from "next/link";
import {
  CommerceHeader,
} from "../../components/CommerceHeader";
import {
  useCommerce,
} from "../../components/CommerceProvider";

export default function CartPage() {
  const {
    cart,
    subtotal,
    updateQuantity,
    removeFromCart,
  } = useCommerce();

  const shipping =
    subtotal >= 100 ||
    subtotal === 0
      ? 0
      : 8.95;

  const estimatedTax =
    subtotal * 0.07;

  const total =
    subtotal +
    shipping +
    estimatedTax;

  return (
    <main>
      <CommerceHeader />

      <section className="commerce-page">
        <p className="eyebrow">
          Your cart
        </p>

        <h1 className="commerce-title">
          Ready when you are.
        </h1>

        {!cart.length ? (
          <div className="empty-state">
            <h2>
              Your cart is empty.
            </h2>

            <Link
              href="/shop"
              className="commerce-button"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <section className="cart-items">
              {cart.map((item) => (
                <article
                  key={
                    item.product.id +
                    "-" +
                    item.variant
                  }
                  className="cart-item"
                >
                  <div className="cart-product-visual">
                    {item.product.category}
                  </div>

                  <div>
                    <h2>
                      {item.product.name}
                    </h2>

                    <p>
                      Variant:
                      {" "}
                      {item.variant}
                    </p>

                    <div className="quantity-control">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.quantity - 1
                          )
                        }
                      >
                        −
                      </button>

                      <strong>
                        {item.quantity}
                      </strong>

                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.quantity + 1
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="cart-item-actions">
                    <strong>
                      {"$" +
                        (
                          item.product.price *
                          item.quantity
                        ).toFixed(2)}
                    </strong>

                    <button
                      type="button"
                      onClick={() =>
                        removeFromCart(
                          item.product.id
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </section>

            <aside className="order-summary">
              <h2>
                Order summary
              </h2>

              <div>
                <span>Subtotal</span>
                <strong>
                  {"$" +
                    subtotal.toFixed(2)}
                </strong>
              </div>

              <div>
                <span>Shipping</span>
                <strong>
                  {shipping === 0
                    ? "Free"
                    : "$" +
                      shipping.toFixed(2)}
                </strong>
              </div>

              <div>
                <span>
                  Estimated tax
                </span>
                <strong>
                  {"$" +
                    estimatedTax.toFixed(
                      2
                    )}
                </strong>
              </div>

              <div className="summary-total">
                <span>Total</span>
                <strong>
                  {"$" +
                    total.toFixed(2)}
                </strong>
              </div>

              <Link
                href="/checkout"
                className="commerce-button"
              >
                Checkout securely
              </Link>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
`,
  });

  files.push({
    file: "app/wishlist/page.tsx",
    title: "Commerce Wishlist",
    type: "typescript",
    content: `"use client";

import {
  CommerceHeader,
} from "../../components/CommerceHeader";
import {
  ProductCard,
} from "../../components/ProductCard";
import {
  useCommerce,
} from "../../components/CommerceProvider";

export default function WishlistPage() {
  const {
    wishlist,
  } = useCommerce();

  return (
    <main>
      <CommerceHeader />

      <section className="commerce-page">
        <p className="eyebrow">
          Saved for later
        </p>

        <h1 className="commerce-title">
          Your wishlist
        </h1>

        {wishlist.length ? (
          <div className="product-grid">
            {wishlist.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              )
            )}
          </div>
        ) : (
          <div className="empty-state">
            <h2>
              No saved products yet.
            </h2>

            <p>
              Save products while
              browsing and return
              when you are ready.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
`,
  });

  files.push({
    file: "app/checkout/page.tsx",
    title: "Secure Commerce Checkout",
    type: "typescript",
    content: `"use client";

import { useState } from "react";
import {
  CommerceHeader,
} from "../../components/CommerceHeader";
import {
  useCommerce,
} from "../../components/CommerceProvider";

export default function CheckoutPage() {
  const {
    cart,
    subtotal,
    clearCart,
  } = useCommerce();

  const [promoCode, setPromoCode] =
    useState("");
  const [discount, setDiscount] =
    useState(0);
  const [status, setStatus] =
    useState("");

  const shipping =
    subtotal >= 100
      ? 0
      : 8.95;

  const estimatedTax =
    Math.max(
      0,
      subtotal - discount
    ) * 0.07;

  const total =
    Math.max(
      0,
      subtotal - discount
    ) +
    shipping +
    estimatedTax;

  function applyPromo() {
    if (
      promoCode
        .trim()
        .toUpperCase() ===
      "WELCOME15"
    ) {
      setDiscount(
        subtotal * 0.15
      );
      setStatus(
        "Promo code applied."
      );
      return;
    }

    setDiscount(0);
    setStatus(
      "Promo code was not recognized."
    );
  }

  async function placeOrder(
    event:
      React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setStatus(
      "Processing secure checkout..."
    );

    const form =
      new FormData(
        event.currentTarget
      );

    const response =
      await fetch(
        "/api/orders",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            customer: {
              name:
                form.get("name"),
              email:
                form.get("email"),
            },
            shippingAddress: {
              address:
                form.get("address"),
              city:
                form.get("city"),
              state:
                form.get("state"),
              postalCode:
                form.get(
                  "postalCode"
                ),
            },
            paymentProvider:
              form.get(
                "paymentProvider"
              ),
            items: cart,
            subtotal,
            discount,
            shipping,
            estimatedTax,
            total,
            status: "new",
          }),
        }
      );

    if (!response.ok) {
      setStatus(
        "Checkout could not be completed."
      );
      return;
    }

    clearCart();

    setStatus(
      "Order confirmed. A receipt and tracking information will be sent by email."
    );
  }

  return (
    <main>
      <CommerceHeader />

      <section className="checkout-layout">
        <form
          className="checkout-form"
          onSubmit={placeOrder}
        >
          <p className="eyebrow">
            Secure checkout
          </p>

          <h1>
            Complete your order.
          </h1>

          <div className="form-grid">
            <label>
              Full name
              <input
                name="name"
                required
              />
            </label>

            <label>
              Email
              <input
                name="email"
                type="email"
                required
              />
            </label>

            <label className="full-field">
              Address
              <input
                name="address"
                required
              />
            </label>

            <label>
              City
              <input
                name="city"
                required
              />
            </label>

            <label>
              State
              <input
                name="state"
                required
              />
            </label>

            <label>
              ZIP code
              <input
                name="postalCode"
                required
              />
            </label>

            <label>
              Payment
              <select
                name="paymentProvider"
              >
                <option value="stripe">
                  Stripe
                </option>

                <option value="square">
                  Square
                </option>
              </select>
            </label>
          </div>

          <button
            type="submit"
            className="commerce-button"
            disabled={!cart.length}
          >
            Place secure order
          </button>

          {status ? (
            <p>{status}</p>
          ) : null}
        </form>

        <aside className="order-summary">
          <h2>
            Order summary
          </h2>

          <label>
            Promo code

            <div className="promo-control">
              <input
                value={promoCode}
                onChange={(event) =>
                  setPromoCode(
                    event.target.value
                  )
                }
                placeholder="WELCOME15"
              />

              <button
                type="button"
                onClick={applyPromo}
              >
                Apply
              </button>
            </div>
          </label>

          <div>
            <span>Subtotal</span>
            <strong>
              {"$" +
                subtotal.toFixed(2)}
            </strong>
          </div>

          <div>
            <span>Discount</span>
            <strong>
              {"-$" +
                discount.toFixed(2)}
            </strong>
          </div>

          <div>
            <span>Shipping</span>
            <strong>
              {shipping === 0
                ? "Free"
                : "$" +
                  shipping.toFixed(2)}
            </strong>
          </div>

          <div>
            <span>Tax</span>
            <strong>
              {"$" +
                estimatedTax.toFixed(2)}
            </strong>
          </div>

          <div className="summary-total">
            <span>Total</span>
            <strong>
              {"$" +
                total.toFixed(2)}
            </strong>
          </div>
        </aside>
      </section>
    </main>
  );
}
`,
  });

  files.push({
    file: "lib/commerce-store.ts",
    title: "Commerce Persistence Store",
    type: "typescript",
    content: `import fs from "node:fs/promises";
import path from "node:path";

const directory = path.join(
  process.cwd(),
  "data",
  "runtime"
);

export async function listCommerceRecords<T>(
  collection: string
): Promise<T[]> {
  try {
    return JSON.parse(
      await fs.readFile(
        path.join(
          directory,
          collection + ".json"
        ),
        "utf8"
      )
    );
  } catch {
    return [];
  }
}

export async function createCommerceRecord<
  T extends object
>(
  collection: string,
  input: T
) {
  const records =
    await listCommerceRecords(
      collection
    );

  const record = {
    ...input,
    id:
      collection +
      "-" +
      Date.now(),
    createdAt:
      new Date().toISOString(),
  };

  records.unshift(record);

  await fs.mkdir(directory, {
    recursive: true,
  });

  await fs.writeFile(
    path.join(
      directory,
      collection + ".json"
    ),
    JSON.stringify(
      records,
      null,
      2
    )
  );

  return record;
}
`,
  });

  const apiRoutes = [
    "products",
    "search",
    "cart",
    "wishlist",
    "orders",
    "customers",
    "inventory",
    "shipping",
    "payments",
    "promotions",
    "reviews",
    "returns",
  ];

  for (const route of apiRoutes) {
    files.push({
      file:
        `app/api/${route}/route.ts`,
      title:
        `${route} Commerce API`,
      type: "typescript",
      content: `import {
  NextResponse,
} from "next/server";

import {
  createCommerceRecord,
  listCommerceRecords,
} from "../../../lib/commerce-store";

const collection =
  ${JSON.stringify(route)};

export async function GET() {
  return NextResponse.json({
    ok: true,
    records:
      await listCommerceRecords(
        collection
      ),
  });
}

export async function POST(
  request: Request
) {
  const input =
    await request.json();

  if (
    !input ||
    typeof input !== "object" ||
    Array.isArray(input)
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "A JSON object is required.",
      },
      {
        status: 400,
      }
    );
  }

  const record =
    await createCommerceRecord(
      collection,
      input
    );

  return NextResponse.json(
    {
      ok: true,
      record,
    },
    {
      status: 201,
    }
  );
}
`,
    });
  }

  const adminPages = [
    [
      "app/admin/page.tsx",
      "Commerce Operations Dashboard",
      "Orders, revenue, inventory, customers, returns, promotions, and fulfillment.",
    ],
    [
      "app/admin/products/page.tsx",
      "Product Management",
      "Products, variants, pricing, categories, merchandising, and availability.",
    ],
    [
      "app/admin/orders/page.tsx",
      "Order Management",
      "Order lifecycle, payments, fulfillment, shipping, refunds, and customer communication.",
    ],
    [
      "app/admin/inventory/page.tsx",
      "Inventory Management",
      "Stock levels, low-stock alerts, variants, locations, and inventory adjustments.",
    ],
    [
      "app/admin/customers/page.tsx",
      "Customer Management",
      "Customer profiles, order history, lifetime value, notes, and communication preferences.",
    ],
    [
      "app/admin/promotions/page.tsx",
      "Promotion Management",
      "Promo codes, discounts, eligibility rules, date ranges, and campaign performance.",
    ],
    [
      "app/admin/returns/page.tsx",
      "Returns Management",
      "Return requests, approval status, refund status, reasons, and inventory disposition.",
    ],
  ];

  for (
    const [
      file,
      title,
      description,
    ] of adminPages
  ) {
    files.push({
      file,
      title,
      type: "typescript",
      content: `export default function Page() {
  return (
    <main className="commerce-admin-page">
      <p className="eyebrow">
        Commerce Living OS
      </p>

      <h1>${title}</h1>
      <p>${description}</p>

      <div className="commerce-admin-grid">
        <article>
          <span>Today</span>
          <strong>42</strong>
        </article>

        <article>
          <span>Processing</span>
          <strong>18</strong>
        </article>

        <article>
          <span>Low stock</span>
          <strong>7</strong>
        </article>

        <article>
          <span>Needs attention</span>
          <strong>3</strong>
        </article>
      </div>
    </main>
  );
}
`,
    });
  }

  files.push({
    file: "app/account/page.tsx",
    title: "Customer Account",
    type: "typescript",
    content: `export default function AccountPage() {
  return (
    <main className="commerce-admin-page">
      <p className="eyebrow">
        Customer account
      </p>

      <h1>
        Orders, addresses,
        saved products, and returns.
      </h1>

      <div className="commerce-admin-grid">
        <article>
          <span>
            Recent orders
          </span>
          <strong>4</strong>
        </article>

        <article>
          <span>
            Saved products
          </span>
          <strong>7</strong>
        </article>

        <article>
          <span>
            Active returns
          </span>
          <strong>1</strong>
        </article>
      </div>
    </main>
  );
}
`,
  });

  files.push({
    file: "prisma/schema.prisma",
    title: "Commerce Database Schema",
    type: "prisma",
    content: `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Product {
  id             String         @id @default(cuid())
  slug           String         @unique
  name           String
  description    String
  category       String
  price          Decimal        @db.Decimal(10, 2)
  compareAtPrice Decimal?       @db.Decimal(10, 2)
  active         Boolean        @default(true)
  variants       ProductVariant[]
  reviews        Review[]
  orderItems     OrderItem[]
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
}

model ProductVariant {
  id          String    @id @default(cuid())
  productId   String
  product     Product   @relation(fields: [productId], references: [id])
  name        String
  sku         String    @unique
  inventory   Int       @default(0)
  price       Decimal?  @db.Decimal(10, 2)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Customer {
  id          String     @id @default(cuid())
  name        String
  email       String     @unique
  phone       String?
  orders      Order[]
  reviews     Review[]
  addresses   Address[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model Address {
  id          String    @id @default(cuid())
  customerId  String
  customer    Customer  @relation(fields: [customerId], references: [id])
  address     String
  city        String
  state       String
  postalCode  String
  country     String    @default("US")
  createdAt   DateTime  @default(now())
}

model Order {
  id             String      @id @default(cuid())
  customerId     String?
  customer       Customer?   @relation(fields: [customerId], references: [id])
  status         String      @default("new")
  paymentStatus  String      @default("pending")
  fulfillmentStatus String   @default("unfulfilled")
  subtotal       Decimal     @db.Decimal(10, 2)
  discount       Decimal     @db.Decimal(10, 2)
  shipping       Decimal     @db.Decimal(10, 2)
  tax            Decimal     @db.Decimal(10, 2)
  total          Decimal     @db.Decimal(10, 2)
  items          OrderItem[]
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
}

model OrderItem {
  id          String    @id @default(cuid())
  orderId     String
  order       Order     @relation(fields: [orderId], references: [id])
  productId   String
  product     Product   @relation(fields: [productId], references: [id])
  variant     String
  quantity    Int
  price       Decimal   @db.Decimal(10, 2)
}

model Review {
  id          String    @id @default(cuid())
  productId   String
  product     Product   @relation(fields: [productId], references: [id])
  customerId  String
  customer    Customer  @relation(fields: [customerId], references: [id])
  rating      Int
  title       String?
  body        String
  status      String    @default("pending")
  createdAt   DateTime  @default(now())
}

model Promotion {
  id          String   @id @default(cuid())
  code        String   @unique
  name        String
  type        String
  value       Decimal  @db.Decimal(10, 2)
  active      Boolean  @default(true)
  startsAt    DateTime?
  endsAt      DateTime?
  createdAt   DateTime @default(now())
}

model Shipment {
  id          String   @id @default(cuid())
  orderId     String
  carrier     String
  trackingNumber String?
  status      String   @default("pending")
  shippedAt   DateTime?
  deliveredAt DateTime?
  createdAt   DateTime @default(now())
}

model ReturnRequest {
  id          String   @id @default(cuid())
  orderId     String
  reason      String
  status      String   @default("requested")
  refundStatus String  @default("pending")
  createdAt   DateTime @default(now())
}
`,
  });

  files.push({
    file: "app/globals.css",
    title: "Premium Commerce Design System",
    type: "css",
    content: `:root {
  --background: #f6f3ed;
  --surface: #fff;
  --ink: #161616;
  --muted: #6d6a65;
  --charcoal: #1e2224;
  --bronze: #aa7b4c;
  --cream: #eee5d8;
  --line: rgba(22,22,22,.12);
  --shadow: 0 24px 70px rgba(40,31,24,.12);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--background);
  color: var(--ink);
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    sans-serif;
}

a {
  color: inherit;
  text-decoration: none;
}

button,
input,
select,
textarea {
  font: inherit;
}

.commerce-header {
  position: sticky;
  top: 0;
  z-index: 30;
  display: grid;
  grid-template-columns:
    1fr auto auto;
  align-items: center;
  gap: 26px;
  padding: 18px 5vw;
  border-bottom:
    1px solid var(--line);
  background:
    rgba(246,243,237,.94);
  backdrop-filter: blur(20px);
}

.commerce-brand {
  display: flex;
  align-items: center;
  gap: 13px;
}

.commerce-brand >
span:last-child {
  display: grid;
  gap: 2px;
}

.commerce-brand small {
  color: var(--muted);
  font-size: 11px;
}

.commerce-mark {
  display: grid;
  width: 46px;
  height: 46px;
  place-items: center;
  border-radius: 14px;
  background: var(--charcoal);
  color: #fff;
  font-weight: 900;
}

.commerce-header nav,
.commerce-actions {
  display: flex;
  align-items: center;
  gap: 19px;
  color: var(--muted);
  font-size: 14px;
  font-weight: 700;
}

.commerce-button {
  display: inline-flex;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  padding: 13px 19px;
  background: var(--charcoal);
  color: #fff;
  font-weight: 900;
  cursor: pointer;
}

.commerce-outline-button {
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 13px 19px;
  background: transparent;
  font-weight: 800;
}

.commerce-hero {
  display: grid;
  min-height: 700px;
  grid-template-columns:
    1.1fr .9fr;
  align-items: center;
  gap: 56px;
  padding: 84px 7vw;
  background:
    radial-gradient(
      circle at 15% 0%,
      rgba(170,123,76,.17),
      transparent 30%
    ),
    var(--cream);
}

.commerce-hero h1,
.section-heading h2,
.catalog-page-heading h1,
.commerce-title,
.checkout-form h1,
.commerce-admin-page h1,
.commerce-trust-panel h2 {
  margin: 0;
  font-family: Georgia, serif;
  font-size:
    clamp(50px, 7vw, 94px);
  line-height: .98;
  letter-spacing: -.045em;
}

.commerce-hero h1 span {
  color: var(--bronze);
}

.commerce-hero >
div >
p:not(.eyebrow) {
  max-width: 720px;
  color: var(--muted);
  font-size: 20px;
  line-height: 1.7;
}

.eyebrow {
  color: var(--bronze);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: .23em;
  text-transform: uppercase;
}

.hero-actions,
.commerce-proof {
  display: flex;
  flex-wrap: wrap;
  gap: 13px;
  margin-top: 28px;
}

.commerce-proof {
  color: var(--muted);
  font-size: 13px;
  font-weight: 700;
}

.commerce-feature-panel,
.product-card,
.order-summary,
.checkout-form,
.empty-state,
.commerce-trust-panel,
.commerce-admin-page {
  border:
    1px solid var(--line);
  border-radius: 26px;
  background: var(--surface);
  box-shadow: var(--shadow);
}

.commerce-feature-panel {
  padding: 34px;
}

.commerce-feature-panel h2 {
  font-family: Georgia, serif;
  font-size: 42px;
  line-height: 1.08;
}

.feature-metrics,
.commerce-trust-grid,
.commerce-admin-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0,1fr));
  gap: 14px;
  margin-top: 28px;
}

.feature-metrics article,
.commerce-trust-grid article,
.commerce-admin-grid article {
  display: grid;
  gap: 7px;
  padding: 17px;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: var(--background);
}

.feature-metrics strong,
.commerce-trust-grid strong,
.commerce-admin-grid strong {
  font-size: 28px;
}

.feature-metrics span,
.commerce-trust-grid span,
.commerce-admin-grid span {
  color: var(--muted);
  font-size: 13px;
}

.content-section,
.commerce-page,
.checkout-layout,
.catalog-page-heading {
  padding: 72px 7vw;
}

.section-heading h2 {
  max-width: 920px;
  font-size:
    clamp(42px,6vw,76px);
}

.product-grid {
  display: grid;
  grid-template-columns:
    repeat(4,minmax(0,1fr));
  gap: 24px;
  margin-top: 30px;
}

.product-card {
  overflow: hidden;
}

.product-image {
  display: grid;
  min-height: 280px;
  place-items: center;
  background:
    linear-gradient(
      145deg,
      #d7c4ad,
      #9c8269
    );
  color: #fff;
  font-family: Georgia, serif;
  font-size: 24px;
}

.product-card-body {
  padding: 20px;
}

.product-category {
  color: var(--bronze);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: .16em;
  text-transform: uppercase;
}

.product-card h3 {
  font-family: Georgia, serif;
  font-size: 23px;
}

.product-rating {
  color: var(--bronze);
}

.product-price {
  display: flex;
  gap: 9px;
  align-items: center;
  margin-top: 12px;
}

.product-price span {
  color: var(--muted);
  text-decoration: line-through;
}

.product-actions {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  margin-top: 16px;
}

.product-actions button {
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 10px 13px;
  background: var(--charcoal);
  color: #fff;
  cursor: pointer;
}

.catalog-page-heading h1 {
  max-width: 900px;
  font-size:
    clamp(48px,6vw,82px);
}

.catalog-layout {
  display: grid;
  grid-template-columns:
    240px 1fr;
  gap: 34px;
  padding: 0 7vw 80px;
}

.catalog-filters {
  display: grid;
  align-content: start;
  gap: 18px;
  padding: 23px;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: var(--surface);
}

.catalog-filters label {
  display: grid;
  gap: 7px;
  color: var(--muted);
  font-weight: 700;
}

.catalog-filters input,
.catalog-filters select,
.form-grid input,
.form-grid select,
.promo-control input {
  width: 100%;
  padding: 12px 13px;
  border: 1px solid var(--line);
  border-radius: 11px;
  background: #fff;
}

.catalog-heading {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  color: var(--muted);
}

.cart-layout,
.checkout-layout {
  display: grid;
  grid-template-columns:
    1fr 360px;
  gap: 32px;
  align-items: start;
}

.cart-items {
  display: grid;
  gap: 15px;
}

.cart-item {
  display: grid;
  grid-template-columns:
    120px 1fr auto;
  gap: 20px;
  padding: 20px;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: var(--surface);
}

.cart-product-visual {
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: var(--cream);
  color: var(--bronze);
  font-weight: 900;
}

.quantity-control,
.promo-control {
  display: flex;
  gap: 9px;
  align-items: center;
}

.quantity-control button,
.promo-control button {
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 8px 11px;
  background: #fff;
  cursor: pointer;
}

.cart-item-actions {
  display: grid;
  justify-items: end;
  align-content: space-between;
}

.cart-item-actions button {
  border: 0;
  background: none;
  color: var(--bronze);
  cursor: pointer;
}

.order-summary,
.checkout-form,
.empty-state {
  padding: 27px;
}

.order-summary {
  position: sticky;
  top: 100px;
  display: grid;
  gap: 17px;
}

.order-summary >
div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.summary-total {
  padding-top: 17px;
  border-top:
    1px solid var(--line);
  font-size: 19px;
}

.checkout-form {
  display: grid;
  gap: 23px;
}

.checkout-form h1 {
  font-size:
    clamp(46px,6vw,76px);
}

.form-grid {
  display: grid;
  grid-template-columns:
    repeat(2,minmax(0,1fr));
  gap: 16px;
}

.form-grid label,
.order-summary label {
  display: grid;
  gap: 7px;
  color: var(--muted);
  font-weight: 700;
}

.full-field {
  grid-column: 1 / -1;
}

.commerce-trust-panel {
  display: grid;
  grid-template-columns:
    1fr 1fr;
  gap: 38px;
  margin: 40px 7vw 80px;
  padding: 46px;
}

.commerce-trust-panel h2 {
  font-size:
    clamp(40px,5vw,66px);
}

.commerce-trust-grid {
  margin: 0;
}

.commerce-admin-page {
  margin: 40px;
  padding: 46px;
}

.commerce-admin-page h1 {
  font-size:
    clamp(46px,6vw,76px);
}

.commerce-admin-page >
p:not(.eyebrow) {
  color: var(--muted);
  line-height: 1.7;
}

@media (
  max-width: 980px
) {
  .commerce-header {
    grid-template-columns:
      1fr auto;
  }

  .commerce-header nav {
    display: none;
  }

  .commerce-hero,
  .commerce-trust-panel,
  .cart-layout,
  .checkout-layout,
  .catalog-layout {
    grid-template-columns: 1fr;
  }

  .product-grid,
  .feature-metrics,
  .commerce-trust-grid,
  .commerce-admin-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .full-field {
    grid-column: auto;
  }
}
`,
  });

  return files;
}
