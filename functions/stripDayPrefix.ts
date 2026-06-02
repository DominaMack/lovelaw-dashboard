import { createClient } from "npm:@base44/sdk";

const app = createClient({ appId: "6a0a1851e19edca1b6fa628f" });

export default async function handler(req: Request): Promise<Response> {
  const dayPrefixPattern = /^Day \d+\.\s*/;
  
  let skip = 0;
  let totalUpdated = 0;
  let hasMore = true;

  while (hasMore) {
    const result = await app.asServiceRole.entities.Message.list({ limit: 500, skip });
    const records = result as any[];
    
    if (!records || records.length === 0) break;
    hasMore = records.length === 500;
    skip += records.length;

    for (const record of records) {
      const text = record.message_text || "";
      if (dayPrefixPattern.test(text)) {
        const cleaned = text.replace(dayPrefixPattern, "");
        await app.asServiceRole.entities.Message.update(record.id, {
          message_text: cleaned,
        });
        totalUpdated++;
      }
    }
  }

  return Response.json({ success: true, totalUpdated });
}
