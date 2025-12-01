import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class PlaudApi implements ICredentialType {
	name = 'plaudApi';
	displayName = 'Plaud API';
	documentationUrl = 'https://docs.plaud.ai/documentation/get_started/overview';
	properties: INodeProperties[] = [
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string',
			default: '',
			required: true,
			description: 'Your Plaud API Client ID from the Developer Portal',
		},
		{
			displayName: 'Secret Key',
			name: 'secretKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Your Plaud API Secret Key from the Developer Portal',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization:
					'=Bearer {{ Buffer.from($credentials.clientId + ":" + $credentials.secretKey).toString("base64") }}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://platform.plaud.ai',
			url: '/api/oauth/api-token',
			method: 'POST',
		},
	};
}
