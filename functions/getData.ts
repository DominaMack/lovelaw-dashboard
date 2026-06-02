import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { entity, filters = {}, limit = 50, skip = 0 } = body;

    const allowed = ["Message", "Subscriber", "Institution", "DistrессFlag", "AccessCode", "CardTemplate"];
    if (!allowed.includes(entity)) {
      return new Response(JSON.stringify({ error: "Entity not allowed" }), { status: 400, headers });
    }

    const records = await base44.asServiceRole.entities[entity].filter(filters, { limit, skip });
    const arr = records || [];
    return new Response(JSON.stringify({ records: arr, count: arr.length }), { headers });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message, records: [], count: 0 }), { status: 500, headers });
  }
});
