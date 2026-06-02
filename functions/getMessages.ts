import base44 from "@base44/sdk";

const app = base44.init({ appId: "6a0a1851e19edca1b6fa628f" });

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const segment = url.searchParams.get("segment") || "all";
  const track = url.searchParams.get("track") || "all";
  const status = url.searchParams.get("status") || "pending";
  const skip = parseInt(url.searchParams.get("skip") || "0");

  let filter: any = {};
  if (segment !== "all") filter.audience_segment = segment;
  if (track !== "all") filter.focus_track = track;
  if (status !== "all") filter.approval_status = status;

  try {
    const messages = await app.asServiceRole.entities.Message.filter(filter, {
      limit: 50,
      skip,
      sort: "audience_segment,day_number"
    });
    return Response.json({ records: messages, skip });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
