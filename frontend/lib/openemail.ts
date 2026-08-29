export const OPENEMAIL_API_URL = 'https://api.open.email/api/v1';

export async function fetchOpenEmailMailboxes() {
  const token = process.env.OPENEMAIL_API_KEY;
  if (!token) throw new Error('OPENEMAIL_API_KEY is missing');

  const res = await fetch(`${OPENEMAIL_API_URL}/mailboxes`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    next: { revalidate: 0 }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch mailboxes: ${res.statusText}`);
  }

  const data = await res.json();
  return data;
}

export async function fetchOpenEmailMessages(mailboxId: string) {
  const token = process.env.OPENEMAIL_API_KEY;
  if (!token) throw new Error('OPENEMAIL_API_KEY is missing');

  const res = await fetch(`${OPENEMAIL_API_URL}/mailboxes/${mailboxId}/messages`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    next: { revalidate: 0 }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch messages: ${res.statusText}`);
  }

  const data = await res.json();
  return data;
}
