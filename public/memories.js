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

async function uploadBinary(url, file) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': file.type,
      'content-length': String(file.size),
    },
    body: file,
  });

  return {
    ok: response.ok,
    data: await response.json().catch(() => ({})),
  };
}

async function bootstrapUploadForm() {
  const form = document.querySelector('[data-memory-upload-form]');
  if (!form) return;

  const status = form.querySelector('[data-upload-status]');
  const fileInput = form.querySelector('input[type="file"]');
  const captionInput = form.querySelector('textarea');
  const tripDayInput = form.querySelector('select');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const file = fileInput?.files?.[0];
    if (!file) {
      if (status) status.textContent = 'Choose a file first.';
      return;
    }

    const type = file.type.startsWith('image/') ? 'image' : 'video';

    if (status) status.textContent = 'Creating upload session...';

    const createResult = await postJson('/api/uploads-create', {
      type,
      fileName: file.name,
      mimeType: file.type,
      bytes: file.size,
    });

    if (!createResult.ok) {
      if (status) status.textContent = createResult.data?.error ?? 'Could not create upload session.';
      return;
    }

    if (status) status.textContent = 'Uploading file to storage...';

    const putResult = await uploadBinary(`/api/uploads-put?uploadSessionId=${encodeURIComponent(createResult.data.uploadSessionId)}`, file);

    if (!putResult.ok) {
      if (status) status.textContent = putResult.data?.error ?? 'Could not upload file to storage.';
      return;
    }

    if (status) status.textContent = 'Finalizing media record...';

    const completeResult = await postJson('/api/uploads-complete', {
      uploadSessionId: createResult.data.uploadSessionId,
      fileName: file.name,
      mimeType: file.type,
      bytes: file.size,
      caption: captionInput?.value ?? '',
      tripDay: tripDayInput?.value ? Number(tripDayInput.value) : null,
      mediaType: type,
    });

    if (!completeResult.ok) {
      if (status) status.textContent = completeResult.data?.error ?? 'Could not complete upload.';
      return;
    }

    if (status) status.innerHTML = `Upload complete. <a href="/memories/detail/?id=${encodeURIComponent(completeResult.data.mediaId)}">Open detail page</a>`;
  });
}

bootstrapUploadForm();
