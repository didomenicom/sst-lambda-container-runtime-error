# Start from AWS Python 3.8 base image
FROM public.ecr.aws/lambda/python:3.11.2023.11.18.02

# Install the dependencies
COPY requirements.txt .

RUN yum install -y \
	mesa-libGL \
	glib2 \
	gcc

RUN pip3 install -r requirements.txt --target "${LAMBDA_TASK_ROOT}"

# Copy our function code
COPY src/* ${LAMBDA_TASK_ROOT}/

# Set the handler function
CMD [ "main.handler" ]
