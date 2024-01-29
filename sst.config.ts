import type { SSTConfig } from 'sst';
import { Function, StackContext } from 'sst/constructs';

export default {
	config(input) {
		return {
			name: 'sample',
			region: 'us-east-1',
		};
	},
	async stacks(app) {
		app.stack(
			function SampleStack({ stack, app }: StackContext) {
				new Function(stack, 'container-lambda', {
					functionName: 'sst-lambda-container-runtime-error-lambda',
					runtime: 'container',
					tracing: 'disabled',
					handler: 'services/container-lambda/',
					timeout: 45,
					environment: {
						// None
					},
					layers: [
						// None
					],
					permissions: [
						// None
					],
					container: { file: 'Dockerfile' },
				});
			},
			{ id: 'sample-stack' }
		);
	},
} satisfies SSTConfig;
