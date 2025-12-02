# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**n8n-nodes-plaud** is an n8n community node that integrates with the [Plaud AI notetaker API](https://docs.plaud.ai). It enables n8n workflows to access recordings, transcriptions, and AI-generated summaries from Plaud devices (NotePin, Note, NotePro).

### Primary Use Case

The original motivation for this project was to:
1. Access Plaud notes via their API
2. Search transcriptions for task assignments mentioning specific people (e.g., `@Jade`, `@Jay`, `@Jayden`)
3. Extract todo items from meeting recordings automatically

## Project Structure

```
n8n-nodes-plaud/
├── credentials/
│   └── PlaudApi.credentials.ts    # OAuth credentials (client_id + secret_key)
├── nodes/
│   └── Plaud/
│       ├── Plaud.node.ts          # Main node implementation
│       ├── PlaudTrigger.node.ts   # Webhook trigger node
│       └── plaud.svg              # Node icon
├── examples/
│   └── task-detection-workflow.json  # Example workflow for @mention detection
├── dist/                          # Compiled JavaScript (generated)
├── package.json                   # npm package configuration
├── tsconfig.json                  # TypeScript configuration
├── .eslintrc.js                   # ESLint for development
├── .eslintrc.prepublish.js        # Stricter ESLint for publishing
├── gulpfile.js                    # Build task for copying icons
├── CHANGELOG.md                   # Version history
└── README.md                      # User documentation
```

## Build Commands

```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript + copy icons
npm run dev          # Watch mode for development
npm run lint         # Check for linting errors
npm run lintfix      # Auto-fix linting errors
npm run format       # Format code with Prettier
```

## Architecture

### Authentication Flow

The Plaud API uses a two-step OAuth flow:
1. Generate a Bearer token from `base64(client_id:secret_key)`
2. Exchange that for a short-lived API token (1 hour TTL)
3. Use the API token for all subsequent requests

Token caching is implemented with a 5-minute buffer before expiration to ensure smooth operation.

### Node Structure

The package includes two nodes:

**Plaud (Regular Node)** - uses n8n's programmatic style with:
- **Resources**: Device, File, Workflow
- **Operations**: Multiple operations per resource
- **Conditional UI**: `displayOptions` show/hide fields based on selected resource/operation
- **Error Handling**: User-friendly messages with retry logic for rate limits
- **Token Caching**: Automatic OAuth token caching with TTL management

**PlaudTrigger (Trigger Node)** - webhook-based trigger:
- Listens for `audio_transcribe.completed` or all events
- Users must manually register the webhook URL in Plaud Developer Portal
- Adds metadata (`_receivedAt`, `_eventType`) to incoming payloads

### API Base URL

All Plaud API calls go to: `https://platform.plaud.ai`

## Current Limitations

1. **No file listing**: Cannot browse existing files/recordings via API (endpoint may not exist)
2. **Manual S3 upload**: File upload requires separate HTTP Request nodes for S3 chunks
3. **No programmatic webhook registration**: Plaud doesn't expose API for webhook management; users must register manually

## Completed Features

- **Token caching**: OAuth tokens are cached with TTL tracking and 5-minute refresh buffer
- **Plaud Trigger Node**: Webhook trigger for `audio_transcribe.completed` events
- **Error handling**: User-friendly error messages with automatic retry for rate limits (429)
- **Example workflow**: Task detection workflow demonstrating @mention extraction (`examples/task-detection-workflow.json`)

## Next Steps for Development

### High Priority

1. **Test with real Plaud account**
   - Verify credential authentication works
   - Test each operation with actual API responses
   - Document real response schemas

### Medium Priority

2. **Add file/recording listing**
   - Research if Plaud API has a list files endpoint
   - Enable browsing past recordings

3. **Add webhook signature verification**
   - If Plaud documents their signing method, implement verification in PlaudTrigger

### Low Priority

4. **Unit tests**
   - Mock HTTP requests
   - Test each operation
   - Test error handling

5. **Submit for n8n verification**
   - Follow [n8n verification process](https://docs.n8n.io/integrations/community-nodes/build-community-nodes/)
   - Ensure all linting passes with prepublish config

## Plaud API Reference

### Key Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/oauth/api-token` | POST | Get API token |
| `/api/devices/{id}` | GET | Get device info |
| `/api/devices/bind` | POST | Bind device to user |
| `/api/devices/unbind` | POST | Unbind device |
| `/api/files/upload-s3/generate-presigned-urls` | POST | Get S3 upload URLs |
| `/api/files/upload-s3/complete-upload` | POST | Complete multipart upload |
| `/api/workflows/submit` | POST | Submit processing workflow |
| `/api/workflows/{id}/status` | GET | Check workflow status |
| `/api/workflows/{id}/result` | GET | Get workflow results |

### Workflow Status Values

- `PENDING` → `RECEIVED` → `STARTED` → `PROGRESS` → `SUCCESS`
- Or: `FAILURE` / `REVOKED`

### Webhook Events

- `audio_transcribe.completed` - Fired when transcription finishes

## Tips for Next Session

1. **Test with real Plaud account**: The authentication flow is critical. Test with real Plaud credentials first.

2. **Check API response shapes**: The current implementation assumes response schemas. Verify against actual API responses.

3. **The Plaud docs are incomplete**: Some endpoints return 404. The OpenAPI spec URL redirects. You may need to experiment with the API directly.

4. **Rate limits are handled**: Automatic retry with exponential backoff is implemented for 429 responses.

5. **Token caching is implemented**: Tokens are cached with a 5-minute buffer before expiration.

6. **Publishing to npm**:
   ```bash
   npm login
   npm publish
   ```
   Then install in n8n via Settings > Community Nodes.

## Related Resources

- [Plaud API Docs](https://docs.plaud.ai/documentation/get_started/overview)
- [Plaud Developer Portal](https://platform.plaud.ai)
- [n8n Community Node Guide](https://docs.n8n.io/integrations/creating-nodes/build/programmatic-style-node/)
- [n8n Node Starter Template](https://github.com/n8n-io/n8n-nodes-starter)

## Git Workflow

This project follows conventional commits:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks
- `refactor:` - Code refactoring

Example:
```bash
git commit -m "feat: add token caching for OAuth"
```
