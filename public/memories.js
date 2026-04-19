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

function renderProgress(progressRoot, items) {
  if (!progressRoot) return;
  if (!items.length) {
    progressRoot.innerHTML = '';
    return;
  }

  progressRoot.innerHTML = items.map((item) => `
    <div class="upload-progress-item ${item.state}">
      <strong>${item.name}</strong>
      <span>${item.message}</span>
    </div>
  `).join('');
}

function updateProgress(items, index, patch, progressRoot) {
  items[index] = { ...items[index], ...patch };
  renderProgress(progressRoot, items);
}

async function uploadOneFile(file, shared, progressItems, index) {
  const type = classifyFile(file);

  updateProgress(progressItems, index, { state: 'working', message: 'Creating upload session...' }, shared.progressRoot);
  const createResult = await postJson('/api/uploads-create', {
    type,
    fileName: file.name,
    mimeType: file.type,
    bytes: file.size,
  });

  if (!createResult.ok) {
    throw new Error(createResult.data?.error ?? `Could not create upload session for ${file.name}.`);
  }

  updateProgress(progressItems, index, { state: 'working', message: 'Uploading to storage...' }, shared.progressRoot);
  const putResult = await uploadBinary(`/api/uploads-put?uploadSessionId=${encodeURIComponent(createResult.data.uploadSessionId)}`, file);

  if (!putResult.ok) {
    throw new Error(putResult.data?.error ?? `Could not upload ${file.name} to storage.`);
  }

  updateProgress(progressItems, index, { state: 'working', message: 'Finalizing...' }, shared.progressRoot);
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

  updateProgress(progressItems, index, { state: 'done', message: 'Uploaded successfully.' }, shared.progressRoot);

  return {
    mediaId: completeResult.data.mediaId,
    fileName: file.name,
  };
}

async function bootstrapUploadForm() {
  const form = document.querySelector('[data-memory-upload-form]');
  if (!form) return;

  const status = form.querySelector('[data-upload-status]');
  const imageInput = form.querySelector('[data-image-input]');
  const videoInput = form.querySelector('[data-video-input]');
  const captionInput = form.querySelector('textarea');
  const tripDayInput = form.querySelector('select');
  const submitButton = form.querySelector('button[type="submit"]');
  const progressRoot = form.querySelector('[data-upload-progress-list]');

  const setStatus = (message) => {
    if (status) status.textContent = message;
  };

  function getSelectedFiles() {
    const imageFiles = Array.from(imageInput?.files ?? []);
    const videoFiles = Array.from(videoInput?.files ?? []);
    return { imageFiles, videoFiles, files: [...imageFiles, ...videoFiles] };
  }

  imageInput?.addEventListener('change', () => {
    if ((imageInput.files?.length ?? 0) > 0 && videoInput) {
      videoInput.value = '';
    }
    const count = imageInput.files?.length ?? 0;
    setStatus(count > 0 ? `${count} image${count === 1 ? '' : 's'} selected.` : '');
  });

  videoInput?.addEventListener('change', () => {
    if ((videoInput.files?.length ?? 0) > 0 && imageInput) {
      imageInput.value = '';
    }
    const count = videoInput.files?.length ?? 0;
    setStatus(count > 0 ? `${count} video selected.` : '');
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitButton) submitButton.disabled = true;

    const { imageFiles, videoFiles, files } = getSelectedFiles();
    if (!files.length) {
      setStatus('Choose at least one file first.');
      if (submitButton) submitButton.disabled = false;
      return;
    }

    if (videoFiles.length > 1) {
      setStatus('Choose only one video at a time.');
      if (submitButton) submitButton.disabled = false;
      return;
    }

    if (videoFiles.length === 1 && imageFiles.length > 0) {
      setStatus('Upload images and videos separately.');
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
      progressRoot,
    };

    const progressItems = files.map((file) => ({
      name: file.name,
      state: 'pending',
      message: 'Waiting to upload...',
    }));
    renderProgress(progressRoot, progressItems);

    try {
      const results = [];
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        setStatus(`Uploading ${index + 1} of ${files.length}: ${file.name}`);
        results.push(await uploadOneFile(file, shared, progressItems, index));
      }

      if (results.length === 1) {
        status.innerHTML = `Upload complete. <a href="/memories/detail/?id=${encodeURIComponent(results[0].mediaId)}">Open detail page</a>`;
      } else {
        status.innerHTML = `Uploaded ${results.length} images successfully. <a href="/memories/">Open memories</a>`;
      }

      form.reset();
      renderProgress(progressRoot, []);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Upload failed.');
      const failedIndex = progressItems.findIndex((item) => item.state === 'working');
      if (failedIndex >= 0) {
        updateProgress(progressItems, failedIndex, { state: 'failed', message: error instanceof Error ? error.message : 'Upload failed.' }, progressRoot);
      }
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}

bootstrapUploadForm();
