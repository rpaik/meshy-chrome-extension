// Save the API key to chrome.storage.local
const saveOptions = async () => {
  const apiKey = document.getElementById('apiKey').value.trim();
  
  await chrome.storage.local.set({ MESHY_API_KEY: apiKey });
  
  // Show success message
  const status = document.getElementById('status');
  status.style.opacity = '1';
  setTimeout(() => {
    status.style.opacity = '0';
  }, 3000);
};

// Load the currently saved API key
const restoreOptions = async () => {
  const { MESHY_API_KEY } = await chrome.storage.local.get('MESHY_API_KEY');
  if (MESHY_API_KEY) {
    document.getElementById('apiKey').value = MESHY_API_KEY;
  }
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('saveBtn').addEventListener('click', saveOptions);
