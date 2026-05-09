import { chromium } from "@playwright/test";
import { prisma } from "@/lib/db";
import { RuntimeHub } from "@/lib/sugent/runtime/hub";
import { AuditLogger } from "@/lib/sugent/core/auditLogger";
import {
  defaultBrowserPolicy,
  validateBrowserUrl,
  validateBrowserActions,
} from "./policy";
import { saveBrowserScreenshotArtifact } from "./artifacts";
import {
  normalizeBrowserActions,
  type BrowserAction,
  type BrowserActionResult,
} from "./actions";

function truncate(value: string | null | undefined, max: number) {
  const text = String(value || "");
  if (text.length <= max) return text;

  return text.slice(0, max) + `\n\n[truncated ${text.length - max} chars]`;
}

async function runBrowserActions({
  page,
  actions,
  policy,
  taskId,
  projectId,
}: {
  page: any;
  actions: BrowserAction[];
  policy: typeof defaultBrowserPolicy;
  taskId: string;
  projectId?: string | null;
}) {
  const results: BrowserActionResult[] = [];
  const extracted: Record<string, any> = {};

  for (let index = 0; index < actions.length; index++) {
    const action = actions[index];

    try {
      if (action.type === "navigate") {
        await page.goto(action.url, {
          timeout: policy.timeoutMs,
          waitUntil: "domcontentloaded",
        });

        results.push({
          index,
          type: action.type,
          ok: true,
          output: {
            url: page.url(),
            title: await page.title(),
          },
        });

        continue;
      }

      if (action.type === "extract") {
        const mode = action.mode || "text";
        const name = action.name || action.selector || mode;

        let output: any = null;

        if (mode === "title") {
          output = await page.title();
        } else if (mode === "links") {
          output = await page
            .locator(action.selector || "a")
            .evaluateAll((nodes: any[]) =>
              nodes.slice(0, 100).map((node: any) => ({
                text: node.innerText || node.textContent || "",
                href: node.href || "",
              }))
            );
        } else if (mode === "html") {
          output = await page.locator(action.selector || "body").innerHTML({
            timeout: 5000,
          });
          output = truncate(output, policy.maxHtmlChars);
        } else {
          output = await page.locator(action.selector || "body").innerText({
            timeout: 5000,
          });
          output = truncate(output, policy.maxTextChars);
        }

        extracted[name] = output;

        results.push({
          index,
          type: action.type,
          ok: true,
          name,
          selector: action.selector,
          output,
        });

        continue;
      }

      if (action.type === "click") {
        await page.locator(action.selector).click({ timeout: 5000 });

        results.push({
          index,
          type: action.type,
          ok: true,
          selector: action.selector,
        });

        continue;
      }

      if (action.type === "type") {
        await page.locator(action.selector).fill(action.value, { timeout: 5000 });

        results.push({
          index,
          type: action.type,
          ok: true,
          selector: action.selector,
          output: {
            length: action.value.length,
          },
        });

        continue;
      }

      if (action.type === "waitFor") {
        if (action.selector) {
          await page.locator(action.selector).waitFor({
            timeout: Math.min(policy.maxWaitMs, action.ms || policy.maxWaitMs),
          });
        } else {
          await page.waitForTimeout(Math.min(policy.maxWaitMs, action.ms || 1000));
        }

        results.push({
          index,
          type: action.type,
          ok: true,
          selector: action.selector,
          output: {
            ms: action.ms || null,
          },
        });

        continue;
      }

      if (action.type === "screenshot") {
        const buffer = await page.screenshot({
          fullPage: true,
          type: "png",
        });

        const artifact = await saveBrowserScreenshotArtifact({
          projectId: projectId || null,
          taskId,
          name: action.name || "screenshot",
          buffer,
          metadata: {
            url: page.url(),
            title: await page.title().catch(() => ""),
            actionIndex: index,
          },
        });

        extracted[action.name || "screenshot"] = {
          artifactId: artifact.id,
          url: artifact.url,
          sizeBytes: artifact.sizeBytes,
        };

        results.push({
          index,
          type: action.type,
          ok: true,
          name: action.name || "screenshot",
          output: {
            artifactId: artifact.id,
            url: artifact.url,
            sizeBytes: artifact.sizeBytes,
          },
        });

        continue;
      }
    } catch (error: any) {
      results.push({
        index,
        type: action.type,
        ok: false,
        selector: (action as any).selector,
        error: error?.message || "Browser action failed.",
      });

      break;
    }
  }

  return {
    results,
    extracted,
  };
}

export async function runBrowserTask({
  projectId,
  sessionId,
  runtimeSessionId,
  url,
  actions,
  source = "api",
}: {
  projectId?: string | null;
  sessionId?: string | null;
  runtimeSessionId?: string | null;
  url?: string | null;
  actions?: any;
  source?: string;
}) {
  const startedAt = Date.now();
  const logs: string[] = [];
  const policy = defaultBrowserPolicy;

  const normalizedActions = normalizeBrowserActions(
    actions && Array.isArray(actions) ? actions : actions || { url }
  );

  const firstNavigate = normalizedActions.find((action) => action.type === "navigate");
  const taskUrl = url || (firstNavigate?.type === "navigate" ? firstNavigate.url : "");

  const urlValidation = validateBrowserUrl(taskUrl, policy);
  const actionsValidation = validateBrowserActions(normalizedActions, policy);

  const validation = !urlValidation.ok ? urlValidation : actionsValidation;

  const task = await prisma.browserTask.create({
    data: {
      projectId: projectId || null,
      sessionId: sessionId || null,
      runtimeSessionId: runtimeSessionId || null,
      url: taskUrl || "about:blank",
      status: validation.ok ? "running" : "blocked",
      logs,
      metrics: {},
      policy,
      result: {
        actions: normalizedActions,
      },
      error: validation.ok ? null : validation.error,
    },
  });

  if (runtimeSessionId) {
    RuntimeHub.emit(runtimeSessionId, {
      type: "tool_call",
      tool: "browser",
      args: {
        taskId: task.id,
        url: taskUrl,
        source,
        actions: normalizedActions.map((action) => action.type),
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
          url: taskUrl,
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
    logs.push(`Launching browser for ${taskUrl}`);

    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    const actionRun = await runBrowserActions({
      page,
      actions: normalizedActions,
      policy,
      taskId: task.id,
      projectId: projectId || null,
    });

    const title = await page.title().catch(() => "");
    const html = await page.content().catch(() => "");
    const text = await page.locator("body").innerText({ timeout: 5000 }).catch(() => "");

    const hasFailedAction = actionRun.results.some((result) => !result.ok);

    logs.push(`Completed ${actionRun.results.length} browser actions`);

    const result = {
      url: page.url(),
      title,
      htmlLength: html.length,
      textLength: text.length,
      textPreview: truncate(text, 2000),
      actions: normalizedActions,
      actionResults: actionRun.results,
      extracted: actionRun.extracted,
    };

    const updated = await prisma.browserTask.update({
      where: { id: task.id },
      data: {
        status: hasFailedAction ? "error" : "success",
        title,
        html: truncate(html, policy.maxHtmlChars),
        text: truncate(text, policy.maxTextChars),
        result,
        logs,
        error: hasFailedAction
          ? actionRun.results.find((item) => !item.ok)?.error || "Browser action failed."
          : null,
        metrics: {
          durationMs: Date.now() - startedAt,
          timeoutMs: policy.timeoutMs,
          actionCount: normalizedActions.length,
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
          error: updated.error,
        },
      });
    }

    if (projectId) {
      await AuditLogger.log({
        projectId,
        actorType: "system",
        actorId: "browser_automation",
        action: hasFailedAction ? "SAFETY_BLOCKED" : "SAFETY_CHECKED",
        metadata: {
          action: "browser_actions_completed",
          taskId: updated.id,
          url: taskUrl,
          title,
          actionCount: normalizedActions.length,
        },
      });
    }

    await browser.close();

    return {
      ok: !hasFailedAction,
      task: updated,
      error: updated.error,
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
          actionCount: normalizedActions.length,
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
