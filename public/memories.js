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

const MAX_IMAGE_COUNT = 10;

function classifyFile(file) {
  return file.type.startsWith('image/') ? 'image' : 'video';
}

async function uploadOneFile(file, shared) {
  const type = classifyFile(file);

  shared.setStatus(`Creating upload session for ${file.name}...`);
  const createResult = await postJson('/api/uploads-create', {
    type,
    fileName: file.name,
    mimeType: file.type,
    bytes: file.size,
  });

  if (!createResult.ok) {
    throw new Error(createResult.data?.error ?? `Could not create upload session for ${file.name}.`);
  }

  shared.setStatus(`Uploading ${file.name} to storage...`);
  const putResult = await uploadBinary(`/api/uploads-put?uploadSessionId=${encodeURIComponent(createResult.data.uploadSessionId)}`, file);

  if (!putResult.ok) {
    throw new Error(putResult.data?.error ?? `Could not upload ${file.name} to storage.`);
  }

  shared.setStatus(`Finalizing ${file.name}...`);
  const completeResult = await postJson('/api/uploads-complete', {
    uploadSessionId: createResult.data.uploadSessionId,
    fileName: file.name,
    mimeType: file.type,
    bytes: file.size,
    caption: shared.caption,
    tripDay: shared.tripDay,
    mediaType: type,
  });

  if (!completeResult.ok) {
    throw new Error(completeResult.data?.error ?? `Could not complete upload for ${file.name}.`);
  }

  return {
    mediaId: completeResult.data.mediaId,
    fileName: file.name,
  };
}

async function bootstrapUploadForm() {
  const form = document.querySelector('[data-memory-upload-form]');
  if (!form) return;

  const status = form.querySelector('[data-upload-status]');
  const fileInput = form.querySelector('input[type="file"]');
  const captionInput = form.querySelector('textarea');
  const tripDayInput = form.querySelector('select');
  const submitButton = form.querySelector('button[type="submit"]');

  const setStatus = (message) => {
    if (status) status.textContent = message;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitButton) submitButton.disabled = true;

    const files = Array.from(fileInput?.files ?? []);
    if (!files.length) {
      setStatus('Choose at least one file first.');
      if (submitButton) submitButton.disabled = false;
      return;
    }

    const imageFiles = files.filter((file) => classifyFile(file) === 'image');
    const videoFiles = files.filter((file) => classifyFile(file) === 'video');

    if (videoFiles.length > 1) {
      setStatus('Choose only one video at a time.');
      if (submitButton) submitButton.disabled = false;
      return;
    }

    if (videoFiles.length === 1 && imageFiles.length > 0) {
      setStatus('Upload images and videos separately. You can upload up to 10 images at once, or one video.');
      if (submitButton) submitButton.disabled = false;
      return;
    }

    if (imageFiles.length > MAX_IMAGE_COUNT) {
      setStatus(`Choose up to ${MAX_IMAGE_COUNT} images at once.`);
      if (submitButton) submitButton.disabled = false;
      return;
    }

    const shared = {
      caption: captionInput?.value ?? '',
      tripDay: tripDayInput?.value ? Number(tripDayInput.value) : null,
      setStatus,
    };

    try {
      const results = [];
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        setStatus(`Uploading ${index + 1} of ${files.length}: ${file.name}`);
        results.push(await uploadOneFile(file, shared));
      }

      if (results.length === 1) {
        status.innerHTML = `Upload complete. <a href="/memories/detail/?id=${encodeURIComponent(results[0].mediaId)}">Open detail page</a>`;
      } else {
        status.innerHTML = `Uploaded ${results.length} images successfully. <a href="/memories/">Open memories</a>`;
      }

      form.reset();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Upload failed.');
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}

bootstrapUploadForm();
