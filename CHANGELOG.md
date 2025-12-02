# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- File listing operation to browse uploaded recordings
- Batch workflow submission for multiple files
- Webhook signature verification (when Plaud documents signing method)

## [0.2.0] - 2024-12-01

### Added
- **Plaud Trigger Node**: New webhook-based trigger node for receiving Plaud events
  - Supports `audio_transcribe.completed` event or all events
  - Adds metadata (`_receivedAt`, `_eventType`) to incoming payloads
  - Users must manually register webhook URL in Plaud Developer Portal
- **Token Caching**: OAuth tokens are now cached with TTL tracking
  - 5-minute buffer before expiration ensures smooth token refresh
  - Reduces unnecessary API calls for repeated operations
- **Improved Error Handling**:
  - User-friendly error messages for common HTTP status codes
  - Automatic retry with exponential backoff for rate limits (429)
  - Automatic token refresh on 401 authentication errors
  - Maps Plaud-specific error codes to helpful messages
- **Example Workflow**: Added `examples/task-detection-workflow.json`
  - Demonstrates @mention extraction from transcriptions
  - Shows end-to-end webhook → get result → parse → notify flow

### Changed
- Refactored `plaudApiRequest` function to support retry logic
- Updated lint scripts to use glob patterns for better file matching

## [0.1.0] - 2024-12-01

### Added
- Initial release of n8n-nodes-plaud
- **Plaud API Credentials**: OAuth authentication with Client ID and Secret Key
- **Device Resource**:
  - `Get` - Retrieve device information by ID
  - `Bind` - Bind a device to a user account
  - `Unbind` - Unbind a device from a user account
- **File Resource**:
  - `Generate Upload URLs` - Generate presigned S3 URLs for multipart upload
  - `Complete Upload` - Finalize multipart upload with MD5 verification
- **Workflow Resource**:
  - `Submit` - Submit workflow for processing (transcription, AI summary)
  - `Get Status` - Check workflow execution status
  - `Get Result` - Retrieve workflow results with transcriptions and summaries
- Automatic OAuth token generation for each API request
- Comprehensive error handling with continue-on-fail support
- SVG icon for the node
- Full TypeScript implementation
- ESLint configuration for n8n node standards

### Technical Details
- Built with n8n-workflow ~1.70.0
- TypeScript ~5.7.2
- Node.js >= 18.10 required
- Uses n8n's IHttpRequestOptions for API calls

## Future Roadmap

### v0.3.0 (Planned)
- [ ] Add file listing operation
- [ ] Support for custom AI summary templates
- [ ] Batch operations for multiple workflows

### v1.0.0 (Planned)
- [ ] Full test coverage
- [ ] n8n verification submission
- [ ] Complete documentation with video tutorials

---

[Unreleased]: https://github.com/iamruinous/n8n-nodes-plaud/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/iamruinous/n8n-nodes-plaud/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/iamruinous/n8n-nodes-plaud/releases/tag/v0.1.0
