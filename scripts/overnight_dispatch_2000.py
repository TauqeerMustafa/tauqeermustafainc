import os
import sys
import json
import time
import html
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

PROSPECTS_FILE = r"scratch/overnight_2000_prospects.json"
STATE_FILE = r"scratch/overnight_dispatch_state.json"
LOG_FILE = r"scratch/overnight_dispatch.log"

BREVO_HOST = "smtp-relay.brevo.com"
BREVO_PORT = 587
BREVO_USER = os.environ.get("BREVO_SMTP_USER", "bffbc8001@smtp-brevo.com")
BREVO_PASS = os.environ.get("BREVO_SMTP_PASS")

if not BREVO_PASS:
    try:
        with open("scripts/dispatch_via_brevo.py", "r", encoding="utf-8") as f:
            for line in f:
                if "BREVO_PASS =" in line:
                    BREVO_PASS = line.split("=", 1)[1].strip().strip('"').strip("'")
                    break
    except:
        pass

SENDERS = [
    {"name": "Tauqeer Mustafa", "email": "contact@tauqeermustafa.com"},
    {"name": "Tauqeer Mustafa", "email": "sales@qorlune.co.uk"},
]

def log(msg):
    ts = time.strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line, flush=True)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")

def text_to_html(text):
    paragraphs = text.strip().split("\n\n")
    html_paras = []
    for p in paragraphs:
        lines = [html.escape(line.strip()) for line in p.split("\n")]
        html_paras.append("<p style=\"margin: 0 0 12px 0;\">" + "<br>".join(lines) + "</p>")
    return (
        "<div style=\"font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; "
        "font-size: 14px; line-height: 1.6; color: #1e293b; max-width: 600px;\">\n"
        + "\n".join(html_paras)
        + "\n</div>"
    )

def load_state():
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except:
            pass
    return {"last_index": 0, "sent": 0, "failed": 0, "completed": False}

def save_state(state):
    try:
        with open(STATE_FILE, "w", encoding="utf-8") as f:
            json.dump(state, f, indent=2)
    except Exception as e:
        log(f"Error saving state: {e}")

def create_smtp_client():
    server = smtplib.SMTP(BREVO_HOST, BREVO_PORT, timeout=20)
    server.starttls()
    server.login(BREVO_USER, BREVO_PASS)
    return server

def main():
    log("=" * 70)
    log("LAUNCHING OVERNIGHT 2,000 B2B PROSPECT DISPATCH ENGINE")
    log("=" * 70)

    if not os.path.exists(PROSPECTS_FILE):
        log(f"FATAL: {PROSPECTS_FILE} not found!")
        return

    with open(PROSPECTS_FILE, "r", encoding="utf-8") as f:
        prospects = json.load(f)

    total_prospects = len(prospects)
    log(f"Loaded {total_prospects} total prospects ready for overnight dispatch.")

    state = load_state()
    start_idx = state.get("last_index", 0)
    log(f"Resuming dispatch from index {start_idx} (already sent: {state.get('sent', 0)}, failed: {state.get('failed', 0)})")

    smtp_client = None
    reconnect_after = 40
    batch_counter = 0

    try:
        for idx in range(start_idx, total_prospects):
            p = prospects[idx]
            to_email = p["to_email"]
            to_name = p.get("clean_name", "Team")
            subject = p["subject"]
            body_text = p["body"]

            # Rotate sender evenly
            sender = SENDERS[idx % len(SENDERS)]

            msg = MIMEMultipart("alternative")
            msg["From"] = f"{sender['name']} <{sender['email']}>"
            msg["To"] = f"{to_name} <{to_email}>" if to_name else to_email
            msg["Reply-To"] = f"{sender['name']} <{sender['email']}>"
            msg["Subject"] = subject

            html_body = text_to_html(body_text)
            msg.attach(MIMEText(body_text, "plain", "utf-8"))
            msg.attach(MIMEText(html_body, "html", "utf-8"))

            sent_ok = False
            for attempt in range(3):
                try:
                    if smtp_client is None or batch_counter >= reconnect_after:
                        if smtp_client:
                            try:
                                smtp_client.quit()
                            except:
                                pass
                        smtp_client = create_smtp_client()
                        batch_counter = 0

                    smtp_client.sendmail(sender["email"], [to_email], msg.as_string())
                    batch_counter += 1
                    sent_ok = True
                    break
                except (smtplib.SMTPException, OSError) as err:
                    log(f"SMTP attempt {attempt+1} error for {to_email}: {err}")
                    if smtp_client:
                        try:
                            smtp_client.quit()
                        except:
                            pass
                    smtp_client = None
                    time.sleep(5)

            if sent_ok:
                state["sent"] += 1
                log(f"[{idx+1}/{total_prospects}] DELIVERED to {to_email} ({to_name}) via {sender['email']}")
            else:
                state["failed"] += 1
                log(f"[{idx+1}/{total_prospects}] FAILED to {to_email} ({to_name})")

            state["last_index"] = idx + 1
            save_state(state)

            # Pacing: 8 to 12 seconds between emails
            time.sleep(9)

        state["completed"] = True
        save_state(state)
        log("=" * 70)
        log(f"OVERNIGHT DISPATCH COMPLETE: {state['sent']} delivered, {state['failed']} failed.")
        log("=" * 70)

    except KeyboardInterrupt:
        log("Dispatch interrupted by user. State safely persisted.")
    except Exception as e:
        log(f"Fatal error in dispatch loop: {e}")
    finally:
        if smtp_client:
            try:
                smtp_client.quit()
            except:
                pass

if __name__ == "__main__":
    main()
