# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Webhook trigger node for receiving Plaud events directly
- File listing operation to browse uploaded recordings
- Batch workflow submission for multiple files
- Token caching to reduce API calls
- Trigger node for new recording notifications

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

### v0.2.0 (Planned)
- [ ] Add Plaud Webhook Trigger node
- [ ] Implement token caching (tokens valid for 1 hour)
- [ ] Add retry logic for transient failures

### v0.3.0 (Planned)
- [ ] Add file listing operation
- [ ] Support for custom AI summary templates
- [ ] Batch operations for multiple workflows

### v1.0.0 (Planned)
- [ ] Full test coverage
- [ ] n8n verification submission
- [ ] Complete documentation with video tutorials

---

[Unreleased]: https://github.com/iamruinous/n8n-nodes-plaud/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/iamruinous/n8n-nodes-plaud/releases/tag/v0.1.0
