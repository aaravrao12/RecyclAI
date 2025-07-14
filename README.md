# RecyclAI Project

## Project Description

RecyclAI is a full-stack waste classification app built using React (TSX) for the frontend and Python Flask for the backend. It leverages a custom-trained CNN model to classify waste items into five categories: Recyclable, Non-Recyclable, Organic, E-Waste, and a unique Store Drop-Off class for LDPE plastics like bags and film. The model is optimized with TensorFlow Lite for close to real-time inference, achieving over 95% accuracy on common household waste. RecyclAI reduces recycling contamination and helps users make informed, sustainable disposal choices through an intuitive interface and low-latency performance.

## Project Goals

- Enable users to accurately classify waste into five distinct categories—Recyclable, Non-Recyclable, Organic, E-Waste, and Store Drop-Off—using real-time AI image recognition, with a target classification accuracy of ≥99% on household materials.

- Minimize the rate of incorrectly sorted items entering municipal recycling streams by identifying non-recyclables and LDPE plastics that require special handling, ultimately supporting cleaner, more efficient material recovery processes.

- Build a responsive, low-latency web and mobile application using React (TSX) and Flask, integrated with a TensorFlow Lite backend, capable of running AI inference locally or via cloud API to serve both consumers and municipalities at scale.

## How It Works

1. Step 1: User Uses Camera to capture image
 - User accesses the React-based app via web or mobile.
 - Takes a live photo of the waste item.
 - Frontend ensures image format and resolution are valid before submission.

2. Image Sent to Backend APIThe CNN model identifies patterns and features unique to each type of waste, making it capable of classifying new images accurately.
 - The image is sent to the Python Flask backend via a secure API call (POST /classify).
 - 
3. Google Cloud Vision API Integration: To enhance model performance, the system uses the Google Cloud Vision API to detect object labels in images. The detected labels help refine classification, complementing the CNN’s predictions.

4. Real-Time Image Capture: The project also includes a webcam-based image capture system, allowing users to take images of waste items and analyze them instantly. The system listens for user input (e.g., pressing the spacebar) to trigger image capture and classification.

5. Output and Recommendations: After classification, the system provides output indicating whether the item is recyclable, non-recyclable, or contaminated. This output can be used in various applications, such as in smart bins or recycling facility sorting mechanisms, to direct the item to the appropriate processing stream.

## Future Work

To enhance the model’s performance and applicability, future improvements could include:

- Deploying in Real-World Applications: Testing the classifier in real-world environments, such as at a recycling facility, to evaluate and refine its performance.

- Creating a Smart Bin: Developing a smart bin that would automatically separate materials into three sections. The bin would integrate this model with a sensor to perform real-time classification and sorting of waste items.

