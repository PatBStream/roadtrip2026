async function getJson(url) {
  const response = await fetch(url);
  return { ok: response.ok, data: await response.json().catch(() => ({ })) };
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return { ok: response.ok, data: await response.json().catch(() => ({ })) };
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function loadUsers() {
  const root = document.querySelector('[data-admin-users]');
  if (!root) return;

  const result = await getJson('/api/admin-invites');
  if (!result.ok) {
    root.innerHTML = '<p class="small-note">Could not load users.</p>';
    return;
  }

  const users = result.data?.users ?? [];
  if (!users.length) {
    root.innerHTML = '<p class="small-note">No users yet.</p>';
    return;
  }

  root.innerHTML = users.map((user) => `
    <article class="panel admin-row">
      <div>
        <strong>${escapeHtml(user.display_name)}</strong>
        <p class="small-note">${escapeHtml(user.email)} · ${escapeHtml(user.role)} · ${escapeHtml(user.status)}</p>
      </div>
      <div class="inline-actions">
        ${user.status === 'disabled'
          ? `<button class="button ghost" data-user-status="active" data-user-id="${escapeHtml(user.id)}">Re-enable</button>`
          : `<button class="button ghost" data-user-status="disabled" data-user-id="${escapeHtml(user.id)}">Disable</button>`}
      </div>
    </article>
  `).join('');

  for (const button of root.querySelectorAll('[data-user-status]')) {
    button.addEventListener('click', async () => {
      button.setAttribute('disabled', 'disabled');
      const userId = button.getAttribute('data-user-id');
      const status = button.getAttribute('data-user-status');
      const result = await postJson('/api/admin-user-status', { userId, status });
      if (!result.ok) {
        button.textContent = 'Failed';
        button.removeAttribute('disabled');
        return;
      }
      await loadUsers();
    });
  }
}

async function loadMedia() {
  const root = document.querySelector('[data-admin-media]');
  if (!root) return;

  const result = await getJson('/api/admin-media');
  if (!result.ok) {
    root.innerHTML = '<p class="small-note">Could not load media.</p>';
    return;
  }

  const items = result.data?.items ?? [];
  if (!items.length) {
    root.innerHTML = '<p class="small-note">No media yet.</p>';
    return;
  }

  root.innerHTML = items.map((item) => `
    <article class="panel admin-row">
      <div>
        <strong>${escapeHtml(item.uploaderName)}</strong>
        <p>${escapeHtml(item.caption || 'No caption')}</p>
        <p class="small-note">${escapeHtml(item.type)} · ${escapeHtml(item.status)} · ${escapeHtml(item.id)}</p>
      </div>
      <div class="inline-actions">
        ${item.status === 'hidden'
          ? `<button class="button ghost" data-media-action="unhide" data-media-id="${escapeHtml(item.id)}">Unhide</button>`
          : `<button class="button ghost" data-media-action="hide" data-media-id="${escapeHtml(item.id)}">Hide</button>`}
        <button class="button ghost" data-delete-media="${escapeHtml(item.id)}">Delete</button>
      </div>
    </article>
  `).join('');

  for (const button of root.querySelectorAll('[data-media-action]')) {
    button.addEventListener('click', async () => {
      button.setAttribute('disabled', 'disabled');
      const mediaId = button.getAttribute('data-media-id');
      const action = button.getAttribute('data-media-action');
      const result = await postJson('/api/admin-media-status', { mediaId, action });
      if (!result.ok) {
        button.textContent = 'Failed';
        button.removeAttribute('disabled');
        return;
      }
      await loadMedia();
    });
  }

  for (const button of root.querySelectorAll('[data-delete-media]')) {
    button.addEventListener('click', async () => {
      const mediaId = button.getAttribute('data-delete-media');
      if (!mediaId) return;
      if (!window.confirm('Delete this media permanently from storage and database? This cannot be undone.')) return;
      button.setAttribute('disabled', 'disabled');
      const result = await postJson('/api/admin-media-delete', { mediaId });
      if (!result.ok) {
        button.textContent = 'Delete failed';
        button.removeAttribute('disabled');
        return;
      }
      await loadMedia();
    });
  }
}

async function loadComments() {
  const root = document.querySelector('[data-admin-comments]');
  if (!root) return;

  const result = await getJson('/api/admin-comments');
  if (!result.ok) {
    root.innerHTML = '<p class="small-note">Could not load comments.</p>';
    return;
  }

  const items = result.data?.items ?? [];
  if (!items.length) {
    root.innerHTML = '<p class="small-note">No comments yet.</p>';
    return;
  }

  root.innerHTML = items.map((item) => `
    <article class="panel admin-row">
      <div>
        <strong>${escapeHtml(item.display_name)}</strong>
        <p>${escapeHtml(item.body)}</p>
        <p class="small-note">${escapeHtml(item.status)} · media ${escapeHtml(item.media_item_id)}</p>
      </div>
      <div class="inline-actions">
        ${(item.status === 'hidden' || item.status === 'deleted')
          ? `<button class="button ghost" data-comment-action="unhide" data-comment-id="${escapeHtml(item.id)}">Unhide</button>`
          : `<button class="button ghost" data-comment-action="hide" data-comment-id="${escapeHtml(item.id)}">Hide</button>`}
        <button class="button ghost" data-delete-comment="${escapeHtml(item.id)}">Delete</button>
      </div>
    </article>
  `).join('');

  for (const button of root.querySelectorAll('[data-comment-action]')) {
    button.addEventListener('click', async () => {
      button.setAttribute('disabled', 'disabled');
      const commentId = button.getAttribute('data-comment-id');
      const action = button.getAttribute('data-comment-action');
      const result = await postJson('/api/admin-comment-status', { commentId, action });
      if (!result.ok) {
        button.textContent = 'Failed';
        button.removeAttribute('disabled');
        return;
      }
      await loadComments();
    });
  }

  for (const button of root.querySelectorAll('[data-delete-comment]')) {
    button.addEventListener('click', async () => {
      const commentId = button.getAttribute('data-delete-comment');
      if (!commentId) return;
      if (!window.confirm('Delete this comment permanently? This cannot be undone.')) return;
      button.setAttribute('disabled', 'disabled');
      const result = await postJson('/api/admin-comment-delete', { commentId });
      if (!result.ok) {
        button.textContent = 'Delete failed';
        button.removeAttribute('disabled');
        return;
      }
      await loadComments();
    });
  }
}

async function bootstrapInviteForm() {
  const form = document.querySelector('[data-admin-invite-form]');
  if (!form) return;

  const status = form.querySelector('[data-admin-invite-status]');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const email = String(formData.get('email') || '').trim();
    const displayName = String(formData.get('displayName') || '').trim();
    const role = String(formData.get('role') || 'member');

    if (!email || !displayName) {
      if (status) status.textContent = 'Email and display name are required.';
      return;
    }

    if (status) status.textContent = 'Creating invite...';
    const result = await postJson('/api/admin-invites', { email, displayName, role });
    if (!result.ok) {
      if (status) status.textContent = result.data?.error || 'Could not create invite.';
      return;
    }

    form.reset();
    if (status) status.textContent = result.data?.existing ? 'User already existed.' : 'Invite created.';
    await loadUsers();
  });
}

bootstrapInviteForm();
loadUsers();
loadMedia();
loadComments();
