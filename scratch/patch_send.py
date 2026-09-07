import sys

with open("frontend/app/api/whatsapp/send/route.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Fix the broken header and url
content = content.replace('Authorization: "Bearer ",', 'Authorization: `Bearer ${token}`,')
content = content.replace('fetch(${GRAPH_URL}//messages', 'fetch(`${GRAPH_URL}/${phoneNumberId}/messages`')

# Replace the inner POST parsing of token
old_post_start = """export async function POST(request: Request) {
  const token = process.env.WHATSAPP_TOKEN;

  if (!token) {
    return NextResponse.json(
      { success: false, error: "WHATSAPP_TOKEN not configured" },
      { status: 500 }
    );
  }"""
new_post_start = """export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      to,
      message,
      type = "text",
      template,
      replyTo,
      from,
      headerText,
      bodyText,
      footerText,
      button1,
      button2,
      button3,
      listButton,
      listTitle,
      listRows,
      flowStep: stepId,
      metaTemplateName,
      templateVars,
      mediaId,
      mediaType,
      caption,
      filename,
      voice,
      emoji,
      reactionTo,
      markReadMessageId,
    } = body;

    const fromRes = resolveNumberId(from);
    if (!fromRes.ok) {
      return NextResponse.json({ success: false, error: fromRes.error }, { status: 400 });
    }
    const phoneNumberId = fromRes.id;

    const numberDef = waNumbers().find((n) => n.id === phoneNumberId);
    const account = accountAt(numberDef?.slot ?? 1);
    const token = account.token;

    if (!token) {
      return NextResponse.json(
        { success: false, error: `WHATSAPP_TOKEN not configured for this sender's app (Slot ${account.slot})` },
        { status: 500 }
      );
    }"""
content = content.replace(old_post_start, new_post_start)

# Replace the old extraction of variables at the start of try { ...
old_try_start = """  try {
    const body = await request.json();
    const {
      to,
      message,
      type = "text",
      template,
      replyTo,
      from,
      headerText,
      bodyText,
      footerText,
      button1,
      button2,
      button3,
      listButton,
      listTitle,
      listRows,
      flowStep: stepId,
      metaTemplateName,
      templateVars,
      mediaId,
      mediaType,
      caption,
      filename,
      voice,
      emoji,
      reactionTo,
      markReadMessageId,
    } = body;

    const fromRes = resolveNumberId(from);
    if (!fromRes.ok) {
      return NextResponse.json({ success: false, error: fromRes.error }, { status: 400 });
    }
    const phoneNumberId = fromRes.id;"""

# Wait, the new_post_start ALREADY includes the try block. Let's make sure we remove the original one.
content = content.replace(old_try_start, "")

# Find and replace graphPost(phoneNumberId, payload)
content = content.replace("await graphPost(phoneNumberId, payload)", "await graphPost(phoneNumberId, token, payload)")
content = content.replace("await graphPost(phoneNumberId, {", "await graphPost(phoneNumberId, token, {")

with open("frontend/app/api/whatsapp/send/route.ts", "w", encoding="utf-8") as f:
    f.write(content)

print("done")
