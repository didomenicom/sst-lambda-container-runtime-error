import os
import json
import boto3
import tempfile
from ultralytics import YOLO
from ksuid import ksuid

DYNAMODB_CLIENT =  boto3.client('dynamodb')
S3_CLIENT =  boto3.client('s3')

def handler(event, lambda_context) -> None:
	print("Hello World")

	model = YOLO("yolov8n.pt")

	results = model("https://ultralytics.com/images/bus.jpg")  # predict on an image
	print("Results")
