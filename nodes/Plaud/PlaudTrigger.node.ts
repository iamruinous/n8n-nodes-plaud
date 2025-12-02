import type {
	IWebhookFunctions,
	IWebhookResponseData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	IHookFunctions,
	IDataObject,
} from 'n8n-workflow';

export class PlaudTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Plaud Trigger',
		name: 'plaudTrigger',
		icon: 'file:plaud.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Starts the workflow when a Plaud event occurs',
		defaults: {
			name: 'Plaud Trigger',
		},
		inputs: [] as NodeConnectionType[],
		outputs: ['main'] as NodeConnectionType[],
		credentials: [
			{
				name: 'plaudApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Audio Transcribe Completed',
						value: 'audio_transcribe.completed',
						description: 'Triggered when an audio transcription workflow completes',
					},
					{
						name: 'All Events',
						value: '*',
						description: 'Triggered on any Plaud webhook event',
					},
				],
				default: 'audio_transcribe.completed',
				description: 'The Plaud event to listen for',
			},
			{
				displayName:
					'Note: You need to configure your webhook URL in the Plaud Developer Portal. Copy the webhook URL shown below and register it in your Plaud account settings.',
				name: 'webhookNotice',
				type: 'notice',
				default: '',
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				// Plaud doesn't have an API to check webhook registration
				// Return true to avoid errors - users must manually register the webhook
				return true;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				// Plaud doesn't have an API to programmatically register webhooks
				// Users must manually register the webhook URL in the Plaud Developer Portal
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				// Plaud doesn't have an API to programmatically unregister webhooks
				// Users must manually remove the webhook URL from the Plaud Developer Portal
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const body = this.getBodyData() as IDataObject;
		const event = this.getNodeParameter('event') as string;

		// Extract the event type from the webhook payload
		const eventType = body.event_type as string || body.event as string || 'unknown';

		// Filter by event if not set to all events
		if (event !== '*' && eventType !== event) {
			// Event doesn't match, don't trigger the workflow
			return {
				noWebhookResponse: true,
			};
		}

		// Optionally verify webhook signature if Plaud provides one
		const signature = req.headers['x-plaud-signature'] as string | undefined;
		if (signature) {
			// Note: Add signature verification if Plaud documents the signing method
			// For now, log that a signature was received
			body._signaturePresent = true;
		}

		// Add metadata to help with debugging
		body._receivedAt = new Date().toISOString();
		body._eventType = eventType;

		return {
			workflowData: [this.helpers.returnJsonArray(body)],
		};
	}
}
