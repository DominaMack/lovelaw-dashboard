import base44 from "https://cdn.base44.com/sdk/v1/base44.ts";

export default async function handler(req: Request): Promise<Response> {
  const body = await req.json().catch(() => ({}));
  const { entity, filters = {}, limit = 50, skip = 0 } = body;

  const allowed = ["Message", "Subscriber", "Institution", "DistrессFlag", "AccessCode"];
  if (!allowed.includes(entity)) {
    return Response.json({ error: "Entity not allowed" }, { status: 400 });
  }

  try {
    const records = await base44.asServiceRole.entities[entity].list({
      ...filters,
      limit,
      skip,
    });
    return Response.json({ records: records || [], count: records?.length || 0 });
  } catch (e: any) {
    return Response.json({ error: e.message, records: [], count: 0 }, { status: 500 });
  }
}
