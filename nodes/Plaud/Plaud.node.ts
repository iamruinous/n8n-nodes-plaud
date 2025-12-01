import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	IHttpRequestMethods,
	IHttpRequestOptions,
	NodeConnectionType,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export class Plaud implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Plaud',
		name: 'plaud',
		icon: 'file:plaud.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Access Plaud AI notetaker - recordings, transcriptions, and AI summaries',
		defaults: {
			name: 'Plaud',
		},
		inputs: ['main'] as NodeConnectionType[],
		outputs: ['main'] as NodeConnectionType[],
		credentials: [
			{
				name: 'plaudApi',
				required: true,
			},
		],
		properties: [
			// Resource selector
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Device',
						value: 'device',
					},
					{
						name: 'File',
						value: 'file',
					},
					{
						name: 'Workflow',
						value: 'workflow',
					},
				],
				default: 'workflow',
			},

			// ==================== DEVICE OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['device'],
					},
				},
				options: [
					{
						name: 'Bind',
						value: 'bind',
						description: 'Bind a device to a user account',
						action: 'Bind a device',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get device information by ID',
						action: 'Get a device',
					},
					{
						name: 'Unbind',
						value: 'unbind',
						description: 'Unbind a device from a user account',
						action: 'Unbind a device',
					},
				],
				default: 'get',
			},
			// Device ID for get operation
			{
				displayName: 'Device ID',
				name: 'deviceId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['device'],
						operation: ['get'],
					},
				},
				description: 'The unique identifier of the device',
			},
			// Device bind parameters
			{
				displayName: 'Device Serial Number',
				name: 'deviceSerialNumber',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['device'],
						operation: ['bind', 'unbind'],
					},
				},
				description: 'The serial number of the device to bind/unbind',
			},
			{
				displayName: 'User ID',
				name: 'userId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['device'],
						operation: ['bind', 'unbind'],
					},
				},
				description: 'The user ID to bind/unbind the device to/from',
			},

			// ==================== FILE OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['file'],
					},
				},
				options: [
					{
						name: 'Complete Upload',
						value: 'completeUpload',
						description: 'Complete a multipart file upload',
						action: 'Complete file upload',
					},
					{
						name: 'Generate Upload URLs',
						value: 'generateUploadUrls',
						description: 'Generate presigned URLs for multipart upload',
						action: 'Generate upload URLs',
					},
				],
				default: 'generateUploadUrls',
			},
			// Generate upload URLs parameters
			{
				displayName: 'File Size',
				name: 'fileSize',
				type: 'number',
				required: true,
				default: 0,
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['generateUploadUrls'],
					},
				},
				description: 'The size of the file in bytes',
			},
			{
				displayName: 'File Type',
				name: 'fileType',
				type: 'string',
				required: true,
				default: 'audio/wav',
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['generateUploadUrls'],
					},
				},
				description: 'The MIME type of the file (e.g., audio/wav, audio/mp3)',
			},
			// Complete upload parameters
			{
				displayName: 'Owner ID',
				name: 'ownerId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['completeUpload'],
					},
				},
				description: 'The owner user ID for the file',
			},
			{
				displayName: 'File ID',
				name: 'fileId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['completeUpload'],
					},
				},
				description: 'The file ID returned from generate upload URLs',
			},
			{
				displayName: 'Upload ID',
				name: 'uploadId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['completeUpload'],
					},
				},
				description: 'The upload ID returned from generate upload URLs',
			},
			{
				displayName: 'Part List (JSON)',
				name: 'partList',
				type: 'json',
				required: true,
				default: '[]',
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['completeUpload'],
					},
				},
				description:
					'JSON array of part objects with PartNumber and ETag from each chunk upload',
			},
			{
				displayName: 'File Type',
				name: 'fileTypeComplete',
				type: 'string',
				required: true,
				default: 'audio/wav',
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['completeUpload'],
					},
				},
				description: 'The MIME type of the file',
			},
			{
				displayName: 'File MD5',
				name: 'fileMd5',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['completeUpload'],
					},
				},
				description: 'MD5 hash of the complete file for integrity verification',
			},
			{
				displayName: 'File Name',
				name: 'fileName',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['completeUpload'],
					},
				},
				description: 'The name of the file',
			},

			// ==================== WORKFLOW OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['workflow'],
					},
				},
				options: [
					{
						name: 'Get Result',
						value: 'getResult',
						description:
							'Get the result data of a workflow including all tasks and their results',
						action: 'Get workflow result',
					},
					{
						name: 'Get Status',
						value: 'getStatus',
						description: 'Get the current status of a workflow',
						action: 'Get workflow status',
					},
					{
						name: 'Submit',
						value: 'submit',
						description: 'Submit a workflow for execution with a list of tasks',
						action: 'Submit a workflow',
					},
				],
				default: 'getResult',
			},
			// Workflow ID for get operations
			{
				displayName: 'Workflow ID',
				name: 'workflowId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['workflow'],
						operation: ['getResult', 'getStatus'],
					},
				},
				description: 'The unique identifier of the workflow',
			},
			// Submit workflow parameters
			{
				displayName: 'Workflows (JSON)',
				name: 'workflows',
				type: 'json',
				required: true,
				default: '[]',
				displayOptions: {
					show: {
						resource: ['workflow'],
						operation: ['submit'],
					},
				},
				description: 'JSON array of workflow task definitions',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: ['workflow'],
						operation: ['submit'],
					},
				},
				options: [
					{
						displayName: 'Metadata (JSON)',
						name: 'metadata',
						type: 'json',
						default: '{}',
						description: 'Optional metadata object for the workflow',
					},
					{
						displayName: 'Version',
						name: 'version',
						type: 'string',
						default: '1.0',
						description: 'Workflow version',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject | IDataObject[];

				if (resource === 'device') {
					if (operation === 'get') {
						const deviceId = this.getNodeParameter('deviceId', i) as string;
						responseData = await plaudApiRequest.call(
							this,
							'GET',
							`/api/devices/${deviceId}`,
						);
					} else if (operation === 'bind') {
						const deviceSerialNumber = this.getNodeParameter('deviceSerialNumber', i) as string;
						const userId = this.getNodeParameter('userId', i) as string;
						responseData = await plaudApiRequest.call(this, 'POST', '/api/devices/bind', {
							device_serial_number: deviceSerialNumber,
							user_id: userId,
						});
					} else if (operation === 'unbind') {
						const deviceSerialNumber = this.getNodeParameter('deviceSerialNumber', i) as string;
						const userId = this.getNodeParameter('userId', i) as string;
						responseData = await plaudApiRequest.call(this, 'POST', '/api/devices/unbind', {
							device_serial_number: deviceSerialNumber,
							user_id: userId,
						});
					} else {
						throw new NodeApiError(this.getNode(), {
							message: `Unknown operation: ${operation}`,
						});
					}
				} else if (resource === 'file') {
					if (operation === 'generateUploadUrls') {
						const fileSize = this.getNodeParameter('fileSize', i) as number;
						const fileType = this.getNodeParameter('fileType', i) as string;
						responseData = await plaudApiRequest.call(
							this,
							'POST',
							'/api/files/upload-s3/generate-presigned-urls',
							{
								filesize: fileSize,
								filetype: fileType,
							},
						);
					} else if (operation === 'completeUpload') {
						const ownerId = this.getNodeParameter('ownerId', i) as string;
						const fileId = this.getNodeParameter('fileId', i) as string;
						const uploadId = this.getNodeParameter('uploadId', i) as string;
						const partList = this.getNodeParameter('partList', i) as string;
						const fileType = this.getNodeParameter('fileTypeComplete', i) as string;
						const fileMd5 = this.getNodeParameter('fileMd5', i) as string;
						const fileName = this.getNodeParameter('fileName', i) as string;

						responseData = await plaudApiRequest.call(
							this,
							'POST',
							'/api/files/upload-s3/complete-upload',
							{
								owner_id: ownerId,
								file_id: fileId,
								upload_id: uploadId,
								part_list: JSON.parse(partList),
								filetype: fileType,
								file_md5: fileMd5,
								name: fileName,
							},
						);
					} else {
						throw new NodeApiError(this.getNode(), {
							message: `Unknown operation: ${operation}`,
						});
					}
				} else if (resource === 'workflow') {
					if (operation === 'getResult') {
						const workflowId = this.getNodeParameter('workflowId', i) as string;
						responseData = await plaudApiRequest.call(
							this,
							'GET',
							`/api/workflows/${workflowId}/result`,
						);
					} else if (operation === 'getStatus') {
						const workflowId = this.getNodeParameter('workflowId', i) as string;
						responseData = await plaudApiRequest.call(
							this,
							'GET',
							`/api/workflows/${workflowId}/status`,
						);
					} else if (operation === 'submit') {
						const workflows = this.getNodeParameter('workflows', i) as string;
						const options = this.getNodeParameter('options', i) as IDataObject;

						const body: IDataObject = {
							workflows: JSON.parse(workflows),
						};

						if (options.metadata) {
							body.metadata = JSON.parse(options.metadata as string);
						}
						if (options.version) {
							body.version = options.version;
						}

						responseData = await plaudApiRequest.call(this, 'POST', '/api/workflows/submit', body);
					} else {
						throw new NodeApiError(this.getNode(), {
							message: `Unknown operation: ${operation}`,
						});
					}
				} else {
					throw new NodeApiError(this.getNode(), {
						message: `Unknown resource: ${resource}`,
					});
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const errorMessage = error instanceof Error ? error.message : String(error);
					const executionErrorData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: errorMessage }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionErrorData);
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}

async function plaudApiRequest(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: IDataObject,
): Promise<IDataObject | IDataObject[]> {
	const credentials = await this.getCredentials('plaudApi');

	// First, get an API token
	const authString = Buffer.from(
		`${credentials.clientId}:${credentials.secretKey}`,
	).toString('base64');

	const tokenResponse = await this.helpers.httpRequest({
		method: 'POST',
		url: 'https://platform.plaud.ai/api/oauth/api-token',
		headers: {
			Authorization: `Bearer ${authString}`,
			'Content-Type': 'application/json',
		},
		json: true,
	});

	const apiToken = tokenResponse.api_token;

	// Now make the actual API request with the token
	const options: IHttpRequestOptions = {
		method,
		url: `https://platform.plaud.ai${endpoint}`,
		headers: {
			Authorization: `Bearer ${apiToken}`,
			'Content-Type': 'application/json',
		},
		json: true,
	};

	if (body && Object.keys(body).length > 0) {
		options.body = body;
	}

	return this.helpers.httpRequest(options);
}
