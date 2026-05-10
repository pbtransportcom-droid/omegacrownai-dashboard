import { prisma } from "@/lib/db";
import { setDepartmentKPI, writeDepartmentMemory } from "@/lib/sugent/company/departments";

function slugify(value: string) {
  return String(value || "article")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export function triageSupportMessage(message: string) {
  const text = message.toLowerCase();

  let priority = "normal";
  if (text.includes("urgent") || text.includes("down") || text.includes("broken") || text.includes("cannot access")) {
    priority = "high";
  }

  let category = "general";
  if (text.includes("billing") || text.includes("invoice") || text.includes("payment")) category = "billing";
  if (text.includes("login") || text.includes("password") || text.includes("access")) category = "account_access";
  if (text.includes("bug") || text.includes("error") || text.includes("crash")) category = "technical";
  if (text.includes("feature") || text.includes("request")) category = "feature_request";

  let sentiment = "neutral";
  if (text.includes("angry") || text.includes("frustrated") || text.includes("upset")) sentiment = "negative";
  if (text.includes("thank") || text.includes("great") || text.includes("love")) sentiment = "positive";

  return {
    priority,
    category,
    sentiment,
  };
}

export function generateSupportResponse({
  subject,
  message,
  category,
  priority,
}: {
  subject: string;
  message: string;
  category: string;
  priority: string;
}) {
  return `Hello,

Thank you for contacting OmegaCrown AI Support.

We received your request: "${subject}"

Summary:
${message}

Category: ${category}
Priority: ${priority}

Our team will review the details and help resolve this as quickly as possible. In the meantime, please reply with any screenshots, account details, or steps you already tried.

Royal regards,
OmegaCrown AI Support`;
}

export function generateKnowledgeArticle({
  subject,
  category,
}: {
  subject: string;
  category: string;
}) {
  return {
    title: `How to handle: ${subject}`,
    content: `# ${subject}

## Category
${category}

## Overview
This article explains how Support should respond to this type of issue.

## Recommended Steps
1. Confirm the customer's issue.
2. Ask for missing account or environment details.
3. Check whether this is billing, access, technical, or feature-related.
4. Provide a direct next step.
5. Record the resolution in support memory.

## Response Standard
Use a professional, calm, helpful tone. Keep the customer informed and avoid overpromising.`,
  };
}

export async function createSupportTicket({
  companyId,
  departmentId,
  customerName,
  customerEmail,
  subject,
  message,
  metadata = {},
}: {
  companyId: string;
  departmentId?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  subject: string;
  message: string;
  metadata?: any;
}) {
  const triage = triageSupportMessage(message);

  const ticket = await prisma.supportTicket.create({
    data: {
      companyId,
      departmentId: departmentId || null,
      customerName: customerName || null,
      customerEmail: customerEmail || null,
      subject,
      message,
      category: triage.category,
      priority: triage.priority,
      sentiment: triage.sentiment,
      status: "open",
      metadata,
    },
  });

  const responseContent = generateSupportResponse({
    subject,
    message,
    category: triage.category,
    priority: triage.priority,
  });

  const response = await prisma.supportResponse.create({
    data: {
      companyId,
      departmentId: departmentId || null,
      ticketId: ticket.id,
      subject: `Re: ${subject}`,
      content: responseContent,
      tone: "professional",
      status: "draft",
      metadata: {
        source: "support_engine",
        category: triage.category,
        priority: triage.priority,
      },
    },
  });

  return {
    ticket,
    response,
    triage,
  };
}

export async function createKnowledgeArticle({
  companyId,
  departmentId,
  subject,
  category,
}: {
  companyId: string;
  departmentId?: string | null;
  subject: string;
  category: string;
}) {
  const article = generateKnowledgeArticle({
    subject,
    category,
  });

  const baseSlug = slugify(article.title);
  const slug = `${baseSlug}-${Date.now()}`;

  return prisma.supportKnowledgeBase.create({
    data: {
      companyId,
      departmentId: departmentId || null,
      title: article.title,
      slug,
      content: article.content,
      category,
      status: "draft",
      tags: {
        source: "support_engine",
        generatedAt: new Date().toISOString(),
      },
    },
  });
}

export async function runSupportEngine({
  companyId,
  departmentId,
  objective,
}: {
  companyId: string;
  departmentId?: string | null;
  objective: string;
}) {
  const support = await createSupportTicket({
    companyId,
    departmentId,
    customerName: "Demo Customer",
    customerEmail: "customer@example.com",
    subject: objective.slice(0, 100) || "Support Request",
    message: objective || "Customer needs help with OmegaCrown AI.",
    metadata: {
      source: "support_department_execution",
    },
  });

  const article = await createKnowledgeArticle({
    companyId,
    departmentId,
    subject: support.ticket.subject,
    category: support.ticket.category,
  });

  if (departmentId) {
    await setDepartmentKPI({
      departmentId,
      metric: "support_tickets",
      value: 1,
      period: "week",
      note: `Ticket created: ${support.ticket.subject}`,
    });

    await setDepartmentKPI({
      departmentId,
      metric: "support_responses",
      value: 1,
      period: "week",
      note: `Draft response created for ticket: ${support.ticket.id}`,
    });

    await setDepartmentKPI({
      departmentId,
      metric: "knowledge_articles",
      value: 1,
      period: "week",
      note: `Knowledge article created: ${article.title}`,
    });

    await writeDepartmentMemory({
      departmentId,
      kind: "support_execution",
      content: `Support engine executed: ${objective}. Ticket ${support.ticket.id}, response ${support.response.id}, article ${article.id}.`,
      tags: {
        source: "support_engine",
        ticketId: support.ticket.id,
        responseId: support.response.id,
        articleId: article.id,
      },
    });
  }

  return {
    ok: true,
    intent: "support_department_execution",
    reply: `Support ticket triaged and response drafted for: ${support.ticket.subject}`,
    ticket: support.ticket,
    response: support.response,
    article,
    triage: support.triage,
    summary: {
      ticketId: support.ticket.id,
      responseId: support.response.id,
      articleId: article.id,
      category: support.ticket.category,
      priority: support.ticket.priority,
      sentiment: support.ticket.sentiment,
    },
  };
}

export async function getSupportDashboard(companyId: string) {
  const [tickets, responses, articles] = await Promise.all([
    prisma.supportTicket.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        responses: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    }),
    prisma.supportResponse.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        ticket: true,
      },
    }),
    prisma.supportKnowledgeBase.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  return {
    ok: true,
    companyId,
    tickets,
    responses,
    articles,
    summary: {
      tickets: tickets.length,
      openTickets: tickets.filter((ticket) => ticket.status === "open").length,
      highPriority: tickets.filter((ticket) => ticket.priority === "high").length,
      responses: responses.length,
      articles: articles.length,
    },
  };
}
