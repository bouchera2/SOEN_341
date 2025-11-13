export type Msg = { role: "user" | "assistant"; content: string };

export async function sendChat(
  message: string,
  history: Msg[] = [],
  system?: string
): Promise<string> {
  const res = await fetch("http://localhost:3002/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history, system })
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.reply as string;
}
export {};
