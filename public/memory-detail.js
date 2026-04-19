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
  const commentsList = root.querySelector('[data-memory-comments]');
  const commentForm = root.querySelector('[data-memory-comment-form]');
  const commentStatus = root.querySelector('[data-memory-comment-status]');

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
      </article>
    `).join('');
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
