export const Billing = {
  async charge({
    userId,
    itemId,
    amount,
  }: {
    userId: string;
    itemId: string;
    amount: number;
  }) {
    return {
      ok: true,
      userId,
      itemId,
      amount,
      mode: "stub",
      message: "Billing stub approved. No real charge was made.",
    };
  },
};
