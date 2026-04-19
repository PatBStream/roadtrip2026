async function getJson(url) {
  const response = await fetch(url);
  return {
    ok: response.ok,
    data: await response.json().catch(() => ({})),
  };
}

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

async function bootstrapMemoryDetail() {
  const root = document.querySelector('[data-memory-detail]');
  if (!root) return;

  const memoryId = root.getAttribute('data-memory-id');
  if (!memoryId) return;

  const body = root.querySelector('[data-memory-body]');
  const commentsList = document.querySelector('[data-memory-comments]');
  const commentForm = document.querySelector('[data-memory-comment-form]');
  const commentStatus = document.querySelector('[data-memory-comment-status]');
  const ownerActions = document.querySelector('[data-owner-memory-actions]');

  const mediaResult = await getJson(`/api/media-detail?mediaId=${encodeURIComponent(memoryId)}`);
  if (mediaResult.ok && mediaResult.data?.item && body) {
    const item = mediaResult.data.item;
    body.innerHTML = `
      <div class="memory-detail-card panel">
        <p class="eyebrow">${item.type === 'video' ? 'Video' : 'Photo'}${item.tripDay ? ` · Day ${item.tripDay}` : ''}</p>
        <h2>${item.caption || 'Untitled memory'}</h2>
        <p class="small-note">Shared by ${item.uploaderName}</p>
        ${item.previewUrl || item.originalUrl ? `<img class="detail-image" src="${item.previewUrl || item.originalUrl}" alt="${item.caption || 'Trip memory'}" />` : '<div class="memory-placeholder">No preview yet</div>'}
      </div>
    `;

    if (ownerActions) {
      ownerActions.innerHTML = `<div class="inline-actions"><button class="button ghost" type="button" data-memory-action="hide">Hide this memory</button><button class="button ghost" type="button" data-delete-memory>Delete this memory</button></div><p class="small-note">Owner-only moderation actions. Delete is permanent and removes storage objects immediately.</p>`;
      const actionButton = ownerActions.querySelector('[data-memory-action]');
      actionButton?.addEventListener('click', async () => {
        actionButton.setAttribute('disabled', 'disabled');
        const action = actionButton.getAttribute('data-memory-action');
        const result = await postJson('/api/admin-media-status', { mediaId: memoryId, action });
        if (!result.ok) {
          actionButton.textContent = result.data?.error || 'Hide failed';
          actionButton.removeAttribute('disabled');
          return;
        }
        window.location.href = '/memories/admin/';
      });

      const deleteButton = ownerActions.querySelector('[data-delete-memory]');
      deleteButton?.addEventListener('click', async () => {
        if (!window.confirm('Delete this memory permanently from storage and database? This cannot be undone.')) return;
        deleteButton.setAttribute('disabled', 'disabled');
        const result = await postJson('/api/admin-media-delete', { mediaId: memoryId });
        if (!result.ok) {
          deleteButton.textContent = result.data?.error || 'Delete failed';
          deleteButton.removeAttribute('disabled');
          return;
        }
        window.location.href = '/memories/admin/';
      });
    }
  }

  async function loadComments() {
    const commentsResult = await getJson(`/api/media-comments?mediaId=${encodeURIComponent(memoryId)}`);
    if (!commentsList) return;

    const items = commentsResult.data?.items ?? [];
    if (!items.length) {
      commentsList.innerHTML = '<p class="small-note">No comments yet.</p>';
      return;
    }

    commentsList.innerHTML = items.map((item) => `
      <article class="panel" style="padding: 1rem; margin-bottom: 0.75rem;">
        <strong>${item.display_name}</strong>
        <p>${item.body}</p>
        <p class="small-note">${item.created_at}</p>
        ${document.body.hasAttribute('data-owner-view') ? `<div class="inline-actions">${item.status === 'hidden' || item.status === 'deleted' ? `<button class="button ghost" type="button" data-comment-detail-action="unhide" data-comment-detail-id="${item.id}">Unhide comment</button>` : `<button class="button ghost" type="button" data-comment-detail-action="hide" data-comment-detail-id="${item.id}">Hide comment</button>`}<button class="button ghost" type="button" data-comment-detail-delete="${item.id}">Delete comment</button></div>` : ''}
      </article>
    `).join('');

    for (const button of commentsList.querySelectorAll('[data-comment-detail-action]')) {
      button.addEventListener('click', async () => {
        button.setAttribute('disabled', 'disabled');
        const commentId = button.getAttribute('data-comment-detail-id');
        const action = button.getAttribute('data-comment-detail-action');
        const result = await postJson('/api/admin-comment-status', { commentId, action });
        if (!result.ok) {
          button.textContent = result.data?.error || 'Action failed';
          button.removeAttribute('disabled');
          return;
        }
        await loadComments();
      });
    }

    for (const button of commentsList.querySelectorAll('[data-comment-detail-delete]')) {
      button.addEventListener('click', async () => {
        const commentId = button.getAttribute('data-comment-detail-delete');
        if (!commentId) return;
        if (!window.confirm('Delete this comment permanently? This cannot be undone.')) return;
        button.setAttribute('disabled', 'disabled');
        const result = await postJson('/api/admin-comment-delete', { commentId });
        if (!result.ok) {
          button.textContent = result.data?.error || 'Delete failed';
          button.removeAttribute('disabled');
          return;
        }
        await loadComments();
      });
    }
  }

  await loadComments();

  if (commentForm) {
    commentForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(commentForm);
      const text = String(formData.get('body') || '').trim();

      if (!text) {
        if (commentStatus) commentStatus.textContent = 'Comment cannot be empty.';
        return;
      }

      if (commentStatus) commentStatus.textContent = 'Posting comment...';

      const result = await postJson('/api/media-comments', {
        mediaId: memoryId,
        body: text,
      });

      if (!result.ok) {
        if (commentStatus) commentStatus.textContent = result.data?.error ?? 'Could not post comment.';
        return;
      }

      commentForm.reset();
      if (commentStatus) commentStatus.textContent = 'Comment posted.';
      await loadComments();
    });
  }
}

bootstrapMemoryDetail();
