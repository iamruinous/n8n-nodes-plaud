# n8n-nodes-plaud

[![npm version](https://badge.fury.io/js/n8n-nodes-plaud.svg)](https://badge.fury.io/js/n8n-nodes-plaud)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This is an n8n community node for the [Plaud](https://plaud.ai) AI notetaker API. It allows you to access recordings, transcriptions, and AI-generated summaries from Plaud devices (NotePin, Note, NotePro).

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Table of Contents

- [Installation](#installation)
- [Operations](#operations)
- [Credentials](#credentials)
- [Usage Examples](#usage-examples)
- [API Reference](#api-reference)
- [Use Cases](#use-cases)
- [Development](#development)
- [Resources](#resources)
- [License](#license)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### n8n GUI (Recommended)

1. Go to **Settings > Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-plaud` and confirm
4. Restart n8n if prompted

### npm (Self-hosted)

```bash
cd ~/.n8n/nodes
npm install n8n-nodes-plaud
```

Then restart your n8n instance.

### Docker

Add to your n8n Dockerfile:

```dockerfile
RUN cd /usr/local/lib/node_modules/n8n && npm install n8n-nodes-plaud
```

## Nodes

This package includes two nodes:

| Node | Type | Description |
|------|------|-------------|
| **Plaud** | Regular | Interact with the Plaud API (devices, files, workflows) |
| **Plaud Trigger** | Trigger | Receive webhook events when transcriptions complete |

## Operations

### Device

Manage Plaud recording devices.

| Operation | Description |
|-----------|-------------|
| **Get** | Retrieve device information by ID including status, firmware version, and binding state |
| **Bind** | Bind a device to a user account (required before uploading recordings) |
| **Unbind** | Unbind a device from a user account |

### File

Handle audio file uploads to Plaud's processing pipeline.

| Operation | Description |
|-----------|-------------|
| **Generate Upload URLs** | Generate presigned S3 URLs for secure multipart file upload |
| **Complete Upload** | Finalize a multipart upload with MD5 integrity verification |

### Workflow

Submit and monitor audio processing workflows.

| Operation | Description |
|-----------|-------------|
| **Submit** | Submit a workflow for execution (transcription, AI summary, custom tasks) |
| **Get Status** | Check the current status of a workflow |
| **Get Result** | Retrieve completed workflow results including transcriptions and AI summaries |

## Credentials

### Getting API Credentials

1. Sign up at the [Plaud Developer Portal](https://platform.plaud.ai)
2. Create a new application
3. Copy your **Client ID** and **Secret Key**

### Configuring in n8n

1. In n8n, go to **Credentials**
2. Click **Add Credential**
3. Search for "Plaud API"
4. Enter your Client ID and Secret Key
5. Click **Save**

The node automatically handles OAuth token generation and refresh.

## Usage Examples

### Example 1: Get Workflow Results

Retrieve transcription and AI summary results from a processed recording:

1. Add a **Plaud** node to your workflow
2. Select **Workflow** as the resource
3. Select **Get Result** as the operation
4. Enter the workflow ID (received from webhook or previous submission)

**Output example:**
```json
{
  "id": "workflow_abc123",
  "status": "SUCCESS",
  "tasks": [
    {
      "type": "transcription",
      "result": {
        "text": "Full transcription text here...",
        "segments": [...]
      }
    },
    {
      "type": "ai_summary",
      "result": {
        "summary": "Meeting summary...",
        "action_items": ["Task 1", "Task 2"],
        "key_points": [...]
      }
    }
  ]
}
```

### Example 2: Upload and Process a Recording

Complete flow for processing an audio file:

```
[Manual Trigger]
    → [Plaud: Generate Upload URLs]
    → [HTTP Request: Upload to S3]
    → [Plaud: Complete Upload]
    → [Plaud: Submit Workflow]
    → [Wait]
    → [Plaud: Get Result]
```

**Step-by-step:**

1. **Generate Upload URLs**
   - Resource: File
   - Operation: Generate Upload URLs
   - File Size: `{{ $json.fileSize }}`
   - File Type: `audio/wav`

2. **Upload chunks to S3** (HTTP Request node)
   - Use the presigned URLs from step 1
   - Collect ETags from responses

3. **Complete Upload**
   - Resource: File
   - Operation: Complete Upload
   - File ID: `{{ $('Generate Upload URLs').item.json.FileId }}`
   - Upload ID: `{{ $('Generate Upload URLs').item.json.UploadId }}`
   - Part List: `{{ JSON.stringify($json.parts) }}`
   - File MD5: `{{ $json.md5Hash }}`

4. **Submit Workflow**
   - Resource: Workflow
   - Operation: Submit
   - Workflows JSON: Define your processing tasks

5. **Get Result**
   - Resource: Workflow
   - Operation: Get Result
   - Workflow ID: `{{ $json.id }}`

### Example 3: Webhook-Triggered Processing with Plaud Trigger

Use the **Plaud Trigger** node to listen for transcription completion events:

```
[Plaud Trigger (audio_transcribe.completed)]
    → [Plaud: Get Result]
    → [Code: Extract @mentions]
    → [IF: Has Mentions?]
    → [Slack: Send Notification]
```

**Setup:**

1. Add the **Plaud Trigger** node to your workflow
2. Select the event type (`audio_transcribe.completed` or `All Events`)
3. Copy the webhook URL from the node
4. Register the webhook URL in your [Plaud Developer Portal](https://platform.plaud.ai)
5. Activate the workflow

An example workflow demonstrating task detection from @mentions is available in `examples/task-detection-workflow.json`.

## API Reference

### Workflow Status Values

| Status | Description |
|--------|-------------|
| `PENDING` | Workflow is queued for processing |
| `RECEIVED` | Workflow received by the processor |
| `STARTED` | Processing has begun |
| `PROGRESS` | Processing is in progress |
| `SUCCESS` | Processing completed successfully |
| `FAILURE` | Processing failed (check error details) |
| `REVOKED` | Workflow was cancelled |

### Webhook Events

Configure webhooks in the Plaud Developer Portal to receive real-time notifications:

| Event | Description |
|-------|-------------|
| `audio_transcribe.completed` | Transcription processing finished |

Webhook payloads include:
- `event_type`: The event that triggered the webhook
- `data.file_id`: The associated file ID
- `data.workflow_id`: The workflow ID for retrieving results

## Use Cases

### Meeting Notes Automation

Automatically process meeting recordings and extract:
- Full transcription
- AI-generated summary
- Action items and tasks
- Key decisions and quotes

### Task Assignment Detection

Search transcriptions for mentions like `@Jade`, `@Jay`, or other assignees:

```javascript
// Code node example
const result = $input.first().json;
const transcription = result.tasks.find(t => t.type === 'transcription')?.result?.text || '';

// Find @mentions with common misspellings
const mentionPatterns = /@(jade|jay|jayden|jaden)/gi;
const mentions = transcription.match(mentionPatterns) || [];

return { mentions, hasAssignments: mentions.length > 0 };
```

### Multi-Language Support

Plaud supports transcription in multiple languages. Specify the primary language when submitting workflows for improved accuracy:

```json
{
  "workflows": [
    {
      "type": "transcription",
      "options": {
        "language": "en-US",
        "hotwords": ["Plaud", "n8n", "workflow"]
      }
    }
  ]
}
```

### Custom Vocabulary

Add industry-specific terms or names as hotwords to improve transcription accuracy:

```json
{
  "hotwords": ["ACME Corp", "Q4 deliverables", "Kubernetes"]
}
```

## Development

### Prerequisites

- Node.js >= 18.10
- npm or pnpm

### Setup

```bash
git clone https://github.com/iamruinous/n8n-nodes-plaud.git
cd n8n-nodes-plaud
npm install
```

### Build

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Linting

```bash
npm run lint
npm run lintfix  # Auto-fix issues
```

### Local Testing with n8n

1. Build the node: `npm run build`
2. Link to n8n: `npm link`
3. In your n8n installation: `npm link n8n-nodes-plaud`
4. Restart n8n

### CI/CD

This project uses GitHub Actions for continuous integration and automated releases:

- **CI Workflow** (`.github/workflows/ci.yml`): Runs on all PRs and pushes to `main`. Validates code with lint and build checks on Node.js 20.x and 22.x.

- **Publish Workflow** (`.github/workflows/publish.yml`): Triggered when a GitHub Release is published. Validates the release tag is semver-compatible, runs all checks, and publishes to npm.

#### Creating a Release

1. Ensure your changes are merged to `main`
2. Update `package.json` version and `CHANGELOG.md`
3. Create a GitHub Release with a semver tag (e.g., `v0.2.0`)
4. The publish workflow will automatically validate and publish to npm

#### Required Secrets

For npm publishing, add the `NPM_TOKEN` secret to your repository:

1. Generate an npm access token at [npmjs.com](https://www.npmjs.com/settings/~/tokens)
2. Go to Repository Settings → Secrets and variables → Actions
3. Add `NPM_TOKEN` with your npm access token

## Resources

- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Plaud API Documentation](https://docs.plaud.ai/documentation/get_started/overview)
- [Plaud Developer Portal](https://platform.plaud.ai)
- [Plaud Webhook Events](https://docs.plaud.ai/documentation/developer_guides/webhook_events)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[MIT](LICENSE) - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [n8n](https://n8n.io/) for the amazing workflow automation platform
- [Plaud](https://plaud.ai) for their AI notetaker devices and API
