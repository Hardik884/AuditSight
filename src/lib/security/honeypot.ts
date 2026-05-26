type HoneypotLogContext = {
  route: string;
  timestamp: string;
};

export const isHoneypotTripped = (value: unknown): boolean => {
  if (typeof value !== "string") return false;
  return value.trim().length > 0;
};

export const logHoneypotTrip = (route: string) => {
  const context: HoneypotLogContext = {
    route,
    timestamp: new Date().toISOString(),
  };

  console.warn("[AuditSight/security] Honeypot triggered", context);
};
