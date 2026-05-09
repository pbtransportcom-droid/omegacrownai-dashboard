import { chromium } from "@playwright/test";
import { prisma } from "@/lib/db";
import { RuntimeHub } from "@/lib/sugent/runtime/hub";
import { AuditLogger } from "@/lib/sugent/core/auditLogger";
import { defaultBrowserPolicy, validateBrowserUrl } from "./policy";

function truncate(value: string | null | undefined, max: number) {
  const text = String(value || "");
  if (text.length <= max) return text;

  return text.slice(0, max) + `\n\n[truncated ${text.length - max} chars]`;
}

export async function runBrowserTask({
  projectId,
  sessionId,
  runtimeSessionId,
  url,
  source = "api",
}: {
  projectId?: string | null;
  sessionId?: string | null;
  runtimeSessionId?: string | null;
  url: string;
  source?: string;
}) {
  const startedAt = Date.now();
  const logs: string[] = [];
  const policy = defaultBrowserPolicy;
  const validation = validateBrowserUrl(url, policy);

  const task = await prisma.browserTask.create({
    data: {
      projectId: projectId || null,
      sessionId: sessionId || null,
      runtimeSessionId: runtimeSessionId || null,
      url,
      status: validation.ok ? "running" : "blocked",
      logs,
      metrics: {},
      policy,
      error: validation.ok ? null : validation.error,
    },
  });

  if (runtimeSessionId) {
    RuntimeHub.emit(runtimeSessionId, {
      type: "tool_call",
      tool: "browser",
      args: {
        taskId: task.id,
        url,
        source,
      },
    });
  }

  if (!validation.ok) {
    if (projectId) {
      await AuditLogger.log({
        projectId,
        actorType: "system",
        actorId: "browser_automation",
        action: "SAFETY_BLOCKED",
        metadata: {
          action: "browser_task_blocked",
          taskId: task.id,
          url,
          error: validation.error,
        },
      });
    }

    return {
      ok: false,
      task,
      error: validation.error,
    };
  }

  let browser: any = null;

  try {
    logs.push(`Launching browser for ${url}`);

    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(url, {
      timeout: policy.timeoutMs,
      waitUntil: "domcontentloaded",
    });

    const title = await page.title();
    const html = await page.content();
    const text = await page.locator("body").innerText({ timeout: 5000 }).catch(() => "");

    logs.push(`Loaded page: ${title || "untitled"}`);

    const result = {
      title,
      url: page.url(),
      textPreview: truncate(text, 2000),
      htmlLength: html.length,
      textLength: text.length,
    };

    const updated = await prisma.browserTask.update({
      where: { id: task.id },
      data: {
        status: "success",
        title,
        html: truncate(html, policy.maxHtmlChars),
        text: truncate(text, policy.maxTextChars),
        result,
        logs,
        metrics: {
          durationMs: Date.now() - startedAt,
          timeoutMs: policy.timeoutMs,
        },
      },
    });

    if (runtimeSessionId) {
      RuntimeHub.emit(runtimeSessionId, {
        type: "tool_result",
        tool: "browser",
        result: {
          taskId: updated.id,
          status: updated.status,
          url: updated.url,
          title: updated.title,
          result,
        },
      });
    }

    if (projectId) {
      await AuditLogger.log({
        projectId,
        actorType: "system",
        actorId: "browser_automation",
        action: "SAFETY_CHECKED",
        metadata: {
          action: "browser_task_completed",
          taskId: updated.id,
          url,
          title,
        },
      });
    }

    await browser.close();

    return {
      ok: true,
      task: updated,
      error: null,
    };
  } catch (error: any) {
    if (browser) {
      await browser.close().catch(() => {});
    }

    const updated = await prisma.browserTask.update({
      where: { id: task.id },
      data: {
        status: "error",
        error: error?.message || "Browser task failed.",
        logs,
        metrics: {
          durationMs: Date.now() - startedAt,
          timeoutMs: policy.timeoutMs,
        },
      },
    });

    if (runtimeSessionId) {
      RuntimeHub.emit(runtimeSessionId, {
        type: "tool_result",
        tool: "browser",
        result: {
          taskId: updated.id,
          status: updated.status,
          url: updated.url,
          error: updated.error,
        },
      });
    }

    return {
      ok: false,
      task: updated,
      error: updated.error,
    };
  }
}
