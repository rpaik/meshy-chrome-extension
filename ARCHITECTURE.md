# Architecture Overview: Meshy 3D Chrome Extension

This extension is built as a 100% standalone, client-side application that communicates directly with external APIs. Below is a high-level overview of the technologies and core components used:

### Tech Stack
* **Languages:** Vanilla JavaScript (ES6+), HTML5, and CSS3. No build tools or frontend frameworks were required, keeping the extension lightweight.
* **Extension Platform:** Chrome Extensions Manifest V3, utilizing the modern Service Worker architecture and strict Content Security Policies (CSP).
* **3D Rendering:** Google's `<model-viewer>` web component (WebGL) is used to natively render the `.glb` files inside the browser.

### Core Components
* **Manifest (`manifest.json`):** The blueprint of the extension. It declares all necessary permissions (`sidePanel`, `contextMenus`, `storage`, `scripting`, `<all_urls>`) and wires the background scripts and content scripts together.
* **Background Service Worker (`background.js`):** Runs asynchronously in the background. It initializes the right-click Context Menu and listens for cross-component messages to route data between the webpage and the extension's side panel.
* **Content Scripts (`content.js` & `content.css`):** Code injected directly into the DOM of the web pages the user visits. It powers the "To 3D" glassmorphism hover widget, capturing image URLs and aggressively blocking `pointerdown`/`pointerup` events to prevent host-site interference (like Amazon's popups).
* **The Side Panel (`sidepanel.html`, `sidepanel.js`, `sidepanel.css`):** The primary user interface. It manages state transitions (Initial -> Loading -> Result -> Error) and provides manual upload/clipboard-paste fallback mechanisms for sandboxed environments like PDF viewers.
* **Storage Layer (`chrome.storage.local`):** Securely persists the user's Meshy API key and temporarily buffers captured image URLs so they can be picked up when the side panel loads.
* **API Integration:** The side panel natively converts captured or uploaded images into Base64 format and handles all direct REST API calls (`fetch`) to the Meshy `image-to-3d` endpoints, including an asynchronous polling loop for generation status.
