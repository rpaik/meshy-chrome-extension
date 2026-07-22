// Ensure the side panel opens when the extension icon is clicked
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => console.error(error));

// Create context menu for images
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'generate-3d',
    title: 'Generate 3D Model with Meshy',
    contexts: ['image']
  });
});

// Handle Context Menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'generate-3d' && info.srcUrl) {
    await handleImageSelection(info.srcUrl, tab.windowId);
  }
});

// Handle messages from the content script (hover widget)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'generate3d' && message.url) {
    handleImageSelection(message.url, sender.tab.windowId).then(() => {
      sendResponse({ success: true });
    });
    return true; // keep channel open for async response
  }
});

async function handleImageSelection(imageUrl, windowId) {
  // Save the URL to local storage so the side panel can pick it up when it loads
  await chrome.storage.local.set({ pendingImageUrl: imageUrl });
  
  // Open the side panel
  try {
    await chrome.sidePanel.open({ windowId });
  } catch (err) {
    console.error("Failed to open side panel:", err);
  }
}
