# RecyclAI Project

## Project Description

RecyclAI is a full-stack waste classification app built using React (TSX) for the frontend and Python Flask for the backend. It leverages a custom-trained CNN model to classify waste items into five categories: Recyclable, Non-Recyclable, Organic, E-Waste, and a unique Store Drop-Off class for LDPE plastics like bags and film. The model is optimized with TensorFlow Lite for close to real-time inference, achieving over 95% accuracy on common household waste. RecyclAI reduces recycling contamination and helps users make informed, sustainable disposal choices through an intuitive interface and low-latency performance.

## Project Goals

- Enable users to accurately classify waste into five distinct categories—Recyclable, Non-Recyclable, Organic, E-Waste, and Store Drop-Off—using real-time AI image recognition, with a target classification accuracy of ≥99% on household materials.

- Minimize the rate of incorrectly sorted items entering municipal recycling streams by identifying non-recyclables and LDPE plastics that require special handling, ultimately supporting cleaner, more efficient material recovery processes.

- Build a responsive, low-latency web and mobile application using React (TSX) and Flask, integrated with a TensorFlow Lite backend, capable of running AI inference locally or via cloud API to serve both consumers and municipalities at scale.

## Technologies and Materials Used

1. Frontend
 - React (TSX) – Type-safe UI framework for scalable, component-based development
 - Tailwind CSS – Utility-first styling for responsive, accessible UI
 - Fetch API – Native JavaScript method for handling asynchronous REST calls between client and server.

2. Backend
 - Python Flask – Lightweight WSGI-based web framework powering the REST API
 - Flask-CORS – Enables secure cross-origin requests from your frontend at recycl-ai.com
 - TensorFlow Lite (TFLite) – Executes a pre-trained 5-class CNN model for low-latency inference
 - NumPy – Handles tensor manipulation, prediction arrays, and model input formatting
 - Pillow (PIL) – Decodes and processes uploaded image files for model input
 - EfficientNet Preprocessing – Matches training-time normalization for CNN input consistency

3. Cloud and Hosting
 - AWS EC2 – Hosting Flask backend and deploying TFLite inference pipeline
 - Netlify - Hosting frontend web app with CI/CD pipeline

4. Machine Learning / Model Development
 - Custom Convolutional Neural Network (CNN) – Trained on labeled dataset of 5 waste categories
 - TensorFlow/Keras – Model architecture, training, and TFLite conversion
 - Google Colab / Jupyter Notebook – Model experimentation, prototyping, and data visualization

## How It Works

1. Step 1: User Uses Camera to capture image
 - User accesses the React-based app via web or mobile.
 - Takes a live photo of the waste item.
 - Frontend ensures image format and resolution are valid before submission.

2. Image Sent to Backend APIThe CNN model identifies patterns and features unique to each type of waste, making it capable of classifying new images accurately.
 - The image is sent to the Python Flask backend via a secure API call (POST /classify).
 - Flask processes the image (resizing, normalization, etc.) and prepares it for model inference.

3. TensorFlow Lite Model Runs Inference
 - The Flask server loads the TFLite CNN model, optimized for fast, lightweight predictions.
 - The model classifies the item into one of five classes:
    - ♻️ Recyclable
    - 🚫 Non-Recyclable
    - 🌿 Organic
    - 💻 E-Waste
    - 🛍️ Store Drop-Off (LDPE plastic)

4. Prediction Returned to Frontend
 - The backend returns the predicted class.
 - Backend may log anonymized prediction data for future model improvement.

6. User Sees Feedback + Sorting Guidance
 - The React frontend displays:
    - Predicted category
    - Sorting instructions (e.g., “Place this in your recycling bin,” or “Drop off at retail store”)
 - User receives visual confirmation and learns correct disposal methods

## Future Work

1. Mobile App Deployment (iOS/Android)
 - Port RecyclAI to native mobile platforms using React Native or Flutter, enabling broader access to real-time waste classification on-the-go. Integrate TensorFlow Lite for on-device inference without internet dependency.

2. Reinforcement Learning with User Feedback
 - Implement a feedback loop where users can correct model predictions, storing verified inputs to retrain and fine-tune the CNN over time. This will improve accuracy on ambiguous or rare waste types (e.g., black plastics, mixed materials).

3. Localization & Global Material Support
 - Expand training data and label taxonomy to support regional recycling standards (e.g., EU vs. US vs. India). Integrate support for multilingual interfaces and region-specific sorting instructions.

