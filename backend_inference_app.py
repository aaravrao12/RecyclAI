import numpy as np
import tensorflow as tf
from tensorflow.keras.applications.efficientnet import preprocess_input
from PIL import Image
import io
import os
from flask_cors import CORS
from flask import Flask, request, jsonify
from werkzeug.middleware.proxy_fix import ProxyFix

app = Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)
CORS(app, supports_credentials=True, origins=["https://www.recycl-ai.com"])

Load labels exactly as in your script
labels = ['EWaste', 'NonRecyclable', 'Organic', 'Recyclable', 'StoreDropOff']

Load TFLite model
MODEL_PATH = 'FiveClassesChips.tflite'
print(f"[DEBUG] Loading TFLite model from: {MODEL_PATH}")
interpreter = tf.lite.Interpreter(model_path=MODEL_PATH)
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()
print(f"[DEBUG] Model input details: {input_details}")
print(f"[DEBUG] Model output details: {output_details}")

def preprocess_image(image_bytes):
   print("[DEBUG] Starting image preprocessing")
   try:
        Load image and convert to RGB
       image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
       print(f"[DEBUG] Original image size: {image}")

       print(f"[DEBUG] Original image size: {image.size}")
        Resize to model's expected input (224x224)
       image = image.resize((224, 224))
       print(f"[DEBUG] Resized image to: {image.size}")
       img_array = np.array(image).astype(np.float32)
       img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
       print(f"[DEBUG] Image array shape after expand_dims: {img_array.shape}")
        Use EfficientNet preprocess_input (matches your local code)
       img_array = preprocess_input(img_array)
       print(f"[DEBUG] Image array dtype before cast: {img_array.dtype}")
        Cast to expected dtype (probably float32)
       if input_details[0]['dtype'] != img_array.dtype:
           img_array = img_array.astype(input_details[0]['dtype'])
           print(f"[DEBUG] Casted image array to dtype: {input_details[0]['dtype']}")
       print("[DEBUG] Finished preprocessing image")
       return img_array
   except Exception as e:
       print(f"[ERROR] Exception in preprocess_image: {e}")
       raise

@app.route('/predict', methods=['POST'])
def predict():
   print("=== Request received at /predict ===")
   print(f"[DEBUG] Request method: {request.method}")
   print(f"[DEBUG] Request headers: {request.headers}")
   print(f"[DEBUG] Request content type: {request.content_type}")
   print(f"[DEBUG] Request form data: {request.form}")
   print(f"[DEBUG] Request files keys: {list(request.files.keys())}")

   if 'image' not in request.files:
       print('[ERROR] No image file found in request.files')
       print(f"[DEBUG] request.files contents: {request.files}")
       return jsonify({'error': 'No image file provided'}), 400

   file = request.files['image']
   print(f"[DEBUG] Received file: filename={file.filename}, content_type={file.content_type}, size={len(file.read())}>
    Reset file read pointer after reading for size
   file.seek(0)

   try:
       image_bytes = file.read()
       print(f"[DEBUG] Read image bytes, length: {len(image_bytes)}")

        Directly save the image in the current directory
        print(f"[DEBUG] Image saved to: {save_path}")
       print(f"[DEBUG] Read image bytes, length: {len(image_bytes)}")

       print(f"[DEBUG] Read image bytes, length: {len(image_bytes)}")
       input_data = preprocess_image(image_bytes)
       print("[DEBUG] Setting tensor input for model")
       interpreter.set_tensor(input_details[0]['index'], input_data)
       print("[DEBUG] Invoking the interpreter")
       interpreter.invoke()

       output_data = interpreter.get_tensor(output_details[0]['index'])
       print(f"[DEBUG] Raw output data: {output_data}")
       pred_index = np.argmax(output_data[0])
       pred_label = labels[pred_index]
       pred_confidence = float(output_data[0][pred_index])
       print(f"[DEBUG] Prediction: {pred_label} ({pred_confidence*100:.2f}%)")

       response = {
           'label': pred_label,
           'confidence': pred_confidence
       }
       print(f"[DEBUG] Sending JSON response: {response}")
       return jsonify(response)

   except Exception as e:
       print(f"[ERROR] Error during prediction: {e}")
       return jsonify({'error': 'Failed to process image or predict'}), 500

if __name__ == '__main__':
   print("[DEBUG] Starting Flask app on 0.0.0.0:5000")
   app.run(host='0.0.0.0', port=5000, debug=True)
