import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  try {
    const { destination, startDate, endDate, interests } = await req.json();

    const prompt = `You are a travel researcher. Find real events and attractions for someone visiting ${destination} from ${startDate} to ${endDate}.${interests ? ` They are especially interested in: ${interests}.` : ""}

Return ONLY a JSON object — no explanation, no markdown, no code fences. Start with { and end with }.

{
  "vibeCheck": "2-3 sentence summary of what this trip window feels like",
  "events": [
    {
      "name": "Event name",
      "date": "Human-readable date or range",
      "category": "music|food|arts|sports|festivals|outdoors|indigenous",
      "location": "Venue, city",
      "description": "2-3 sentences on what it is and why it is worth attending",
      "anchor": true
    }
  ],
  "attractions": [
    {
      "name": "Attraction name",
      "category": "nature|history|food|arts|adventure|indigenous",
      "location": "Place, region",
      "hours": "Opening days and times",
      "description": "2-3 sentences on what makes it worth visiting",
      "tip": "One insider tip"
    }
  ]
}

Include 6-10 events and 4-6 attractions. Only include real, known events and places. Set anchor true for major events worth planning a trip around. Return JSON only.`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = (message.content[0] as any).text;
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) {
      return Response.json({ success: false, error: "No JSON in response", raw: text }, { status: 500 });
    }

    const parsed = JSON.parse(text.slice(start, end + 1));
    return Response.json({ success: true, data: parsed });

  } catch (e: any) {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}