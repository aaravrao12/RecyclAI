import numpy as np
import tensorflow as tf
from tensorflow.keras.applications.efficientnet import preprocess_input
from PIL import Image
import io
import os
from flask_cors import CORS
from flask import Flask, request, jsonify
from werkzeug.middleware.proxy_fix import ProxyFix

# TODO: maybe add logging later instead of print statements
# import logging

app = Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)

# CORS setup - had to figure this out the hard way when frontend kept getting blocked
# spent like 2 hours debugging CORS issues before I found the right config
CORS(app, supports_credentials=True, origins=["https://www.recycl-ai.com"])

# these are the classes from my training - order matters!
labels = ['EWaste', 'NonRecyclable', 'Organic', 'Recyclable', 'StoreDropOff']

# load the model - took forever to get this working with tflite
# note: make sure the model file is in the same directory
MODEL_PATH = 'waste_classifier_se.tflite'
print(f"Loading model from: {MODEL_PATH}")

# sometimes the model loading fails for weird reasons, so wrap in try-catch
try:
    interpreter = tf.lite.Interpreter(model_path=MODEL_PATH)
    interpreter.allocate_tensors()
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    print("Model loaded successfully!")
    print(f"Input shape: {input_details[0]['shape']}")
    # print(f"Output shape: {output_details[0]['shape']}")  # don't really need this
except Exception as e:
    print(f"Failed to load model: {e}")
    # probably should exit here but whatever, let it crash later if needed
    
def prep_image(img_bytes):
    """
    Process the image for the model
    This function gave me so many headaches during development lol
    """
    try:
        # open and convert to RGB - some images come in weird formats
        img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
        orig_size = img.size  # keeping track just in case
        # print(f"Original size: {orig_size}")  # debug line I sometimes uncomment
        
        # resize to what the model expects (224x224)
        img = img.resize((224, 224))
        
        # convert to numpy array
        img_arr = np.array(img).astype(np.float32)
        img_arr = np.expand_dims(img_arr, axis=0)  # add batch dim
        
        # use the same preprocessing as training - this is important!
        img_arr = preprocess_input(img_arr)
        
        # dtype check - learned this the hard way when model started throwing errors
        expected_dtype = input_details[0]['dtype']
        if img_arr.dtype != expected_dtype:
            img_arr = img_arr.astype(expected_dtype)
            # print(f"Converted dtype from {img_arr.dtype} to {expected_dtype}")
            
        return img_arr
        
    except Exception as e:
        print(f"Error processing image: {e}")
        raise  # let the caller handle it

@app.route('/predict', methods=['POST'])
def predict():
    print("Got a prediction request")
    
    # check if image was uploaded
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    file = request.files['image']
    
    # basic validation - empty filename check
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # quick file size check - don't want huge files crashing the server
    file.seek(0, 2)  # seek to end
    file_size = file.tell()
    file.seek(0)  # reset to beginning
    
    if file_size > 10 * 1024 * 1024:  # 10MB limit
        return jsonify({'error': 'File too large (max 10MB)'}), 400
    
    try:
        # read the image data
        img_data = file.read()
        print(f"Processing: {file.filename} ({len(img_data)} bytes)")
        
        # preprocess for model
        processed_img = prep_image(img_data)
        
        # run inference - this is where the magic happens
        interpreter.set_tensor(input_details[0]['index'], processed_img)
        interpreter.invoke()
        
        # get results
        output = interpreter.get_tensor(output_details[0]['index'])
        pred_idx = np.argmax(output[0])
        confidence = float(output[0][pred_idx])
        predicted_class = labels[pred_idx]
        
        print(f"Prediction: {predicted_class} (confidence: {confidence:.3f})")
        
        # return results
        result = {
            'label': predicted_class,
            'confidence': confidence
        }
        
        # add all class probabilities if confidence is low (might be useful for debugging)
        if confidence < 0.8:
            all_probs = {labels[i]: float(output[0][i]) for i in range(len(labels))}
            result['all_probabilities'] = all_probs
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Prediction failed: {e}")
        # TODO: maybe log this to a file for debugging
        return jsonify({'error': 'Failed to process image'}), 500

# health check endpoint - useful for deployment
@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'model_loaded': 'interpreter' in globals()})

# simple test endpoint for debugging
@app.route('/test', methods=['GET'])
def test():
    return jsonify({'message': 'API is working!'})

if __name__ == '__main__':
    print("Starting the API server...")
    print("Visit http://localhost:5000/health to check if it's working")
    # bind to all interfaces so it works in containers and remote access
    app.run(host='0.0.0.0', port=5000, debug=True)
    # debug=True is great for development but remember to turn off in production!
