import { useEffect, useState } from "react";

// a tiny pub/sub so any component can print to the statusline, like :echo in nvim
const listeners = new Set();
const MAX_QUEUED = 3;

export const echo = (text, tone = "info") => {
  const message = { text, tone, id: `${Date.now()}-${Math.random()}` };
  listeners.forEach((listener) => listener(message));
};

// messages queue up so two that fire at the same moment both get seen
export const useEchoMessage = (clearAfterMs = 4500) => {
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    const enqueue = (message) => setQueue((current) => [...current, message].slice(-MAX_QUEUED));
    listeners.add(enqueue);
    return () => listeners.delete(enqueue);
  }, []);

  const message = queue[0] ?? null;
  const hasMoreWaiting = queue.length > 1;

  useEffect(() => {
    if (!message) return;
    const showFor = hasMoreWaiting ? clearAfterMs / 2 : clearAfterMs;
    const timer = setTimeout(() => setQueue((current) => current.slice(1)), showFor);
    return () => clearTimeout(timer);
  }, [message, hasMoreWaiting, clearAfterMs]);

  return message;
};
