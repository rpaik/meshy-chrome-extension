# Demo Script: Meshy 3D Generator Chrome Extension

Use this as a live demo runbook. The flow is written for a 4-6 minute demo, with optional branches if generation takes longer than expected.

## Before The Demo

- Chrome extension is loaded from this repo via `chrome://extensions`.
- Developer mode is enabled.
- Meshy API key is saved in the extension options.
- A web page with a clean object image is open.
- A backup local image is ready in case a site blocks image fetching.
- One previously generated `.glb` is available as a fallback if live generation is slow.

## 30-Second Setup

Say:

> This is a Chrome extension that turns ordinary web images into downloadable 3D assets using Meshy's Image to 3D API. The goal is to make generation feel native to browsing: find an image, click once, and get a model in the side panel.

Show:

- Chrome page with a clear image
- Extension icon
- Side panel closed at first

## Step 1: Select An Image

Action:

1. Hover over a good object image.
2. Point out the **To 3D** hover button.
3. Click **To 3D**.

Say:

> The content script detects large images on the page and adds this lightweight To 3D control. When I click it, the extension captures the image URL and hands it to the background service worker.

If the side panel does not open automatically:

> Chrome is careful about when extensions can open side panels automatically. The image is already captured, so I can click the extension icon to continue.

Then click the extension icon.

## Step 2: Start Generation

Action:

Watch the side panel move into the loading state.

Say:

> In the side panel, the extension fetches the selected image, converts it into a base64 data URI, and creates a Meshy Image to 3D task. From there, generation is asynchronous, so the extension polls Meshy for status and progress.

Point out:

- Source image preview
- Loading status
- Progress bar

## Step 3: Explain The Architecture

Say:

> The extension has four simple pieces. The content script owns the hover button. The background service worker owns the context menu and side-panel handoff. The options page stores the Meshy API key in Chrome local storage. The side panel owns the API call, polling loop, preview, and download.

Optional technical detail:

> The API key never goes through a custom backend in this demo. It stays in the browser and is sent directly to Meshy's API as a bearer token.

## Step 4: Show The Result

Action:

When the model appears, rotate and zoom it in the viewer.

Say:

> Once Meshy returns a successful task, the extension loads the generated `.glb` URL into model-viewer. That gives us an interactive preview directly inside Chrome.

Action:

Click **Download .glb**.

Say:

> The generated asset can be downloaded as a `.glb`, which is a common format for web, game, AR, and 3D workflows.

## Optional Branch: Upload Or Paste

Use this if the web image path is flaky or you want to show a second input mode.

Action:

1. Click **Generate Another**.
2. Click **Upload Image**.
3. Select a local image.

Say:

> The web-image flow is the main interaction, but the side panel also supports local upload and clipboard paste. That makes it useful even when a site blocks direct image access.

## Optional Branch: Context Menu

Action:

1. Right-click an image.
2. Choose **Generate 3D Model with Meshy**.

Say:

> There is also a standard right-click path for people who prefer browser-native interactions.

## If Generation Takes Too Long

Say:

> Meshy generation is asynchronous and can take a little time depending on the input and service load. The important part for this demo is that the extension has already created the task and is polling for completion.

Then show:

- The progress state
- A previously generated `.glb` fallback, if needed

## If Generation Fails

Say:

> The failure path is useful too: the extension surfaces the Meshy API error and lets the user try again. In a production version, I would add friendlier error categories for missing credits, invalid keys, blocked images, and unsupported inputs.

Then switch to upload mode or a known-good demo image.

## Closing

Say:

> The demo proves the core loop: browser image selection, Meshy task creation, async polling, 3D preview, and `.glb` download. The next step would be turning this into a more polished workflow with generation settings, recent history, and tighter permissions.

## Quick Talk Track

Use this condensed version when you only have two minutes:

> I built this as a Chrome side-panel extension for Meshy. When I hover over a large image, the extension adds a To 3D button. Clicking it sends the image into the side panel, where the extension converts it to base64 and creates a Meshy Image to 3D task. Meshy runs asynchronously, so the extension polls the task endpoint and updates progress. When generation succeeds, the side panel loads the returned `.glb` into an interactive model viewer, and I can download the model locally. It also supports right-click generation, direct upload, and clipboard paste, so the demo does not depend on one specific website.

