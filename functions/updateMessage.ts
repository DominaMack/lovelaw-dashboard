import base44 from "@base44/sdk";

const app = base44.init({ appId: "6a0a1851e19edca1b6fa628f" });

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return Response.json({ error: "POST only" }, { status: 405 });

  const { id, approval_status, message_text } = await req.json();
  if (!id) return Response.json({ error: "id required" }, { status: 400 });

  const update: any = {};
  if (approval_status) update.approval_status = approval_status;
  if (message_text !== undefined) update.message_text = message_text;

  try {
    const result = await app.asServiceRole.entities.Message.update(id, update);
    return Response.json({ success: true, record: result });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
