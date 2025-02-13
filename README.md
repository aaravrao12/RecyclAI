# Smart Bin Project

## Project Description

This project is a deep learning-based classifier designed to automatically sort recyclable and non-recyclable waste, with a specific focus on minimizing contamination. Built on a convolutional neural network (CNN) architecture, the classifier is trained to accurately differentiate between various waste types, classifying items into three main categories: recyclable, non-recyclable, and contaminated recyclables. By automating the sorting process, this classifier aims to improve the efficiency and accuracy of waste management systems, contributing to better recycling practices and reduced contamination rates in recycling facilities.

Additionally, this project integrates Google Cloud Vision API to assist in improving model performance by providing additional image recognition capabilities. While the API helps in refining classification, the core classification process is powered by a custom CNN model trained on waste images.

## Project Goals

- Reduce Contamination in Recyclables: Improperly sorted recyclables, often contaminated with food waste or non-recyclable materials, can spoil entire batches, making recycling efforts less efficient. This project aims to solve this problem by distinguishing contaminated recyclables from clean ones.

- Enhance Waste Sorting Efficiency: By accurately classifying waste items, this classifier can improve the speed and efficiency of waste sorting processes in recycling facilities and other waste management setups.

- Promote Environmentally Friendly Practices: Effective waste sorting is essential to the recycling process. By aiding the sorting process, this classifier encourages better resource management and a positive environmental impact.

## How It Works

1. Image Processing: The classifier uses images of waste items as input. Each item is scanned or photographed and then analyzed by the CNN model.

2. CNN-Based Classification: The deep learning model, based on a CNN architecture, has been trained on a dataset of images categorized into three classes: recyclable, non-recyclable, and contaminated recyclables. The CNN model identifies patterns and features unique to each type of waste, making it capable of classifying new images accurately.

3. Google Cloud Vision API Integration: To enhance model performance, the system uses the Google Cloud Vision API to detect object labels in images. The detected labels help refine classification, complementing the CNN’s predictions.

4. Real-Time Image Capture: The project also includes a webcam-based image capture system, allowing users to take images of waste items and analyze them instantly. The system listens for user input (e.g., pressing the spacebar) to trigger image capture and classification.

5. Output and Recommendations: After classification, the system provides output indicating whether the item is recyclable, non-recyclable, or contaminated. This output can be used in various applications, such as in smart bins or recycling facility sorting mechanisms, to direct the item to the appropriate processing stream.

## Future Work

To enhance the model’s performance and applicability, future improvements could include:

- Deploying in Real-World Applications: Testing the classifier in real-world environments, such as at a recycling facility, to evaluate and refine its performance.

- Creating a Smart Bin: Developing a smart bin that would automatically separate materials into three sections. The bin would integrate this model with a sensor to perform real-time classification and sorting of waste items.

