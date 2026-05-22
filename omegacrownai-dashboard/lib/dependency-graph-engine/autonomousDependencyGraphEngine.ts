import { emitRuntimeEvent } from "@/lib/runtime-event-bus/unifiedRuntimeEventBus";

export const AUTONOMOUS_DEPENDENCY_GRAPH_ENGINE_VERSION =
  "v28.1 Phase 311 — Autonomous Dependency Graph Engine";

export type DependencyNodeStatus =
  | "pending"
  | "ready"
  | "running"
  | "completed"
  | "blocked"
  | "failed";

export type DependencyGraphNode = {
  id: string;
  title: string;
  capability: string;
  dependsOn: string[];
  status: DependencyNodeStatus;
};

export type DependencyGraph = {
  graphId: string;
  name: string;
  status: "created" | "running" | "completed" | "blocked";
  createdAt: string;
  updatedAt: string;
  nodes: DependencyGraphNode[];
};

const dependencyGraphs: DependencyGraph[] = [];

export function getDependencyGraphEngineStatus() {
  return {
    ok: true,
    version: AUTONOMOUS_DEPENDENCY_GRAPH_ENGINE_VERSION,
    purpose:
      "Provide dependency-aware workflow orchestration, DAG traversal, blocked-state detection, autonomous unblocking, and cross-workflow synchronization.",
    graphs: dependencyGraphs.length,
    capabilities: [
      "Dependency DAG creation",
      "Blocked node detection",
      "Ready node resolution",
      "Graph traversal",
      "Dependency-aware scheduling",
      "Runtime event emission",
      "Recovery-aware orchestration foundation",
    ],
  };
}

export function createDependencyGraph(input?: {
  name?: string;
  nodes?: Partial<DependencyGraphNode>[];
}) {
  const graph: DependencyGraph = {
    graphId: `dependency_graph_${Date.now()}`,
    name: input?.name || "Sovereign Runtime Dependency Graph",
    status: "created",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nodes:
      input?.nodes?.map((node, index) => ({
        id: node.id || `node_${index + 1}`,
        title: node.title || `Dependency node ${index + 1}`,
        capability: node.capability || "supervision",
        dependsOn: node.dependsOn || [],
        status: "pending",
      })) || [
        {
          id: "node_strategy",
          title: "Generate strategic direction",
          capability: "planning",
          dependsOn: [],
          status: "pending",
        },
        {
          id: "node_execution",
          title: "Generate execution plan",
          capability: "supervision",
          dependsOn: ["node_strategy"],
          status: "pending",
        },
        {
          id: "node_verification",
          title: "Verify execution output",
          capability: "recovery",
          dependsOn: ["node_execution"],
          status: "pending",
        },
      ],
  };

  dependencyGraphs.push(graph);

  emitRuntimeEvent({
    type: "DependencyGraphCreated",
    source: "dependency-graph-engine",
    priority: "high",
    payload: {
      graphId: graph.graphId,
      nodes: graph.nodes.length,
    },
  });

  return {
    ok: true,
    version: AUTONOMOUS_DEPENDENCY_GRAPH_ENGINE_VERSION,
    graph,
  };
}

export function resolveDependencyGraph(graphId?: string) {
  const graph =
    dependencyGraphs.find((item) => item.graphId === graphId) ||
    dependencyGraphs[dependencyGraphs.length - 1];

  if (!graph) {
    return {
      ok: false,
      reason: "DEPENDENCY_GRAPH_NOT_FOUND",
    };
  }

  const completed = new Set(
    graph.nodes
      .filter((node) => node.status === "completed")
      .map((node) => node.id),
  );

  for (const node of graph.nodes) {
    const dependenciesMet = node.dependsOn.every((dependencyId) =>
      completed.has(dependencyId),
    );

    if (node.status === "pending" && dependenciesMet) {
      node.status = "ready";
    }

    if (node.status === "pending" && !dependenciesMet) {
      node.status = "blocked";
    }

    if (node.status === "blocked" && dependenciesMet) {
      node.status = "ready";
    }
  }

  graph.status = graph.nodes.every((node) => node.status === "completed")
    ? "completed"
    : graph.nodes.some((node) => node.status === "blocked")
      ? "blocked"
      : "running";

  graph.updatedAt = new Date().toISOString();

  emitRuntimeEvent({
    type: "DependencyGraphResolved",
    source: "dependency-graph-engine",
    priority: "high",
    payload: {
      graphId: graph.graphId,
      status: graph.status,
      readyNodes: graph.nodes.filter((node) => node.status === "ready").length,
      blockedNodes: graph.nodes.filter((node) => node.status === "blocked")
        .length,
    },
  });

  return {
    ok: true,
    version: AUTONOMOUS_DEPENDENCY_GRAPH_ENGINE_VERSION,
    graph,
  };
}

export function traverseDependencyGraph(graphId?: string) {
  const graph =
    dependencyGraphs.find((item) => item.graphId === graphId) ||
    dependencyGraphs[dependencyGraphs.length - 1];

  if (!graph) {
    return {
      ok: false,
      reason: "DEPENDENCY_GRAPH_NOT_FOUND",
    };
  }

  const readyNode = graph.nodes.find((node) => node.status === "ready");

  if (!readyNode) {
    return {
      ok: true,
      version: AUTONOMOUS_DEPENDENCY_GRAPH_ENGINE_VERSION,
      graph,
      message: "No ready dependency node available. Resolve graph first or complete dependencies.",
    };
  }

  readyNode.status = "running";

  emitRuntimeEvent({
    type: "DependencyNodeStarted",
    source: "dependency-graph-engine",
    priority: "high",
    payload: {
      graphId: graph.graphId,
      nodeId: readyNode.id,
      capability: readyNode.capability,
    },
  });

  readyNode.status = "completed";
  graph.updatedAt = new Date().toISOString();

  emitRuntimeEvent({
    type: "DependencyNodeCompleted",
    source: "dependency-graph-engine",
    priority: "high",
    payload: {
      graphId: graph.graphId,
      nodeId: readyNode.id,
      capability: readyNode.capability,
    },
  });

  return resolveDependencyGraph(graph.graphId);
}
