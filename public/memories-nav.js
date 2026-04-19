async function postJson(url, payload = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return {
    ok: response.ok,
    data: await response.json().catch(() => ({})),
  };
}

async function bootstrapMemoryLogout() {
  const button = document.querySelector('[data-memory-logout]');
  if (!button) return;

  button.addEventListener('click', async () => {
    button.setAttribute('disabled', 'disabled');
    await postJson('/api/auth-logout');
    window.location.href = '/memories/sign-in/';
  });
}

bootstrapMemoryLogout();
