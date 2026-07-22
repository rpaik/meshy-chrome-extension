const STATES = {
  INITIAL: 'initialState',
  LOADING: 'loadingState',
  RESULT: 'resultState',
  ERROR: 'errorState'
};

let currentTaskId = null;
let currentModelUrl = null;

function setState(stateId) {
  document.querySelectorAll('.state-container').forEach(el => el.classList.remove('active'));
  document.getElementById(stateId).classList.add('active');
}

function showError(message) {
  document.getElementById('errorMessage').textContent = message;
  setState(STATES.ERROR);
}

// Convert image URL to base64 Data URI
async function urlToBase64(url) {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function startGeneration(imageUrl) {
  try {
    const { MESHY_API_KEY } = await chrome.storage.local.get('MESHY_API_KEY');
    
    if (!MESHY_API_KEY) {
      showError('Please set your Meshy API Key in the Extension Options first.');
      return;
    }

    setState(STATES.LOADING);
    document.getElementById('sourceImage').src = imageUrl;
    document.getElementById('loadingStatus').textContent = 'Processing image...';
    document.getElementById('progressBar').style.width = '10%';

    // 1. Convert to Base64 (bypassing CORS since extension has <all_urls>)
    const base64Image = await urlToBase64(imageUrl);
    document.getElementById('progressBar').style.width = '20%';
    document.getElementById('loadingStatus').textContent = 'Uploading to Meshy AI...';

    // 2. Start Task
    const createRes = await fetch('https://api.meshy.ai/openapi/v1/image-to-3d', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MESHY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image_url: base64Image,
        enable_pbr: true
      })
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      throw new Error(`Meshy API Error: ${errText}`);
    }

    const { result: taskId } = await createRes.json();
    currentTaskId = taskId;

    // 3. Poll Task
    pollStatus(taskId, MESHY_API_KEY);

  } catch (err) {
    console.error(err);
    showError(err.message || 'Failed to generate 3D model.');
  }
}

async function pollStatus(taskId, apiKey) {
  try {
    const res = await fetch(`https://api.meshy.ai/openapi/v1/image-to-3d/${taskId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    
    if (!res.ok) throw new Error('Failed to check status');
    
    const data = await res.json();
    
    if (data.status === 'SUCCEEDED') {
      currentModelUrl = data.model_urls.glb;
      
      const viewer = document.getElementById('viewer');
      viewer.src = currentModelUrl;
      
      setState(STATES.RESULT);
    } else if (data.status === 'FAILED') {
      throw new Error(data.task_error?.message || 'Generation failed');
    } else {
      // IN_PROGRESS or PENDING
      const progress = data.progress || 0;
      document.getElementById('progressBar').style.width = `${20 + (progress * 0.8)}%`;
      document.getElementById('loadingStatus').textContent = `Refining 3D Model (${progress}%)...`;
      
      setTimeout(() => pollStatus(taskId, apiKey), 2000);
    }
  } catch (err) {
    console.error(err);
    showError(err.message);
  }
}

document.getElementById('retryBtn').addEventListener('click', () => {
  setState(STATES.INITIAL);
});

document.getElementById('resetBtn').addEventListener('click', () => {
  setState(STATES.INITIAL);
});

document.getElementById('downloadBtn').addEventListener('click', () => {
  if (currentModelUrl) {
    chrome.downloads.download({
      url: currentModelUrl,
      filename: `meshy-model-${currentTaskId}.glb`
    });
  }
});

// Check for pending images when the side panel opens
async function checkForPendingImage() {
  const { pendingImageUrl } = await chrome.storage.local.get('pendingImageUrl');
  if (pendingImageUrl) {
    // Clear it so we don't auto-start next time
    await chrome.storage.local.remove('pendingImageUrl');
    startGeneration(pendingImageUrl);
  }
}

// File Upload Logic
document.getElementById('uploadBtn').addEventListener('click', () => {
  document.getElementById('fileUpload').click();
});

document.getElementById('fileUpload').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => startGeneration(event.target.result);
    reader.readAsDataURL(file);
  }
});

// Clipboard Paste Logic
document.addEventListener('paste', (e) => {
  const items = (e.clipboardData || e.originalEvent.clipboardData).items;
  for (let index in items) {
    const item = items[index];
    if (item.kind === 'file' && item.type.startsWith('image/')) {
      const file = item.getAsFile();
      const reader = new FileReader();
      reader.onload = (event) => startGeneration(event.target.result);
      reader.readAsDataURL(file);
      break; // Only take the first image
    }
  }
});

// We also listen for storage changes in case the panel is already open when the user clicks a widget
chrome.storage.local.onChanged.addListener((changes) => {
  if (changes.pendingImageUrl && changes.pendingImageUrl.newValue) {
    const newUrl = changes.pendingImageUrl.newValue;
    chrome.storage.local.remove('pendingImageUrl').then(() => {
      startGeneration(newUrl);
    });
  }
});

document.addEventListener('DOMContentLoaded', checkForPendingImage);
