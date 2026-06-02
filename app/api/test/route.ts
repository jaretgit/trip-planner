import Anthropic from "@anthropic-ai/sdk";

export async function GET() {
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 100,
      messages: [{ role: "user", content: 'Reply with exactly: {"ok": true}' }],
    });
    const text = (message.content[0] as any).text;
    return Response.json({ success: true, response: text });
  } catch (e: any) {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}