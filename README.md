# SST Lambda Container Runtime Error

This repo is to reproduce the runtime error posted in the [SST Discord](https://discord.com/channels/983865673656705025/1181622220263522355/1181622220263522355)

To test this repo, run `pnpm i` and then `pnpm run deploy-aws`

You may need to set the `AWS_*` environment variables

```sh
export AWS_ACCESS_KEY_ID=<value>
export AWS_SECRET_ACCESS_KEY=<value>
```

## Error description

The error is

```txt
INIT_REPORT Init Duration: 45045.46 ms    Phase: invoke    Status: error    Error Type: Runtime.Unknown
```

This is happening when I deploy from my M1 Macbook using the `sst deploy --stage dev --region us-east-1` command (SST v2.36.7). It is consistently inconsistent on when I hit the error as sometime running the deploy command it works perfectly (without any changes) and sometimes it fails with the Runtime.Unknown error. I have also seen this happening from gitlab CICD worker.

My dockerfile looks like

```dockerfile
# Start from AWS Python 3.11 base image
FROM public.ecr.aws/lambda/python:3.11

# Install the dependencies
COPY requirements.txt .

RUN yum install -y \
    mesa-libGL \
    glib2 \
    gcc

RUN pip3 install -r requirements.txt --target "${LAMBDA_TASK_ROOT}"

# Copy our function code
COPY src/* ${LAMBDA_TASK_ROOT}

# Set the handler function
CMD [ "main.handler" ]
```

Which is similar to [this dockerfile](https://discord.com/channels/983865673656705025/1181622220263522355/1181622220263522355) in [this thread](https://discord.com/channels/983865673656705025/1181622220263522355/1181622220263522355) about the same issue.

The stack definition looks like

```ts
import { Function } from 'sst/constructs';
...
new Function(stack, 'python-11-func', {
    runtime: 'container',
    handler: 'python/lambda/',
    timeout: 45,
    permissions: [
        // PolicyStatements here...
    ],
    container: { file: 'Dockerfile' },
})
```

## Testing/Debugging Notes

1. I was not able to reproduce the issue until I added the following code to the handler method from the [Ultralytics Github example](https://github.com/ultralytics/ultralytics?tab=readme-ov-file#python)

```python
model = YOLO("yolov8n.pt")

results = model("https://ultralytics.com/images/bus.jpg")  # predict on an image
print("Results")
```

A simple "Hello World" did not cause the runtime error

2. When I got the error reproduced in this repo, the lambda response was

```txt
INIT_REPORT Init Duration: 10337.01 ms	Phase: init	Status: timeout
[WARNING]	2024-01-29T16:40:40.116Z		Matplotlib created a temporary cache directory at /tmp/matplotlib-gezy8jcr because the default path (/home/sbx_user1051/.config/matplotlib) is not a writable directory; it is highly recommended to set the MPLCONFIGDIR environment variable to a writable directory, in particular to speed up the import of Matplotlib and to better support multiprocessing.
INIT_REPORT Init Duration: 45045.69 ms	Phase: invoke	Status: error	Error Type: Runtime.Unknown
START RequestId: <guid> Version: $LATEST
2024-01-29T16:41:15.998Z <guid> Task timed out after 45.05 seconds

END RequestId: <guid>
REPORT RequestId: <guid>	Duration: 45054.87 ms	Billed Duration: 45000 ms	Memory Size: 1024 MB	Max Memory Used: 278 MB
```

3. If the same container is deployed more than once, the problem usually goes away. I.e. on the second deploy. I have seen rare cases where this could take redeploying 3-5 times for the problem to go away

4. When the function actually runs, I do not expect it to be successful. The function should fail with downloading the `yolov8n.pt` file from github.
