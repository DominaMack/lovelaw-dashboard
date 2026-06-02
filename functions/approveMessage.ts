import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { message_id, action, scheduled_date } = body;

    // action: "approve" | "reject" | "schedule"
    if (!message_id || !action) {
      return Response.json({ error: 'message_id and action are required' }, { status: 400 });
    }

    const validActions = ['approve', 'reject', 'schedule'];
    if (!validActions.includes(action)) {
      return Response.json({ error: `action must be one of: ${validActions.join(', ')}` }, { status: 400 });
    }

    const statusMap: Record<string, string> = {
      approve: 'approved',
      reject: 'rejected',
      schedule: 'scheduled',
    };

    const updateData: any = { approval_status: statusMap[action] };
    if (action === 'schedule' && scheduled_date) {
      updateData.scheduled_date = scheduled_date;
    }

    const updated = await base44.asServiceRole.entities.Message.update(message_id, updateData);

    return Response.json({ success: true, message: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
