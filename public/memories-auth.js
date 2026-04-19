async function postJson(url, payload) {
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

async function bootstrapSignInForm() {
  const form = document.querySelector('[data-memory-signin-form]');
  if (!form) return;

  const status = form.querySelector('[data-signin-status]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const email = String(formData.get('email') || '').trim();
    const displayName = String(formData.get('displayName') || '').trim();

    if (!email) {
      if (status) status.textContent = 'Email is required.';
      return;
    }

    if (status) status.textContent = 'Signing in...';

    const result = await postJson('/api/auth-redeem-invite', {
      email,
      displayName: displayName || undefined,
    });

    if (!result.ok) {
      if (status) status.textContent = result.data?.error ?? 'Sign-in failed.';
      return;
    }

    window.location.href = '/memories/';
  });
}

bootstrapSignInForm();
