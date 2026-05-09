import type { SRPMessage } from "./types";
import { recordTimelineEvent } from "./timeline";

type Listener = (message: SRPMessage) => void;

const listeners = new Map<string, Set<Listener>>();

function withTimestamp(message: SRPMessage): SRPMessage {
  return {
    ...message,
    createdAt: "createdAt" in message && message.createdAt ? message.createdAt : new Date().toISOString(),
  } as SRPMessage;
}

export const RuntimeHub = {
  register(sessionId: string, callback: Listener) {
    if (!listeners.has(sessionId)) {
      listeners.set(sessionId, new Set());
    }

    listeners.get(sessionId)?.add(callback);

    callback({
      type: "connected",
      sessionId,
      createdAt: new Date().toISOString(),
    });

    return () => {
      RuntimeHub.unregister(sessionId, callback);
    };
  },

  unregister(sessionId: string, callback?: Listener) {
    if (!callback) {
      listeners.delete(sessionId);
      return;
    }

    const set = listeners.get(sessionId);
    if (!set) return;

    set.delete(callback);

    if (set.size === 0) {
      listeners.delete(sessionId);
    }
  },

  emit(sessionId: string, message: SRPMessage, projectId?: string | null) {
    const set = listeners.get(sessionId);
    const stamped = withTimestamp(message);

    recordTimelineEvent({
      sessionId,
      projectId: projectId || null,
      message: stamped,
    }).catch(() => {});

    if (!set) return false;

    for (const callback of set) {
      callback(stamped);
    }

    return true;
  },

  count(sessionId?: string) {
    if (sessionId) {
      return listeners.get(sessionId)?.size || 0;
    }

    let total = 0;
    for (const set of listeners.values()) {
      total += set.size;
    }
    return total;
  },
};
