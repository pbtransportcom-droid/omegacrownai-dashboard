type UserPlan = {
  userId: string;
  plan: "free" | "pro" | "elite" | "enterprise";
  updatedAt: string;
};

const store = new Map<string, UserPlan>();

export function getUserPlan(userId: string) {
  return (
    store.get(userId) || {
      userId,
      plan: "free",
      updatedAt: new Date().toISOString(),
    }
  );
}

export function setUserPlan(
  userId: string,
  plan: UserPlan["plan"]
) {
  const record = {
    userId,
    plan,
    updatedAt: new Date().toISOString(),
  };

  store.set(userId, record);

  return record;
}
