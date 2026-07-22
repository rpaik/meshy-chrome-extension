# Meshy 3D Generator Chrome Extension

Generate a 3D model from almost any image on the web using the Meshy Image-to-3D API. Ideal for online stores and product assembly guides, allowing users to view products as interactive 3D models.

This is a Manifest V3 Chrome extension. Hover over an image, click **To 3D**, and the extension opens a Chrome side panel where Meshy turns the selected image into a downloadable `.glb` model.

## What It Does

- Adds a **To 3D** hover button on large images across web pages
- Adds a right-click image menu item: **Generate 3D Model with Meshy**
- Opens a Chrome side panel for model generation
- Accepts images from a web page, direct upload, or clipboard paste
- Converts the selected image to a base64 data URI before sending it to Meshy
- Polls Meshy until the generation task succeeds or fails
- Previews the generated `.glb` with `<model-viewer>`
- Downloads the generated `.glb` file locally

## Using the Extension

1. Install the extension unpacked in Chrome. (Please see [Requirements](https://github.com/rpaik/meshy-chrome-extension/blob/main/README.md#requirements) & [Setup](https://github.com/rpaik/meshy-chrome-extension/blob/main/README.md#setup) sections below)
2. Add your Meshy API key in the extension options.
3. Open a web page with a clear product, object, or character image.
4. Hover over the image and click **To 3D**.
5. Open or watch the side panel as the extension submits the image to Meshy.
6. Wait for the 3D model to complete.
7. Rotate the model in the preview.
8. Download the `.glb`.

## Requirements

- Google Chrome with Manifest V3 extension support
- A Meshy account and API key
- Internet access for Meshy API calls

## Setup

Clone the repo:

```bash
git clone https://github.com/rpaik/meshy-chrome-extension.git
cd meshy-chrome-extension
```

Load the extension in Chrome:

1. Open `chrome://extensions`.
2. Turn on **Developer mode**.
3. Click **Load unpacked**.
4. Select this repo folder.

Configure your Meshy API key:

1. Find **Meshy 3D Generator** in `chrome://extensions`.
2. Click **Details**.
3. Click **Extension options**.
4. Paste your Meshy API key.
5. Click **Save Settings**.

The API key is stored in `chrome.storage.local` and sent only in requests to `https://api.meshy.ai`.

## Usage Options

### Generate From a Web Image

1. Visit a page with an image at least `100 x 100` pixels.
2. Hover over the image.
3. Click **To 3D**.
4. If needed, click the extension icon to open the side panel.
5. Wait for the model to finish.

### Generate From the Context Menu

1. Right-click an image.
2. Choose **Generate 3D Model with Meshy**.
3. Use the side panel to monitor the result.

### Generate From an Uploaded Image

1. Click the extension icon to open the side panel.
2. Click **Upload Image**.
3. Choose a local image file.

### Generate From the Clipboard

1. Copy an image to your clipboard.
2. Open the extension side panel.
3. Press `Cmd+V` on macOS or `Ctrl+V` on Windows/Linux.

## How It Works

The extension is split into four main pieces:

- `manifest.json` defines the Manifest V3 extension, side panel, content script, permissions, and options page.
- `content.js` injects the hover widget on qualifying images and sends selected image URLs to the background service worker.
- `background.js` handles the image context menu, stores the selected image URL, and opens the Chrome side panel.
- `sidepanel.js` converts images to base64, starts Meshy Image to 3D generation, polls for completion, previews the `.glb`, and downloads the final model.

The generation sequence is:

1. User selects an image.
2. Extension saves the image URL as `pendingImageUrl`.
3. Side panel reads and clears the pending image.
4. Side panel converts the image to a base64 data URI.
5. Extension calls `POST https://api.meshy.ai/openapi/v1/image-to-3d`.
6. Extension polls `GET https://api.meshy.ai/openapi/v1/image-to-3d/{taskId}`.
7. On success, the returned `.glb` URL is loaded into `<model-viewer>`.
8. User can download the `.glb`.

You can find more information in the Architecture page. 

## Permissions

This extension requests:

- `sidePanel` to show the generation workflow in Chrome's side panel
- `contextMenus` to add the right-click image action
- `storage` to save the API key and selected image URL
- `scripting` and `tabs` for extension/page integration
- `downloads` to save generated `.glb` files
- `<all_urls>` so the content script can detect page images and the side panel can fetch image URLs

Because `<all_urls>` is broad, treat this as a developer demo. Before publishing, consider narrowing host permissions or using optional permissions.

## Troubleshooting

### The side panel says the API key is missing

Open the extension options and save your Meshy API key.

### The hover button does not appear

The image may be smaller than `100 x 100` pixels, rendered as a CSS background, inside a restricted frame, or on a Chrome/internal page where content scripts cannot run.

### The side panel does not open after clicking To 3D

Chrome limits when extensions can programmatically open the side panel. Click the extension icon manually; the selected image should still be waiting.

### Generation fails immediately

Check that your API key is valid, the Meshy account has available credits, and the image is reachable or supported by Meshy.

### The model takes a while

Image to 3D generation is asynchronous. The extension polls Meshy every two seconds and updates progress when Meshy returns it.

## Notes For Images

Clear object-centric images work best:

- Product photos on plain backgrounds
- Toys, figurines, shoes, furniture, tools, or decor
- Character images with a visible full body or strong silhouette

Avoid images with heavy occlusion, tiny subjects, complex collages, or lots of text.

## Future Improvements

This repo is a working demo, not a hardened production extension. Here's a partial list of potential improvements:

- Better status handling for Meshy API errors
- A gallery of recent generations
- Support for multiple selected images

If you have other suggestions, please feel free to open an issue!

