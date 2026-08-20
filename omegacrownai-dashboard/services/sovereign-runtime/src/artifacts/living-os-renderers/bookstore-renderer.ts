import type {
  LivingOSProductionPlan,
} from "../living-os-planner.js";

export type LivingOSRenderedFile = {
  file: string;
  title: string;
  type: string;
  content: string;
};

type BookRecord = {
  id: string;
  slug: string;
  title: string;
  author: string;
  category: string;
  description: string;
  price: number;
  rating: number;
  reviewCount: number;
  formats: string[];
  language: string;
  cover: string;
  featured?: boolean;
  trending?: boolean;
  newArrival?: boolean;
};

function safeBrand(plan: LivingOSProductionPlan) {
  const value = String(
    plan.business.brandName || "BookHaven"
  ).trim();

  if (
    !value ||
    /commerce store website|custom business website/i.test(
      value
    )
  ) {
    return "BookHaven";
  }

  return value;
}

function bookSeed(brand: string): BookRecord[] {
  return [
    {
      id: "book-001",
      slug: "the-midnight-library",
      title: "The Midnight Library",
      author: "Nora Vale",
      category: "Fiction",
      description:
        "A moving literary novel about memory, possibility, and the lives we choose.",
      price: 18.99,
      rating: 4.8,
      reviewCount: 1284,
      formats: [
        "Hardcover",
        "Paperback",
        "Ebook",
        "Audiobook",
      ],
      language: "English",
      cover: "/images/books/midnight-library.svg",
      featured: true,
      trending: true,
    },
    {
      id: "book-002",
      slug: "the-last-detective",
      title: "The Last Detective",
      author: "Mara Ellison",
      category: "Mystery",
      description:
        "A layered mystery about a vanished manuscript and a secret literary society.",
      price: 16.5,
      rating: 4.7,
      reviewCount: 842,
      formats: [
        "Hardcover",
        "Paperback",
        "Ebook",
      ],
      language: "English",
      cover: "/images/books/last-detective.svg",
      featured: true,
      newArrival: true,
    },
    {
      id: "book-003",
      slug: "cities-beyond-stars",
      title: "Cities Beyond the Stars",
      author: "Ibrahim Cole",
      category: "Sci-Fi",
      description:
        "A cinematic science-fiction journey across floating cities and forgotten worlds.",
      price: 21,
      rating: 4.9,
      reviewCount: 1139,
      formats: [
        "Hardcover",
        "Ebook",
        "Audiobook",
      ],
      language: "English",
      cover: "/images/books/cities-stars.svg",
      trending: true,
      newArrival: true,
    },
    {
      id: "book-004",
      slug: "the-garden-between-us",
      title: "The Garden Between Us",
      author: "Elena Hart",
      category: "Romance",
      description:
        "A warm romance about second chances, family traditions, and a neighborhood bookshop.",
      price: 14.99,
      rating: 4.6,
      reviewCount: 692,
      formats: [
        "Paperback",
        "Ebook",
        "Audiobook",
      ],
      language: "English",
      cover: "/images/books/garden-between.svg",
      featured: true,
    },
    {
      id: "book-005",
      slug: "small-habits-big-life",
      title: "Small Habits, Big Life",
      author: "Dr. Lena Morris",
      category: "Self-Help",
      description:
        "A practical guide to sustainable habits, focus, and meaningful personal growth.",
      price: 17.75,
      rating: 4.8,
      reviewCount: 954,
      formats: [
        "Hardcover",
        "Paperback",
        "Ebook",
        "Audiobook",
      ],
      language: "English",
      cover: "/images/books/small-habits.svg",
      trending: true,
    },
    {
      id: "book-006",
      slug: "wonder-atlas",
      title: "The Wonder Atlas",
      author: "Sofia Reed",
      category: "Children's Books",
      description:
        "An illustrated journey through oceans, forests, deserts, and the night sky.",
      price: 22.5,
      rating: 4.9,
      reviewCount: 488,
      formats: [
        "Hardcover",
        "Ebook",
      ],
      language: "English",
      cover: "/images/books/wonder-atlas.svg",
      newArrival: true,
    },
  ];
}

function svgCover(
  title: string,
  author: string,
  background: string,
  accent: string
) {
  const safeTitle = title.replace(/[<>&]/g, "");
  const safeAuthor = author.replace(/[<>&]/g, "");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1200" viewBox="0 0 800 1200">
  <defs>
    <linearGradient id="cover" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${background}" />
      <stop offset="100%" stop-color="${accent}" />
    </linearGradient>
  </defs>
  <rect width="800" height="1200" rx="36" fill="url(#cover)" />
  <circle cx="650" cy="180" r="190" fill="rgba(255,255,255,.09)" />
  <circle cx="130" cy="1010" r="230" fill="rgba(255,255,255,.08)" />
  <text x="72" y="600" font-family="Georgia,serif" font-size="76" font-weight="700" fill="#fff">${safeTitle}</text>
  <text x="76" y="700" font-family="Arial,sans-serif" font-size="30" letter-spacing="7" fill="rgba(255,255,255,.78)">${safeAuthor}</text>
</svg>`;
}

export function renderBookstoreLivingOS(
  plan: LivingOSProductionPlan
): LivingOSRenderedFile[] {
  if (plan.industry !== "bookstore") {
    throw new Error(
      `Bookstore renderer received industry ${plan.industry}`
    );
  }

  const brand = safeBrand(plan);
  const books = bookSeed(brand);

  const files: LivingOSRenderedFile[] = [];

  files.push({
    file: "data/books.json",
    title: "Book Catalog Data",
    type: "json",
    content: JSON.stringify(books, null, 2),
  });

  files.push({
    file: "data/categories.json",
    title: "Book Categories",
    type: "json",
    content: JSON.stringify(
      [
        "Fiction",
        "Non-Fiction",
        "Mystery",
        "Sci-Fi",
        "Romance",
        "Biography",
        "Children's Books",
        "Self-Help",
      ],
      null,
      2
    ),
  });

  files.push({
    file: "data/bookstore-settings.json",
    title: "Bookstore Settings",
    type: "json",
    content: JSON.stringify(
      {
        brand,
        currency: "USD",
        market: "United States",
        digitalDelivery: true,
        physicalShipping: true,
        subscriptions: true,
        guestCheckout: true,
        customerAccounts: true,
      },
      null,
      2
    ),
  });

  const coverDefinitions = [
    [
      "midnight-library.svg",
      "The Midnight Library",
      "Nora Vale",
      "#312e81",
      "#6d28d9",
    ],
    [
      "last-detective.svg",
      "The Last Detective",
      "Mara Ellison",
      "#172554",
      "#0f766e",
    ],
    [
      "cities-stars.svg",
      "Cities Beyond the Stars",
      "Ibrahim Cole",
      "#111827",
      "#7c3aed",
    ],
    [
      "garden-between.svg",
      "The Garden Between Us",
      "Elena Hart",
      "#7f1d1d",
      "#be123c",
    ],
    [
      "small-habits.svg",
      "Small Habits, Big Life",
      "Dr. Lena Morris",
      "#14532d",
      "#15803d",
    ],
    [
      "wonder-atlas.svg",
      "The Wonder Atlas",
      "Sofia Reed",
      "#075985",
      "#0891b2",
    ],
  ];

  for (const [
    file,
    title,
    author,
    background,
    accent,
  ] of coverDefinitions) {
    files.push({
      file: `public/images/books/${file}`,
      title: `${title} Cover`,
      type: "svg",
      content: svgCover(
        title,
        author,
        background,
        accent
      ),
    });
  }

  files.push({
    file: "components/BookstoreHeader.tsx",
    title: "Bookstore Header",
    type: "typescript",
    content: `import Link from "next/link";

export function BookstoreHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand-mark">
        <span className="brand-icon">B</span>
        <span>${brand}</span>
      </Link>

      <nav className="desktop-nav">
        <Link href="/books">Books</Link>
        <Link href="/categories">Categories</Link>
        <Link href="/authors">Authors</Link>
        <Link href="/subscriptions">Book Club</Link>
      </nav>

      <form action="/search" className="header-search">
        <input
          aria-label="Search books and authors"
          name="q"
          placeholder="Search books, authors, genres..."
        />
      </form>

      <div className="header-actions">
        <Link href="/wishlist">Wishlist</Link>
        <Link href="/account">Account</Link>
        <Link href="/cart" className="cart-link">
          Cart
        </Link>
      </div>
    </header>
  );
}
`,
  });

  files.push({
    file: "components/BookCard.tsx",
    title: "Book Card",
    type: "typescript",
    content: `import Image from "next/image";
import Link from "next/link";

export type BookCardData = {
  id: string;
  slug: string;
  title: string;
  author: string;
  category: string;
  price: number;
  rating: number;
  formats: string[];
  cover: string;
};

export function BookCard({
  book,
}: {
  book: BookCardData;
}) {
  return (
    <article className="book-card">
      <Link
        href={"/books/" + book.slug}
        className="book-cover-wrap"
      >
        <Image
          src={book.cover}
          alt={book.title + " by " + book.author}
          width={320}
          height={480}
          className="book-cover"
        />
      </Link>

      <div className="book-card-body">
        <p className="book-category">{book.category}</p>
        <Link href={"/books/" + book.slug}>
          <h3>{book.title}</h3>
        </Link>
        <p className="book-author">by {book.author}</p>
        <div className="rating-row">
          <span>★ {book.rating}</span>
          <span>{book.formats.join(" · ")}</span>
        </div>
        <div className="book-card-footer">
          <strong>{"$" + book.price.toFixed(2)}</strong>
          <button type="button">Add to cart</button>
        </div>
      </div>
    </article>
  );
}
`,
  });

  files.push({
    file: "components/BookShelf.tsx",
    title: "Book Shelf",
    type: "typescript",
    content: `import { BookCard } from "./BookCard";

type Book = Parameters<typeof BookCard>[0]["book"];

export function BookShelf({
  eyebrow,
  title,
  description,
  books,
}: {
  eyebrow: string;
  title: string;
  description: string;
  books: Book[];
}) {
  return (
    <section className="content-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <a href="/books">View all books</a>
      </div>

      <div className="book-grid">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </section>
  );
}
`,
  });

  files.push({
    file: "components/BookstoreHero.tsx",
    title: "Bookstore Hero",
    type: "typescript",
    content: `import Image from "next/image";
import Link from "next/link";

export function BookstoreHero() {
  return (
    <section className="bookstore-hero">
      <div className="hero-copy">
        <p className="eyebrow">
          Stories for every kind of reader
        </p>
        <h1>
          Find your next
          <span> unforgettable read.</span>
        </h1>
        <p className="hero-lead">
          Discover bestselling books, thoughtful gifts,
          immersive audiobooks, and curated reading
          subscriptions from ${brand}.
        </p>

        <div className="hero-actions">
          <Link href="/books" className="primary-button">
            Shop bestsellers
          </Link>
          <Link
            href="/subscriptions"
            className="secondary-button"
          >
            Explore the book club
          </Link>
        </div>

        <div className="hero-proof">
          <span>Free US shipping over $40</span>
          <span>Instant ebook delivery</span>
          <span>Secure checkout</span>
        </div>
      </div>

      <div className="hero-books">
        <Image
          src="/images/books/midnight-library.svg"
          alt="The Midnight Library"
          width={300}
          height={450}
          className="hero-book hero-book-main"
        />
        <Image
          src="/images/books/cities-stars.svg"
          alt="Cities Beyond the Stars"
          width={250}
          height={375}
          className="hero-book hero-book-secondary"
        />
        <div className="hero-promo">
          <strong>20% off</strong>
          <span>your first order</span>
        </div>
      </div>
    </section>
  );
}
`,
  });

  files.push({
    file: "components/CategoryShelf.tsx",
    title: "Category Shelf",
    type: "typescript",
    content: `import Link from "next/link";

const categories = [
  ["Fiction", "Immersive novels and literary favorites"],
  ["Mystery", "Whodunits, thrillers, and suspense"],
  ["Sci-Fi", "Bold futures and distant worlds"],
  ["Romance", "Stories about connection and love"],
  ["Biography", "Remarkable lives and true stories"],
  ["Children's Books", "Curious stories for young readers"],
];

export function CategoryShelf() {
  return (
    <section className="content-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Browse by shelf</p>
          <h2>Books for every mood</h2>
        </div>
      </div>

      <div className="category-grid">
        {categories.map(([name, description]) => (
          <Link
            key={name}
            href={
              "/categories/" +
              name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
            }
            className="category-card"
          >
            <span>{name}</span>
            <p>{description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
`,
  });

  files.push({
    file: "components/AuthorSpotlight.tsx",
    title: "Author Spotlight",
    type: "typescript",
    content: `import Link from "next/link";

export function AuthorSpotlight() {
  return (
    <section className="author-spotlight">
      <div>
        <p className="eyebrow">Author spotlight</p>
        <h2>Meet the voices behind the stories.</h2>
        <p>
          Read interviews, discover signed editions,
          and explore curated collections from featured
          independent and bestselling authors.
        </p>
        <Link href="/authors" className="secondary-button">
          Explore authors
        </Link>
      </div>

      <div className="author-card">
        <div className="author-avatar">NV</div>
        <div>
          <strong>Nora Vale</strong>
          <span>Literary Fiction</span>
          <p>
            Known for emotionally rich stories about
            memory, identity, and second chances.
          </p>
        </div>
      </div>
    </section>
  );
}
`,
  });

  files.push({
    file: "components/BookClubPanel.tsx",
    title: "Book Club Panel",
    type: "typescript",
    content: `import Link from "next/link";

export function BookClubPanel() {
  return (
    <section className="book-club-panel">
      <div>
        <p className="eyebrow">
          ${brand} Book Club
        </p>
        <h2>A curated reading ritual, delivered monthly.</h2>
        <p>
          Receive a handpicked book, reading guide,
          member pricing, and thoughtful literary extras.
        </p>
      </div>

      <div className="book-club-offer">
        <span>Starting at</span>
        <strong>$29/month</strong>
        <Link href="/subscriptions">
          Join the book club
        </Link>
      </div>
    </section>
  );
}
`,
  });

  files.push({
    file: "components/Newsletter.tsx",
    title: "Newsletter",
    type: "typescript",
    content: `"use client";

import { useState } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  async function subscribe() {
    const response = await fetch("/api/newsletter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    setStatus(
      response.ok
        ? "Welcome to the reading list."
        : "Please try again."
    );
  }

  return (
    <section className="newsletter-panel">
      <div>
        <p className="eyebrow">The reading list</p>
        <h2>
          New releases, thoughtful recommendations,
          and members-only offers.
        </h2>
      </div>

      <div className="newsletter-form">
        <input
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          placeholder="you@example.com"
          aria-label="Email address"
        />
        <button type="button" onClick={subscribe}>
          Subscribe
        </button>
        {status ? <p>{status}</p> : null}
      </div>
    </section>
  );
}
`,
  });

  files.push({
    file: "app/page.tsx",
    title: "Bookstore Homepage",
    type: "typescript",
    content: `import books from "../data/books.json";
import { BookstoreHeader } from "../components/BookstoreHeader";
import { BookstoreHero } from "../components/BookstoreHero";
import { CategoryShelf } from "../components/CategoryShelf";
import { BookShelf } from "../components/BookShelf";
import { AuthorSpotlight } from "../components/AuthorSpotlight";
import { BookClubPanel } from "../components/BookClubPanel";
import { Newsletter } from "../components/Newsletter";

export default function HomePage() {
  const featured = books.filter(
    (book) => book.featured
  );
  const trending = books.filter(
    (book) => book.trending
  );
  const newArrivals = books.filter(
    (book) => book.newArrival
  );

  return (
    <main>
      <BookstoreHeader />
      <BookstoreHero />
      <CategoryShelf />

      <BookShelf
        eyebrow="Reader favorites"
        title="Bestsellers worth staying up for"
        description="The books readers are recommending, gifting, and talking about now."
        books={featured}
      />

      <BookShelf
        eyebrow="Fresh on the shelf"
        title="New arrivals"
        description="Discover recent releases across fiction, ideas, children’s books, and more."
        books={newArrivals}
      />

      <BookShelf
        eyebrow="Trending now"
        title="Popular with ${brand} readers"
        description="Books gaining momentum across our community."
        books={trending}
      />

      <AuthorSpotlight />
      <BookClubPanel />
      <Newsletter />
    </main>
  );
}
`,
  });

  files.push({
    file: "app/books/page.tsx",
    title: "Book Catalog",
    type: "typescript",
    content: `"use client";

import { useMemo, useState } from "react";
import books from "../../data/books.json";
import { BookCard } from "../../components/BookCard";
import { BookstoreHeader } from "../../components/BookstoreHeader";

export default function BooksPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [format, setFormat] = useState("All");

  const visibleBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesQuery =
        !query ||
        book.title
          .toLowerCase()
          .includes(query.toLowerCase()) ||
        book.author
          .toLowerCase()
          .includes(query.toLowerCase());

      const matchesCategory =
        category === "All" ||
        book.category === category;

      const matchesFormat =
        format === "All" ||
        book.formats.includes(format);

      return (
        matchesQuery &&
        matchesCategory &&
        matchesFormat
      );
    });
  }, [query, category, format]);

  const categories = [
    "All",
    ...Array.from(
      new Set(books.map((book) => book.category))
    ),
  ];

  return (
    <main>
      <BookstoreHeader />

      <section className="catalog-shell">
        <aside className="catalog-filters">
          <p className="eyebrow">Find your next read</p>
          <h1>Book catalog</h1>

          <label>
            Search
            <input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Title or author"
            />
          </label>

          <label>
            Genre
            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
            >
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <label>
            Format
            <select
              value={format}
              onChange={(event) =>
                setFormat(event.target.value)
              }
            >
              {[
                "All",
                "Hardcover",
                "Paperback",
                "Ebook",
                "Audiobook",
              ].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </aside>

        <section>
          <div className="catalog-heading">
            <strong>{visibleBooks.length} books</strong>
            <span>
              Filter by genre, author, format, and search
            </span>
          </div>

          <div className="book-grid">
            {visibleBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
`,
  });

  files.push({
    file: "app/books/[bookId]/page.tsx",
    title: "Book Detail Page",
    type: "typescript",
    content: `import Image from "next/image";
import { notFound } from "next/navigation";
import books from "../../../data/books.json";
import { BookstoreHeader } from "../../../components/BookstoreHeader";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;

  const book = books.find(
    (item) =>
      item.slug === bookId ||
      item.id === bookId
  );

  if (!book) {
    notFound();
  }

  const related = books
    .filter(
      (item) =>
        item.category === book.category &&
        item.id !== book.id
    )
    .slice(0, 3);

  return (
    <main>
      <BookstoreHeader />

      <section className="book-detail">
        <Image
          src={book.cover}
          alt={book.title}
          width={420}
          height={630}
          className="detail-cover"
        />

        <div className="detail-content">
          <p className="eyebrow">{book.category}</p>
          <h1>{book.title}</h1>
          <p className="detail-author">
            by {book.author}
          </p>
          <p className="detail-rating">
            ★ {book.rating} · {book.reviewCount} reviews
          </p>
          <p className="detail-description">
            {book.description}
          </p>

          <fieldset className="format-selector">
            <legend>Choose a format</legend>
            {book.formats.map((format) => (
              <label key={format}>
                <input
                  type="radio"
                  name="format"
                  defaultChecked={
                    format === book.formats[0]
                  }
                />
                <span>{format}</span>
              </label>
            ))}
          </fieldset>

          <div className="detail-purchase">
            <strong>
              {"$" + book.price.toFixed(2)}
            </strong>
            <button type="button">
              Add to cart
            </button>
            <button type="button">
              Add to wishlist
            </button>
          </div>
        </div>
      </section>

      <section className="content-section">
        <p className="eyebrow">
          Readers also enjoyed
        </p>
        <div className="book-grid">
          {related.map((item) => (
            <article key={item.id} className="related-card">
              <Image
                src={item.cover}
                alt={item.title}
                width={180}
                height={270}
              />
              <h3>{item.title}</h3>
              <p>{item.author}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
`,
  });

  files.push({
    file: "lib/bookstore-store.ts",
    title: "Bookstore Persistence",
    type: "typescript",
    content: `import fs from "node:fs/promises";
import path from "node:path";

const dataDir = path.join(
  process.cwd(),
  "data",
  "runtime"
);

async function readCollection<T>(
  name: string,
  fallback: T
): Promise<T> {
  try {
    const value = await fs.readFile(
      path.join(dataDir, name + ".json"),
      "utf8"
    );

    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

async function writeCollection<T>(
  name: string,
  value: T
) {
  await fs.mkdir(dataDir, { recursive: true });

  await fs.writeFile(
    path.join(dataDir, name + ".json"),
    JSON.stringify(value, null, 2)
  );
}

export async function listRecords<T>(
  name: string
): Promise<T[]> {
  return readCollection<T[]>(name, []);
}

export async function createRecord<T extends object>(
  name: string,
  input: T
) {
  const records = await listRecords<T & {
    id: string;
    createdAt: string;
  }>(name);

  const record = {
    ...input,
    id:
      name.replace(/[^a-z0-9]+/gi, "-") +
      "-" +
      Date.now(),
    createdAt: new Date().toISOString(),
  };

  records.unshift(record);

  await writeCollection(name, records);

  return record;
}
`,
  });

  const apiDefinitions = [
    ["books", "books"],
    ["search", "searches"],
    ["cart", "carts"],
    ["wishlist", "wishlists"],
    ["reviews", "reviews"],
    ["orders", "orders"],
    ["digital-delivery", "digital-deliveries"],
    ["shipping/quote", "shipping-quotes"],
    ["subscriptions", "subscriptions"],
    ["newsletter", "newsletter-subscribers"],
  ];

  for (const [route, collection] of apiDefinitions) {
    const depth = route.includes("/") ? "../../../.." : "../../..";

    files.push({
      file: `app/api/${route}/route.ts`,
      title: `${route} API`,
      type: "typescript",
      content: `import { NextResponse } from "next/server";
import {
  createRecord,
  listRecords,
} from "${depth}/lib/bookstore-store";

const collection = ${JSON.stringify(collection)};

export async function GET() {
  const records = await listRecords(collection);

  return NextResponse.json({
    ok: true,
    collection,
    records,
  });
}

export async function POST(request: Request) {
  const input = await request.json();

  if (
    !input ||
    typeof input !== "object" ||
    Array.isArray(input)
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "A JSON object is required.",
      },
      { status: 400 }
    );
  }

  const record = await createRecord(
    collection,
    input
  );

  return NextResponse.json(
    {
      ok: true,
      record,
    },
    { status: 201 }
  );
}
`,
    });
  }


  // BOOKSTORE_FUNCTIONAL_COMMERCE
  files.push({
    file: "components/CommerceProvider.tsx",
    title: "Bookstore Commerce Provider",
    type: "typescript",
    content: `"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CommerceBook = {
  id: string;
  slug: string;
  title: string;
  author: string;
  price: number;
  cover: string;
  formats: string[];
};

export type CartItem = {
  book: CommerceBook;
  format: string;
  quantity: number;
};

type CommerceContextValue = {
  cart: CartItem[];
  wishlist: CommerceBook[];
  addToCart: (
    book: CommerceBook,
    format?: string
  ) => void;
  updateQuantity: (
    bookId: string,
    quantity: number
  ) => void;
  removeFromCart: (bookId: string) => void;
  toggleWishlist: (book: CommerceBook) => void;
  clearCart: () => void;
  subtotal: number;
};

const CommerceContext =
  createContext<CommerceContextValue | null>(null);

const cartKey = "bookhaven-cart";
const wishlistKey = "bookhaven-wishlist";

export function CommerceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] =
    useState<CommerceBook[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      setCart(
        JSON.parse(
          window.localStorage.getItem(cartKey) || "[]"
        )
      );

      setWishlist(
        JSON.parse(
          window.localStorage.getItem(wishlistKey) ||
            "[]"
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
    book: CommerceBook,
    format = book.formats[0] || "Paperback"
  ) {
    setCart((current) => {
      const existing = current.find(
        (item) =>
          item.book.id === book.id &&
          item.format === format
      );

      if (existing) {
        return current.map((item) =>
          item.book.id === book.id &&
          item.format === format
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...current,
        {
          book,
          format,
          quantity: 1,
        },
      ];
    });
  }

  function updateQuantity(
    bookId: string,
    quantity: number
  ) {
    if (quantity <= 0) {
      removeFromCart(bookId);
      return;
    }

    setCart((current) =>
      current.map((item) =>
        item.book.id === bookId
          ? { ...item, quantity }
          : item
      )
    );
  }

  function removeFromCart(bookId: string) {
    setCart((current) =>
      current.filter(
        (item) => item.book.id !== bookId
      )
    );
  }

  function toggleWishlist(book: CommerceBook) {
    setWishlist((current) =>
      current.some((item) => item.id === book.id)
        ? current.filter(
            (item) => item.id !== book.id
          )
        : [...current, book]
    );
  }

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total +
          item.book.price * item.quantity,
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
        updateQuantity,
        removeFromCart,
        toggleWishlist,
        clearCart: () => setCart([]),
        subtotal,
      }}
    >
      {children}
    </CommerceContext.Provider>
  );
}

export function useCommerce() {
  const value = useContext(CommerceContext);

  if (!value) {
    throw new Error(
      "useCommerce must be used inside CommerceProvider."
    );
  }

  return value;
}
`,
  });

  files.push({
    file: "app/layout.tsx",
    title: "Bookstore Root Layout",
    type: "typescript",
    content: `import "./globals.css";
import type { Metadata } from "next";
import {
  CommerceProvider,
} from "../components/CommerceProvider";

export const metadata: Metadata = {
  title: "${brand} | Books for Every Reader",
  description:
    "Shop physical books, ebooks, audiobooks, literary gifts, and curated subscriptions from ${brand}.",
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
    file: "components/AddToCartButton.tsx",
    title: "Add to Cart Button",
    type: "typescript",
    content: `"use client";

import type {
  CommerceBook,
} from "./CommerceProvider";
import {
  useCommerce,
} from "./CommerceProvider";

export function AddToCartButton({
  book,
  format,
}: {
  book: CommerceBook;
  format?: string;
}) {
  const { addToCart } = useCommerce();

  return (
    <button
      type="button"
      onClick={() => addToCart(book, format)}
    >
      Add to cart
    </button>
  );
}
`,
  });

  files.push({
    file: "app/cart/page.tsx",
    title: "Functional Shopping Cart",
    type: "typescript",
    content: `"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCommerce,
} from "../../components/CommerceProvider";
import {
  BookstoreHeader,
} from "../../components/BookstoreHeader";

export default function CartPage() {
  const {
    cart,
    subtotal,
    updateQuantity,
    removeFromCart,
  } = useCommerce();

  const shipping =
    subtotal >= 40 || subtotal === 0 ? 0 : 5.95;
  const estimatedTax = subtotal * 0.07;
  const total =
    subtotal + shipping + estimatedTax;

  return (
    <main>
      <BookstoreHeader />

      <section className="commerce-page">
        <div className="commerce-heading">
          <p className="eyebrow">Your reading stack</p>
          <h1>Shopping cart</h1>
        </div>

        {cart.length === 0 ? (
          <div className="empty-state">
            <h2>Your cart is waiting for a story.</h2>
            <p>
              Browse bestsellers, new arrivals, ebooks,
              and audiobooks.
            </p>
            <Link
              href="/books"
              className="primary-button"
            >
              Browse books
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <section className="cart-items">
              {cart.map((item) => (
                <article
                  className="cart-item"
                  key={
                    item.book.id + "-" + item.format
                  }
                >
                  <Image
                    src={item.book.cover}
                    alt={item.book.title}
                    width={110}
                    height={165}
                  />

                  <div>
                    <h2>{item.book.title}</h2>
                    <p>{item.book.author}</p>
                    <span>{item.format}</span>

                    <div className="quantity-control">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.book.id,
                            item.quantity - 1
                          )
                        }
                      >
                        −
                      </button>

                      <strong>{item.quantity}</strong>

                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.book.id,
                            item.quantity + 1
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="cart-item-price">
                    <strong>
                      {"$" +
                        (
                          item.book.price *
                          item.quantity
                        ).toFixed(2)}
                    </strong>

                    <button
                      type="button"
                      onClick={() =>
                        removeFromCart(item.book.id)
                      }
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </section>

            <aside className="order-summary">
              <h2>Order summary</h2>

              <div>
                <span>Subtotal</span>
                <strong>
                  {"$" + subtotal.toFixed(2)}
                </strong>
              </div>

              <div>
                <span>Shipping</span>
                <strong>
                  {shipping === 0
                    ? "Free"
                    : "$" + shipping.toFixed(2)}
                </strong>
              </div>

              <div>
                <span>Estimated tax</span>
                <strong>
                  {"$" + estimatedTax.toFixed(2)}
                </strong>
              </div>

              <div className="summary-total">
                <span>Total</span>
                <strong>
                  {"$" + total.toFixed(2)}
                </strong>
              </div>

              <Link
                href="/checkout"
                className="primary-button"
              >
                Continue to checkout
              </Link>

              <p>
                Secure payment · Instant digital
                delivery · Tracked physical shipping
              </p>
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
    title: "Functional Wishlist",
    type: "typescript",
    content: `"use client";

import {
  BookstoreHeader,
} from "../../components/BookstoreHeader";
import {
  BookCard,
} from "../../components/BookCard";
import {
  useCommerce,
} from "../../components/CommerceProvider";

export default function WishlistPage() {
  const { wishlist } = useCommerce();

  return (
    <main>
      <BookstoreHeader />

      <section className="content-section">
        <p className="eyebrow">Saved for later</p>
        <h1 className="commerce-title">
          Your wishlist
        </h1>

        {wishlist.length ? (
          <div className="book-grid">
            {wishlist.map((book) => (
              <BookCard
                key={book.id}
                book={{
                  ...book,
                  category: "Saved book",
                  rating: 0,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>No saved books yet.</h2>
            <p>
              Save books while browsing and return
              whenever you are ready.
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
    title: "Functional Secure Checkout",
    type: "typescript",
    content: `"use client";

import { useState } from "react";
import {
  BookstoreHeader,
} from "../../components/BookstoreHeader";
import {
  useCommerce,
} from "../../components/CommerceProvider";

export default function CheckoutPage() {
  const {
    cart,
    subtotal,
    clearCart,
  } = useCommerce();

  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [status, setStatus] = useState("");

  const shipping =
    subtotal >= 40 ? 0 : 5.95;
  const total =
    Math.max(0, subtotal - discount) + shipping;

  function applyPromo() {
    if (
      promoCode.trim().toUpperCase() === "READ20"
    ) {
      setDiscount(subtotal * 0.2);
      setStatus("Promo code applied.");
    } else {
      setDiscount(0);
      setStatus("Promo code was not recognized.");
    }
  }

  async function placeOrder(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setStatus("Processing secure checkout...");

    const form = new FormData(event.currentTarget);

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer: {
          name: form.get("name"),
          email: form.get("email"),
        },
        shippingAddress: {
          address: form.get("address"),
          city: form.get("city"),
          state: form.get("state"),
          postalCode: form.get("postalCode"),
        },
        paymentProvider: form.get("paymentProvider"),
        items: cart,
        subtotal,
        discount,
        shipping,
        total,
      }),
    });

    if (!response.ok) {
      setStatus(
        "Checkout could not be completed."
      );
      return;
    }

    clearCart();
    setStatus(
      "Order confirmed. Your receipt and delivery details are on the way."
    );
  }

  return (
    <main>
      <BookstoreHeader />

      <section className="checkout-layout">
        <form
          className="checkout-form"
          onSubmit={placeOrder}
        >
          <p className="eyebrow">
            Protected checkout
          </p>
          <h1>Complete your order</h1>

          <div className="form-grid">
            <label>
              Full name
              <input name="name" required />
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
              Street address
              <input name="address" required />
            </label>

            <label>
              City
              <input name="city" required />
            </label>

            <label>
              State
              <input name="state" required />
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
              <select name="paymentProvider">
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
            className="primary-button"
            disabled={!cart.length}
          >
            Pay securely
          </button>

          {status ? (
            <p className="checkout-status">
              {status}
            </p>
          ) : null}
        </form>

        <aside className="order-summary">
          <h2>Your order</h2>
          <p>{cart.length} line item(s)</p>

          <label>
            Promo code
            <div className="promo-control">
              <input
                value={promoCode}
                onChange={(event) =>
                  setPromoCode(event.target.value)
                }
                placeholder="READ20"
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
              {"$" + subtotal.toFixed(2)}
            </strong>
          </div>

          <div>
            <span>Discount</span>
            <strong>
              {"−$" + discount.toFixed(2)}
            </strong>
          </div>

          <div>
            <span>Shipping</span>
            <strong>
              {shipping === 0
                ? "Free"
                : "$" + shipping.toFixed(2)}
            </strong>
          </div>

          <div className="summary-total">
            <span>Total</span>
            <strong>
              {"$" + total.toFixed(2)}
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
    file: "app/account/library/page.tsx",
    title: "Functional Digital Library",
    type: "typescript",
    content: `import {
  BookstoreHeader,
} from "../../../components/BookstoreHeader";

const digitalBooks = [
  {
    title: "Cities Beyond the Stars",
    format: "Audiobook",
    progress: 42,
    action: "Continue listening",
  },
  {
    title: "Small Habits, Big Life",
    format: "Ebook",
    progress: 78,
    action: "Continue reading",
  },
];

export default function DigitalLibraryPage() {
  return (
    <main>
      <BookstoreHeader />

      <section className="commerce-page">
        <p className="eyebrow">
          Instant digital delivery
        </p>
        <h1 className="commerce-title">
          Your digital library
        </h1>

        <div className="library-grid">
          {digitalBooks.map((book) => (
            <article
              key={book.title}
              className="library-card"
            >
              <span>{book.format}</span>
              <h2>{book.title}</h2>

              <div className="progress-track">
                <div
                  style={{
                    width: book.progress + "%",
                  }}
                />
              </div>

              <p>{book.progress}% complete</p>
              <button type="button">
                {book.action}
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
`,
  });

  files.push({
    file: "app/subscriptions/page.tsx",
    title: "Functional Book Subscription",
    type: "typescript",
    content: `"use client";

import { useState } from "react";
import {
  BookstoreHeader,
} from "../../components/BookstoreHeader";

const plans = [
  {
    id: "monthly",
    name: "Monthly Reader",
    price: 29,
    description:
      "One curated book, reading guide, and member pricing every month.",
  },
  {
    id: "premium",
    name: "Collector's Shelf",
    price: 49,
    description:
      "Premium hardcover, literary gift, and early access to signed editions.",
  },
  {
    id: "family",
    name: "Family Story Box",
    price: 39,
    description:
      "A family title, children's selection, and shared reading activities.",
  },
];

export default function SubscriptionsPage() {
  const [selectedPlan, setSelectedPlan] =
    useState("monthly");
  const [status, setStatus] = useState("");

  async function subscribe() {
    const response = await fetch(
      "/api/subscriptions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: selectedPlan,
          status: "active",
        }),
      }
    );

    setStatus(
      response.ok
        ? "Subscription created successfully."
        : "Subscription needs review."
    );
  }

  return (
    <main>
      <BookstoreHeader />

      <section className="commerce-page">
        <p className="eyebrow">
          Curated reading delivered
        </p>
        <h1 className="commerce-title">
          ${brand} Book Club
        </h1>

        <div className="subscription-grid">
          {plans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              className={
                selectedPlan === plan.id
                  ? "subscription-card selected"
                  : "subscription-card"
              }
              onClick={() =>
                setSelectedPlan(plan.id)
              }
            >
              <span>{plan.name}</span>
              <strong>
                {"$" + plan.price + "/month"}
              </strong>
              <p>{plan.description}</p>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={subscribe}
        >
          Start subscription
        </button>

        {status ? <p>{status}</p> : null}
      </section>
    </main>
  );
}
`,
  });

  const simplePages = [
    [
      "app/account/page.tsx",
      "Customer Account",
      "Review orders, wishlist items, profile information, and saved addresses.",
    ],
    [
      "app/account/orders/page.tsx",
      "Order History",
      "Track physical shipments and review completed purchases.",
    ],
    [
      "app/authors/page.tsx",
      "Author Spotlights",
      "Explore author biographies, interviews, collections, and signed editions.",
    ],
    [
      "app/categories/page.tsx",
      "Book Categories",
      "Browse fiction, non-fiction, mystery, science fiction, romance, biography, children’s books, and self-help.",
    ],
  ];

  for (const [file, title, description] of simplePages) {
    files.push({
      file,
      title,
      type: "typescript",
      content: `import { BookstoreHeader } from "../../components/BookstoreHeader";

export default function Page() {
  return (
    <main>
      <BookstoreHeader />
      <section className="standard-page">
        <p className="eyebrow">${brand}</p>
        <h1>${title}</h1>
        <p>${description}</p>
      </section>
    </main>
  );
}
`,
    });
  }

  const adminPages = [
    [
      "app/admin/page.tsx",
      "Bookstore Command Center",
      "Sales, orders, customers, inventory, subscriptions, promotions, and catalog health.",
    ],
    [
      "app/admin/books/page.tsx",
      "Book Management",
      "Create books, manage authors, formats, pricing, metadata, SEO, and digital files.",
    ],
    [
      "app/admin/orders/page.tsx",
      "Order Management",
      "Review payments, fulfillment, shipment status, refunds, and digital delivery.",
    ],
    [
      "app/admin/inventory/page.tsx",
      "Inventory Management",
      "Monitor stock levels, low-stock alerts, formats, warehouses, and backorders.",
    ],
    [
      "app/admin/customers/page.tsx",
      "Customer Management",
      "Review customer accounts, order history, subscriptions, reviews, and support context.",
    ],
    [
      "app/admin/promotions/page.tsx",
      "Promotions and Discounts",
      "Create promo codes, featured campaigns, bundles, and abandoned-cart recovery offers.",
    ],
    [
      "app/admin/subscriptions/page.tsx",
      "Subscription Management",
      "Manage monthly book boxes, curated reads, renewals, gifts, and member benefits.",
    ],
  ];

  for (const [file, title, description] of adminPages) {
    const relative = file.split("/").slice(0, -1).map(() => "..").join("/");

    files.push({
      file,
      title,
      type: "typescript",
      content: `import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <strong>${brand} OS</strong>
        <Link href="/admin">Overview</Link>
        <Link href="/admin/books">Books</Link>
        <Link href="/admin/orders">Orders</Link>
        <Link href="/admin/inventory">Inventory</Link>
        <Link href="/admin/customers">Customers</Link>
        <Link href="/admin/promotions">Promotions</Link>
        <Link href="/admin/subscriptions">
          Subscriptions
        </Link>
      </aside>

      <section className="admin-content">
        <p className="eyebrow">
          Living bookstore operating system
        </p>
        <h1>${title}</h1>
        <p>${description}</p>

        <div className="admin-metrics">
          <article>
            <span>Orders today</span>
            <strong>42</strong>
          </article>
          <article>
            <span>Revenue</span>
            <strong>$4,286</strong>
          </article>
          <article>
            <span>Low stock</span>
            <strong>8</strong>
          </article>
          <article>
            <span>Subscribers</span>
            <strong>1,284</strong>
          </article>
        </div>
      </section>
    </main>
  );
}
`,
    });

    void relative;
  }

  files.push({
    file: "prisma/schema.prisma",
    title: "Bookstore Database Schema",
    type: "prisma",
    content: `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Book {
  id          String       @id @default(cuid())
  slug        String       @unique
  title       String
  description String
  price       Decimal      @db.Decimal(10, 2)
  category    String
  language    String       @default("English")
  authorId    String
  author      Author       @relation(fields: [authorId], references: [id])
  formats     BookFormat[]
  reviews     Review[]
  inventory   Inventory[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model Author {
  id        String   @id @default(cuid())
  name      String
  biography String
  books     Book[]
  createdAt DateTime @default(now())
}

model BookFormat {
  id            String   @id @default(cuid())
  bookId        String
  book          Book     @relation(fields: [bookId], references: [id])
  format        String
  price         Decimal  @db.Decimal(10, 2)
  digitalFile   String?
  audiobookFile String?
  isbn          String?
}

model Inventory {
  id        String @id @default(cuid())
  bookId    String
  book      Book   @relation(fields: [bookId], references: [id])
  format    String
  quantity  Int    @default(0)
  warehouse String?
}

model Customer {
  id            String         @id @default(cuid())
  email         String         @unique
  name          String
  orders        Order[]
  reviews       Review[]
  wishlistItems WishlistItem[]
  subscriptions Subscription[]
}

model Order {
  id         String      @id @default(cuid())
  customerId String?
  customer   Customer?   @relation(fields: [customerId], references: [id])
  status     String      @default("pending")
  subtotal   Decimal     @db.Decimal(10, 2)
  shipping   Decimal     @db.Decimal(10, 2)
  total      Decimal     @db.Decimal(10, 2)
  tracking   String?
  items      OrderItem[]
  createdAt  DateTime    @default(now())
}

model OrderItem {
  id       String  @id @default(cuid())
  orderId  String
  order    Order   @relation(fields: [orderId], references: [id])
  bookId   String
  format   String
  quantity Int
  price    Decimal @db.Decimal(10, 2)
}

model WishlistItem {
  id         String   @id @default(cuid())
  customerId String
  customer   Customer @relation(fields: [customerId], references: [id])
  bookId     String
  createdAt  DateTime @default(now())
}

model Review {
  id         String   @id @default(cuid())
  bookId     String
  book       Book     @relation(fields: [bookId], references: [id])
  customerId String
  customer   Customer @relation(fields: [customerId], references: [id])
  rating     Int
  title      String
  body       String
  status     String   @default("pending")
  createdAt  DateTime @default(now())
}

model Subscription {
  id         String   @id @default(cuid())
  customerId String
  customer   Customer @relation(fields: [customerId], references: [id])
  plan       String
  status     String   @default("active")
  renewsAt   DateTime
  createdAt  DateTime @default(now())
}

model Promotion {
  id        String   @id @default(cuid())
  code      String   @unique
  name      String
  discount  Int
  active    Boolean  @default(true)
  startsAt  DateTime?
  endsAt    DateTime?
  createdAt DateTime @default(now())
}
`,
  });

  files.push({
    file: "app/globals.css",
    title: "Premium Bookstore Design System",
    type: "css",
    content: `:root {
  --paper: #f7f0e5;
  --paper-deep: #eadbc8;
  --ink: #201a17;
  --muted: #6f625b;
  --wine: #7a2e3b;
  --forest: #23483d;
  --gold: #bd8b4b;
  --surface: #fffaf3;
  --line: rgba(57, 43, 35, .14);
  --shadow: 0 24px 70px rgba(63, 43, 30, .13);
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background:
    radial-gradient(
      circle at 10% 0%,
      rgba(189, 139, 75, .12),
      transparent 32%
    ),
    var(--paper);
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
select {
  font: inherit;
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: auto auto minmax(220px, 1fr) auto;
  align-items: center;
  gap: 24px;
  padding: 18px 5vw;
  border-bottom: 1px solid var(--line);
  background: rgba(247, 240, 229, .92);
  backdrop-filter: blur(18px);
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-family: Georgia, serif;
  font-size: 24px;
  font-weight: 800;
}

.brand-icon {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 14px;
  background: var(--wine);
  color: #fff;
}

.desktop-nav,
.header-actions {
  display: flex;
  gap: 18px;
  align-items: center;
  font-size: 14px;
  font-weight: 700;
}

.header-search input {
  width: 100%;
  padding: 13px 16px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface);
}

.cart-link,
.primary-button,
.book-card-footer button,
.newsletter-form button {
  border: 0;
  border-radius: 999px;
  background: var(--wine);
  color: #fff;
  padding: 13px 18px;
  font-weight: 800;
}

.bookstore-hero {
  display: grid;
  min-height: 680px;
  grid-template-columns: 1.05fr .95fr;
  align-items: center;
  gap: 64px;
  padding: 80px 7vw;
  overflow: hidden;
}

.hero-copy h1,
.section-heading h2,
.author-spotlight h2,
.book-club-panel h2,
.newsletter-panel h2 {
  margin: 0;
  font-family: Georgia, serif;
  font-weight: 700;
  letter-spacing: -.04em;
}

.hero-copy h1 {
  max-width: 760px;
  font-size: clamp(56px, 7vw, 96px);
  line-height: .95;
}

.hero-copy h1 span {
  color: var(--wine);
}

.eyebrow {
  margin: 0 0 16px;
  color: var(--wine);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: .24em;
  text-transform: uppercase;
}

.hero-lead {
  max-width: 670px;
  margin-top: 28px;
  color: var(--muted);
  font-size: 20px;
  line-height: 1.7;
}

.hero-actions,
.hero-proof {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 30px;
}

.secondary-button {
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 13px 18px;
  background: var(--surface);
  font-weight: 800;
}

.hero-proof {
  color: var(--muted);
  font-size: 13px;
  font-weight: 700;
}

.hero-books {
  position: relative;
  min-height: 540px;
}

.hero-book {
  position: absolute;
  border-radius: 18px;
  box-shadow: var(--shadow);
}

.hero-book-main {
  right: 15%;
  top: 4%;
  transform: rotate(4deg);
}

.hero-book-secondary {
  left: 4%;
  bottom: 5%;
  transform: rotate(-8deg);
}

.hero-promo {
  position: absolute;
  right: 0;
  bottom: 12%;
  display: grid;
  width: 150px;
  height: 150px;
  place-items: center;
  align-content: center;
  border-radius: 50%;
  background: var(--gold);
  color: #fff;
  box-shadow: var(--shadow);
  transform: rotate(8deg);
}

.hero-promo strong {
  font-size: 28px;
}

.content-section {
  padding: 72px 7vw;
}

.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 30px;
}

.section-heading h2 {
  font-size: clamp(38px, 5vw, 64px);
}

.section-heading p {
  max-width: 620px;
  color: var(--muted);
  line-height: 1.6;
}

.book-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 26px;
}

.book-card {
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 24px;
  background: var(--surface);
  box-shadow: 0 18px 45px rgba(63, 43, 30, .08);
  transition:
    transform .2s ease,
    box-shadow .2s ease;
}

.book-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow);
}

.book-cover-wrap {
  display: block;
  padding: 22px;
  background: var(--paper-deep);
}

.book-cover {
  width: 100%;
  height: auto;
  border-radius: 12px;
}

.book-card-body {
  padding: 20px;
}

.book-category {
  color: var(--wine);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: .18em;
  text-transform: uppercase;
}

.book-card h3 {
  margin: 8px 0;
  font-family: Georgia, serif;
  font-size: 23px;
}

.book-author,
.rating-row {
  color: var(--muted);
}

.rating-row,
.book-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
  font-size: 13px;
}

.category-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.category-card {
  min-height: 170px;
  padding: 28px;
  border-radius: 24px;
  background:
    linear-gradient(
      135deg,
      rgba(122, 46, 59, .95),
      rgba(35, 72, 61, .94)
    );
  color: #fff;
}

.category-card span {
  font-family: Georgia, serif;
  font-size: 28px;
}

.category-card p {
  max-width: 280px;
  color: rgba(255,255,255,.78);
  line-height: 1.5;
}

.author-spotlight,
.book-club-panel,
.newsletter-panel {
  display: grid;
  grid-template-columns: 1fr .8fr;
  align-items: center;
  gap: 40px;
  margin: 44px 7vw;
  padding: 52px;
  border-radius: 34px;
  background: var(--forest);
  color: #fff;
}

.author-spotlight h2,
.book-club-panel h2,
.newsletter-panel h2 {
  font-size: clamp(38px, 5vw, 62px);
}

.author-spotlight p,
.book-club-panel p {
  color: rgba(255,255,255,.72);
  line-height: 1.7;
}

.author-card {
  display: flex;
  gap: 20px;
  padding: 28px;
  border: 1px solid rgba(255,255,255,.15);
  border-radius: 24px;
  background: rgba(255,255,255,.08);
}

.author-avatar {
  display: grid;
  min-width: 80px;
  height: 80px;
  place-items: center;
  border-radius: 50%;
  background: var(--gold);
  font-family: Georgia, serif;
  font-size: 26px;
}

.book-club-panel {
  background: var(--wine);
}

.book-club-offer {
  display: grid;
  justify-items: start;
  gap: 10px;
}

.book-club-offer strong {
  font-family: Georgia, serif;
  font-size: 40px;
}

.book-club-offer a {
  border-radius: 999px;
  padding: 14px 20px;
  background: #fff;
  color: var(--wine);
  font-weight: 900;
}

.newsletter-panel {
  background: var(--ink);
}

.newsletter-form {
  display: grid;
  gap: 12px;
}

.newsletter-form input {
  padding: 16px 18px;
  border: 1px solid rgba(255,255,255,.15);
  border-radius: 999px;
  background: rgba(255,255,255,.08);
  color: #fff;
}

.catalog-shell {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 34px;
  padding: 54px 5vw;
}

.catalog-filters {
  display: grid;
  align-content: start;
  gap: 18px;
  padding: 24px;
  border: 1px solid var(--line);
  border-radius: 24px;
  background: var(--surface);
}

.catalog-filters label {
  display: grid;
  gap: 8px;
  font-weight: 800;
}

.catalog-filters input,
.catalog-filters select {
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: #fff;
}

.catalog-heading {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
  color: var(--muted);
}

.book-detail {
  display: grid;
  grid-template-columns: minmax(280px, 420px) 1fr;
  gap: 58px;
  padding: 70px 8vw;
}

.detail-cover {
  width: 100%;
  height: auto;
  border-radius: 20px;
  box-shadow: var(--shadow);
}

.detail-content h1 {
  margin: 10px 0;
  font-family: Georgia, serif;
  font-size: clamp(48px, 6vw, 78px);
  line-height: 1;
}

.detail-author,
.detail-rating,
.detail-description {
  color: var(--muted);
  line-height: 1.7;
}

.format-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 28px 0;
  border: 0;
  padding: 0;
}

.format-selector label span {
  display: inline-flex;
  padding: 12px 16px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface);
}

.format-selector input {
  position: absolute;
  opacity: 0;
}

.detail-purchase {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.detail-purchase strong {
  margin-right: 14px;
  font-size: 30px;
}

.detail-purchase button {
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 13px 18px;
  background: var(--surface);
  font-weight: 800;
}

.detail-purchase button:first-of-type {
  border-color: var(--wine);
  background: var(--wine);
  color: #fff;
}

.standard-page {
  min-height: 70vh;
  padding: 80px 8vw;
}

.standard-page h1 {
  max-width: 900px;
  margin: 0;
  font-family: Georgia, serif;
  font-size: clamp(52px, 7vw, 90px);
}

.standard-page p {
  max-width: 760px;
  color: var(--muted);
  font-size: 20px;
  line-height: 1.7;
}

.admin-shell {
  display: grid;
  min-height: 100vh;
  grid-template-columns: 260px 1fr;
  background: #11100f;
  color: #fff;
}

.admin-sidebar {
  display: grid;
  align-content: start;
  gap: 12px;
  padding: 32px;
  border-right: 1px solid rgba(255,255,255,.08);
}

.admin-sidebar strong {
  margin-bottom: 24px;
  font-family: Georgia, serif;
  font-size: 24px;
}

.admin-sidebar a {
  padding: 12px 14px;
  border-radius: 12px;
  color: rgba(255,255,255,.7);
}

.admin-sidebar a:hover {
  background: rgba(255,255,255,.08);
  color: #fff;
}

.admin-content {
  padding: 56px;
}

.admin-content h1 {
  margin: 0;
  font-family: Georgia, serif;
  font-size: clamp(48px, 6vw, 80px);
}

.admin-content > p {
  max-width: 760px;
  color: rgba(255,255,255,.65);
  line-height: 1.7;
}

.admin-metrics {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin-top: 40px;
}

.admin-metrics article {
  display: grid;
  gap: 14px;
  padding: 24px;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 20px;
  background: rgba(255,255,255,.05);
}

.admin-metrics span {
  color: rgba(255,255,255,.55);
}

.admin-metrics strong {
  font-size: 32px;
}


.commerce-page,
.checkout-layout {
  padding: 70px 7vw;
}

.commerce-title,
.checkout-form h1 {
  margin: 0 0 32px;
  font-family: Georgia, serif;
  font-size: clamp(48px, 6vw, 82px);
  line-height: 1;
}

.cart-layout,
.checkout-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 34px;
  align-items: start;
}

.cart-items {
  display: grid;
  gap: 16px;
}

.cart-item {
  display: grid;
  grid-template-columns: 110px 1fr auto;
  gap: 22px;
  padding: 20px;
  border: 1px solid var(--line);
  border-radius: 22px;
  background: var(--surface);
}

.cart-item img {
  border-radius: 10px;
}

.quantity-control,
.promo-control {
  display: flex;
  gap: 10px;
  align-items: center;
}

.quantity-control button,
.promo-control button {
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--surface);
  padding: 8px 12px;
}

.cart-item-price {
  display: grid;
  justify-items: end;
  align-content: space-between;
}

.cart-item-price button {
  border: 0;
  background: transparent;
  color: var(--wine);
  cursor: pointer;
}

.order-summary,
.checkout-form,
.empty-state {
  padding: 28px;
  border: 1px solid var(--line);
  border-radius: 24px;
  background: var(--surface);
  box-shadow: 0 18px 50px rgba(63,43,30,.08);
}

.order-summary {
  position: sticky;
  top: 100px;
  display: grid;
  gap: 18px;
}

.order-summary > div {
  display: flex;
  justify-content: space-between;
}

.summary-total {
  padding-top: 18px;
  border-top: 1px solid var(--line);
  font-size: 20px;
}

.checkout-form {
  display: grid;
  gap: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.form-grid label,
.order-summary label {
  display: grid;
  gap: 8px;
  font-weight: 800;
}

.form-grid input,
.form-grid select,
.promo-control input {
  width: 100%;
  padding: 13px 14px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: #fff;
}

.full-field {
  grid-column: 1 / -1;
}

.checkout-status {
  color: var(--forest);
  font-weight: 800;
}

.library-grid,
.subscription-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 22px;
  margin: 30px 0;
}

.library-card,
.subscription-card {
  display: grid;
  gap: 16px;
  padding: 26px;
  border: 1px solid var(--line);
  border-radius: 22px;
  background: var(--surface);
  text-align: left;
}

.subscription-card {
  cursor: pointer;
}

.subscription-card.selected {
  border-color: var(--wine);
  box-shadow:
    0 0 0 3px rgba(122,46,59,.12);
}

.progress-track {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--paper-deep);
}

.progress-track > div {
  height: 100%;
  border-radius: inherit;
  background: var(--wine);
}

@media (max-width: 1100px) {
  .site-header {
    grid-template-columns: 1fr auto;
  }

  .desktop-nav,
  .header-search {
    display: none;
  }

  .book-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .bookstore-hero,
  .author-spotlight,
  .book-club-panel,
  .newsletter-panel,
  .catalog-shell,
  .book-detail {
    grid-template-columns: 1fr;
  }

  .admin-metrics {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .site-header {
    padding: 14px 18px;
  }

  .header-actions a:not(.cart-link) {
    display: none;
  }

  .bookstore-hero {
    min-height: auto;
    padding: 58px 22px;
  }

  .hero-books {
    min-height: 430px;
  }

  .content-section {
    padding: 54px 22px;
  }

  .book-grid,
  .category-grid,
  .admin-metrics {
    grid-template-columns: 1fr;
  }

  .author-spotlight,
  .book-club-panel,
  .newsletter-panel {
    margin: 30px 18px;
    padding: 30px;
  }

  .admin-shell {
    grid-template-columns: 1fr;
  }

  .admin-sidebar {
    display: none;
  }

  .admin-content {
    padding: 32px 20px;
  }
}
`,
  });

  files.push({
    file: "living-os-plan.json",
    title: "Living OS Production Plan",
    type: "json",
    content: JSON.stringify(plan, null, 2),
  });

  return files;
}
