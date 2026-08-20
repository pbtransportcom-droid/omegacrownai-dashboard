import fs from "node:fs";
import path from "node:path";

import {
  omegaProducts,
} from "./products";

export type OmegaDiscoveredRoute = {
  route: string;
  file: string;
  surface: "page" | "api";
  registered: boolean;
  matchedProductIds: string[];
};

function walk(directory: string): string[] {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const files: string[] = [];

  for (
    const entry of fs.readdirSync(
      directory,
      {
        withFileTypes: true,
      }
    )
  ) {
    const target =
      path.join(
        directory,
        entry.name
      );

    if (entry.isDirectory()) {
      files.push(
        ...walk(target)
      );
    } else {
      files.push(target);
    }
  }

  return files;
}

function routeFromFile(
  appRoot: string,
  file: string
) {
  const relative =
    path.relative(
      appRoot,
      file
    )
    .replaceAll("\\", "/");

  let route =
    relative
      .replace(/\/page\.tsx$/, "")
      .replace(/\/route\.ts$/, "")
      .replace(/^page\.tsx$/, "")
      .replace(/^route\.ts$/, "");

  route = route
    .replace(/\(.*?\)\//g, "")
    .replace(
      /\[\[\.\.\.(.*?)\]\]/g,
      ":$1*"
    )
    .replace(
      /\[\.\.\.(.*?)\]/g,
      ":$1*"
    )
    .replace(
      /\[(.*?)\]/g,
      ":$1"
    );

  return "/" + route;
}

function normalizeRoute(
  value: string
) {
  return value
    .toLowerCase()
    .replace(/:[^/]+\*/g, ":param")
    .replace(/:[^/]+/g, ":param")
    .replace(/\[[^\]]+\]/g, ":param")
    .replace(/\/+/g, "/")
    .replace(/\/$/, "") || "/";
}

function routeMatches(
  actual: string,
  registered: string
) {
  const a =
    normalizeRoute(actual);

  const b =
    normalizeRoute(registered);

  if (a === b) {
    return true;
  }

  if (
    b !== "/" &&
    a.startsWith(
      b + "/"
    )
  ) {
    return true;
  }

  return false;
}

export function discoverOmegaRoutes(
  root = process.cwd()
) {
  const appRoot =
    path.join(
      root,
      "app"
    );

  const files =
    walk(appRoot)
      .filter(
        file =>
          file.endsWith(
            "/page.tsx"
          ) ||
          file.endsWith(
            "/route.ts"
          ) ||
          file ===
            path.join(
              appRoot,
              "page.tsx"
            )
      );

  const discovered:
    OmegaDiscoveredRoute[] =
      files.map(file => {
        const route =
          routeFromFile(
            appRoot,
            file
          );

        const matchedProducts =
          omegaProducts.filter(
            product => {
              const routes = [
                product.href,
                ...(product.relatedRoutes || []),
              ];

              return routes.some(
                registered =>
                  routeMatches(
                    route,
                    registered
                  )
              );
            }
          );

        return {
          route,
          file:
            path.relative(
              root,
              file
            )
            .replaceAll(
              "\\",
              "/"
            ),
          surface:
            file.endsWith(
              "page.tsx"
            )
              ? "page"
              : "api",
          registered:
            matchedProducts
              .length > 0,
          matchedProductIds:
            matchedProducts.map(
              product =>
                product.id
            ),
        };
      });

  discovered.sort(
    (a, b) =>
      a.route.localeCompare(
        b.route
      )
  );

  return discovered;
}

export function buildOmegaDiscoveryReport(
  root = process.cwd()
) {
  const routes =
    discoverOmegaRoutes(root);

  const registered =
    routes.filter(
      route =>
        route.registered
    );

  const unregistered =
    routes.filter(
      route =>
        !route.registered
    );

  const pages =
    routes.filter(
      route =>
        route.surface === "page"
    );

  const apis =
    routes.filter(
      route =>
        route.surface === "api"
    );

  return {
    generatedAt:
      new Date()
        .toISOString(),
    totals: {
      routes:
        routes.length,
      pages:
        pages.length,
      apis:
        apis.length,
      registered:
        registered.length,
      unregistered:
        unregistered.length,
      coveragePercent:
        routes.length
          ? Math.round(
              (
                registered.length /
                routes.length
              ) * 100
            )
          : 100,
    },
    registered,
    unregistered,
  };
}
