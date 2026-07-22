let currentWidget = null;
let currentImage = null;

// The SVG icon for the button
const cubeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`;

function createWidget(img) {
  if (currentWidget) {
    currentWidget.remove();
  }

  // Only show for images larger than a certain size (ignore tiny icons)
  if (img.width < 100 || img.height < 100) return;

  currentImage = img;

  const widget = document.createElement('div');
  widget.className = 'meshy-hover-widget';
  widget.innerHTML = `${cubeIcon} To 3D`;
  
  // Position widget over the top-right corner of the image
  const rect = img.getBoundingClientRect();
  widget.style.top = `${rect.top + window.scrollY + 8}px`;
  widget.style.left = `${rect.right + window.scrollX - 85}px`;

  const stopEvent = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  widget.addEventListener('mousedown', stopEvent);
  widget.addEventListener('mouseup', stopEvent);
  widget.addEventListener('pointerdown', stopEvent);
  widget.addEventListener('pointerup', stopEvent);
  widget.addEventListener('click', (e) => {
    stopEvent(e);
    
    const imageUrl = currentImage.src;
    
    // Notify the background script to save the image
    chrome.runtime.sendMessage({ action: 'generate3d', url: imageUrl }, (response) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      }
    });

    // Show a toast notification because Chrome won't let us open the Side Panel programmatically
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #111827;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-family: sans-serif;
      font-size: 14px;
      z-index: 2147483647;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
      transition: opacity 0.3s;
    `;
    toast.textContent = "Image captured! Click the Meshy extension icon to generate 3D model.";
    document.body.appendChild(toast);
    
    // Change button text briefly
    widget.innerHTML = 'Captured!';
    
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  });

  document.body.appendChild(widget);
  currentWidget = widget;

  // Keep widget attached to image or remove if mouse leaves completely
  const removeWidget = (e) => {
    if (e.relatedTarget === currentWidget || e.relatedTarget === currentImage) return;
    if (currentWidget) {
      currentWidget.remove();
      currentWidget = null;
      currentImage = null;
    }
  };

  img.addEventListener('mouseleave', removeWidget);
  widget.addEventListener('mouseleave', removeWidget);
}

// Global mouseover listener to detect hovering over images
document.addEventListener('mouseover', (e) => {
  if (e.target.tagName && e.target.tagName.toLowerCase() === 'img') {
    createWidget(e.target);
  }
});

// Remove widget on scroll to prevent it from detaching from the image visually
window.addEventListener('scroll', () => {
  if (currentWidget) {
    currentWidget.remove();
    currentWidget = null;
    currentImage = null;
  }
}, { passive: true });
