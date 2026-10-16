type Invoke = () => Promise<{ error: unknown }>;

// The edge function answering is the point of no return: signing out afterwards is best effort, because the account is gone either way.
export async function deleteAccountVia(invoke: Invoke, signOutLocally: () => Promise<unknown>): Promise<void> {
  const { error } = await invoke();
  if (error) throw error;
  await signOutLocally().catch(() => {});
}
