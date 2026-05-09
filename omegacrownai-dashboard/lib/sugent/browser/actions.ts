export type BrowserAction =
  | {
      type: "navigate";
      url: string;
    }
  | {
      type: "extract";
      selector?: string;
      mode?: "text" | "html" | "title" | "links";
      name?: string;
    }
  | {
      type: "click";
      selector: string;
    }
  | {
      type: "type";
      selector: string;
      value: string;
    }
  | {
      type: "waitFor";
      selector?: string;
      ms?: number;
    }
  | {
      type: "screenshot";
      name?: string;
    };

export type BrowserActionResult = {
  index: number;
  type: string;
  ok: boolean;
  name?: string;
  selector?: string;
  output?: any;
  error?: string | null;
};

export function normalizeBrowserActions(input: any): BrowserAction[] {
  if (Array.isArray(input?.actions)) {
    return input.actions.map(normalizeAction).filter(Boolean) as BrowserAction[];
  }

  if (Array.isArray(input)) {
    return input.map(normalizeAction).filter(Boolean) as BrowserAction[];
  }

  if (input?.url) {
    return [
      {
        type: "navigate",
        url: String(input.url),
      },
      {
        type: "extract",
        mode: "title",
        name: "title",
      },
      {
        type: "extract",
        selector: "body",
        mode: "text",
        name: "bodyText",
      },
    ];
  }

  return [];
}

function normalizeAction(action: any): BrowserAction | null {
  if (!action || typeof action !== "object") return null;

  const type = String(action.type || "").trim();

  if (type === "navigate") {
    return {
      type,
      url: String(action.url || ""),
    };
  }

  if (type === "extract") {
    return {
      type,
      selector: action.selector ? String(action.selector) : undefined,
      mode: ["text", "html", "title", "links"].includes(String(action.mode))
        ? action.mode
        : "text",
      name: action.name ? String(action.name) : undefined,
    };
  }

  if (type === "click") {
    return {
      type,
      selector: String(action.selector || ""),
    };
  }

  if (type === "type") {
    return {
      type,
      selector: String(action.selector || ""),
      value: String(action.value || ""),
    };
  }

  if (type === "waitFor") {
    return {
      type,
      selector: action.selector ? String(action.selector) : undefined,
      ms: action.ms ? Number(action.ms) : undefined,
    };
  }

  if (type === "screenshot") {
    return {
      type,
      name: action.name ? String(action.name) : undefined,
    };
  }

  return null;
}

export function extractActionsFromMessage(message: string) {
  const text = String(message || "");

  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    try {
      return normalizeBrowserActions(JSON.parse(fenced[1]));
    } catch {}
  }

  const actionIndex = text.toLowerCase().indexOf("actions:");
  if (actionIndex !== -1) {
    const after = text.slice(actionIndex + "actions:".length).trim();
    try {
      return normalizeBrowserActions(JSON.parse(after));
    } catch {}
  }

  return [];
}
