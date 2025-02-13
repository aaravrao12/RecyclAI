const NodeWebcam = require('node-webcam');  // Node webcam for capturing images
const fs = require('fs');
const vision = require('@google-cloud/vision');
const readline = require('readline');

// Set up Google Cloud Vision API client
const client = new vision.ImageAnnotatorClient({
  keyFilename: 'C:/Users/Guru/OneDrive/Desktop/google-cloud-vision-api/smart-bin-449901-4b882009aee4.json'
});

// Define recyclable and non-recyclable labels
const recyclableItems = [
  'plastic bottle', 'glass bottle', 'aluminum can', 'cardboard', 'paper', 'tin can', 'mason jar'
];
const nonRecyclableItems = [
  'food waste', 'styrofoam', 'plastic bag', 'ceramic', 'contaminated paper', 'waxed paper'
];

// Webcam setup
const opts = {
  width: 1280,
  height: 720,
  quality: 100,
  delay: 0,  // no delay
  saveShots: true,  // automatically save images
  output: "jpeg",  // or png
  device: false,    // false will use the first available webcam
  callbackReturn: "base64"  // returns the captured image as a base64 string
};

// Create webcam instance
const Webcam = NodeWebcam.create(opts);
const imagePath = 'captured_image.jpg';

// Function to capture an image
async function captureImage() {
  Webcam.capture(imagePath, async function (err, data) {
    if (err) {
      console.error('Error capturing image:', err);
      return;
    }
    
    console.log('Image captured!');
    await analyzeImage(imagePath);  // Process image for recyclability
  });
}

// Function to analyze an image
async function analyzeImage(imagePath) {
  try {
    // Perform label detection
    const [result] = await client.labelDetection(imagePath);
    const labels = result.labelAnnotations.map(label => label.description.toLowerCase());

    console.log('Detected labels:', labels);

    // Check if any detected label is in the recyclable list
    const isRecyclable = labels.some(label => recyclableItems.includes(label));
    
    if (isRecyclable) {
      console.log('Recyclable');
    } else {
      console.log('Non-Recyclable');
    }

    // Optional: Delete captured image after processing
    fs.unlinkSync(imagePath);
  } catch (error) {
    console.error('Error analyzing image:', error);
  }
}

// Listen for keypress events
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
console.log("Press 'SPACE' to capture an image...");

process.stdin.on('keypress', (str, key) => {
  if (key.name === 'space') {
    captureImage();
  } else if (key.ctrl && key.name === 'c') {
    console.log('\nExiting...');
    process.exit();
  }
});