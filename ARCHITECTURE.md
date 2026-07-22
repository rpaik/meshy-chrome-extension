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
### Meshy API Integration
The extension acts as a direct client to the **Meshy AI REST API**, offloading all heavy machine learning computations to the cloud.
* **Authentication:** The extension relies on a user-provided Bearer token (`MESHY_API_KEY`) injected into the Authorization header of every request.
* **Image-to-3D Pipeline (`POST /v1/image-to-3d`):** To bypass cross-origin (CORS) restrictions on the web, the extension uses its elevated `<all_urls>` permission to fetch the target image, converts it into a Base64 data string locally, and submits it to Meshy's generation endpoint.
* **Asynchronous Polling (`GET /v1/image-to-3d/{taskId}`):** Because 3D generation is a long-running process, the Side Panel implements an asynchronous polling loop. It repeatedly queries the task endpoint every 2 seconds until the generation returns a `SUCCEEDED` status, at which point it extracts the `.glb` model URL and passes it to the rendering engine.
