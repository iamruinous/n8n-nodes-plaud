# n8n-nodes-plaud

This is an n8n community node for the [Plaud](https://plaud.ai) AI notetaker API. It allows you to access recordings, transcriptions, and AI-generated summaries from Plaud devices.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Usage](#usage)
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### npm

```bash
npm install n8n-nodes-plaud
```

### n8n GUI

1. Go to **Settings > Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-plaud` and confirm

## Operations

### Device

| Operation | Description |
|-----------|-------------|
| **Get** | Get device information by ID |
| **Bind** | Bind a device to a user account |
| **Unbind** | Unbind a device from a user account |

### File

| Operation | Description |
|-----------|-------------|
| **Generate Upload URLs** | Generate presigned URLs for multipart file upload |
| **Complete Upload** | Complete a multipart file upload with integrity verification |

### Workflow

| Operation | Description |
|-----------|-------------|
| **Submit** | Submit a workflow for execution (transcription, AI summary, etc.) |
| **Get Status** | Get the current status of a workflow (PENDING, STARTED, SUCCESS, etc.) |
| **Get Result** | Get the result data including all tasks and their outputs |

## Credentials

To use this node, you need a Plaud API account:

1. Sign up at [Plaud Developer Portal](https://platform.plaud.ai)
2. Create an application to get your **Client ID** and **Secret Key**
3. In n8n, create new credentials for "Plaud API" and enter your Client ID and Secret Key

## Usage

### Example: Get Workflow Results

This example retrieves transcription and AI summary results from a processed recording:

1. Add a **Plaud** node to your workflow
2. Select **Workflow** as the resource
3. Select **Get Result** as the operation
4. Enter the workflow ID (received from webhook or previous submission)

### Example: Processing a Recording

The typical flow for processing audio:

1. **Generate Upload URLs** - Get presigned S3 URLs for your audio file
2. **Upload chunks** - Use HTTP Request node to upload file parts to S3
3. **Complete Upload** - Finalize the upload with MD5 verification
4. **Submit Workflow** - Request transcription and/or AI summary
5. **Wait for webhook** or poll **Get Status** until complete
6. **Get Result** - Retrieve transcription text and summaries

### Workflow Status Values

| Status | Description |
|--------|-------------|
| PENDING | Workflow queued |
| RECEIVED | Workflow received by processor |
| STARTED | Processing has begun |
| PROGRESS | Processing in progress |
| SUCCESS | Completed successfully |
| FAILURE | Processing failed |
| REVOKED | Workflow was cancelled |

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* [Plaud API Documentation](https://docs.plaud.ai/documentation/get_started/overview)
* [Plaud Developer Portal](https://platform.plaud.ai)

## License

[MIT](LICENSE)
