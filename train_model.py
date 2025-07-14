import os
import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt
import time
from PIL import Image
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.layers import (
    Input, Dropout, GlobalAveragePooling2D, Dense, BatchNormalization,
    Reshape, multiply
)
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, Callback, LearningRateScheduler
from tensorflow.keras.regularizers import l2
from sklearn.utils.class_weight import compute_class_weight

# --- Paths: Mount Google Drive or upload dataset ---
from google.colab import drive
drive.mount('/content/drive')

# Update these paths to your Google Drive dataset folders
base_dir = "/content/drive/MyDrive/dataset"
train_dir = os.path.join(base_dir, "train")
val_dir = os.path.join(base_dir, "val")
test_dir = os.path.join(base_dir, "test")

results_dir = "/content/drive/MyDrive/results"
os.makedirs(results_dir, exist_ok=True)

# --- Remove corrupt images ---
def is_image_corrupt(path):
    try:
        with Image.open(path) as img:
            img.convert('RGB')
            img.load()
        return False
    except Exception as e:
        print(f"{path} is corrupt or unsupported: {e}")
        return True

def clean_directory(root_dir):
    corrupt_count = 0
    for subdir, _, files in os.walk(root_dir):
        for file in files:
            file_path = os.path.join(subdir, file)
            if is_image_corrupt(file_path):
                print(f"Removing corrupt image: {file_path}")
                os.remove(file_path)
                corrupt_count += 1
    print(f"Done cleaning {root_dir}. {corrupt_count} corrupt images removed.")

clean_directory(train_dir)
clean_directory(val_dir)
clean_directory(test_dir)

# --- Parameters ---
img_size = (224, 224)
batch_size = 32
num_classes = 5
epochs = 10

# --- Data augmentation ---
datagen_train = ImageDataGenerator(
    preprocessing_function=tf.keras.applications.efficientnet.preprocess_input,
    rotation_range=25,
    width_shift_range=0.25,
    height_shift_range=0.25,
    zoom_range=0.15,
    brightness_range=[0.8, 1.2],
    shear_range=0.2,
    horizontal_flip=True,
    fill_mode='nearest'
)
datagen_val_test = ImageDataGenerator(
    preprocessing_function=tf.keras.applications.efficientnet.preprocess_input
)

# --- Load data ---
train_gen = datagen_train.flow_from_directory(
    train_dir, target_size=img_size, batch_size=batch_size, class_mode='categorical'
)
val_gen = datagen_val_test.flow_from_directory(
    val_dir, target_size=img_size, batch_size=batch_size, class_mode='categorical'
)
test_gen = datagen_val_test.flow_from_directory(
    test_dir, target_size=img_size, batch_size=batch_size, class_mode='categorical', shuffle=False
)

# --- Compute class weights ---
class_weights = compute_class_weight(
    class_weight='balanced',
    classes=np.unique(train_gen.classes),
    y=train_gen.classes
)
class_weights_dict = dict(enumerate(class_weights))

# --- Callbacks ---
def lr_scheduler(epoch, lr):
    return lr * 0.7 if epoch > 0 and epoch % 5 == 0 else lr

class CustomLoggingCallback(Callback):
    def on_epoch_begin(self, epoch, logs=None):
        self.epoch_start_time = time.time()

    def on_epoch_end(self, epoch, logs=None):
        duration = time.time() - self.epoch_start_time
        logs = logs or {}
        print(f"Epoch {epoch+1}/{self.params['epochs']} - {duration:.0f}s - "
              f"accuracy: {logs.get('accuracy', 0):.4f} - loss: {logs.get('loss', 0):.4f} - "
              f"val_accuracy: {logs.get('val_accuracy', 0):.4f} - val_loss: {logs.get('val_loss', 0):.4f}")

early_stopping = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)
model_checkpoint = ModelCheckpoint(os.path.join(results_dir, 'best_model.keras'), save_best_only=True, monitor='val_loss', mode='min')
lr_schedule = LearningRateScheduler(lr_scheduler)

# --- SE block ---
def se_block(input_tensor, reduction=16):
    channels = input_tensor.shape[-1]
    se = tf.keras.layers.GlobalAveragePooling2D()(input_tensor)
    se = Reshape((1, 1, channels))(se)
    se = Dense(channels // reduction, activation='relu', kernel_initializer='he_normal', use_bias=False)(se)
    se = Dense(channels, activation='sigmoid', kernel_initializer='he_normal', use_bias=False)(se)
    x = multiply([input_tensor, se])
    return x

# --- Model definition ---
input_tensor = Input(shape=(224, 224, 3))
base_model = EfficientNetB0(weights='imagenet', include_top=False, input_tensor=input_tensor)
for layer in base_model.layers[:-30]:
    layer.trainable = False

x = base_model.output
x = se_block(x)
x = Dropout(0.3)(x)
x = GlobalAveragePooling2D()(x)
x = Dense(256, activation='relu', kernel_regularizer=l2(0.001))(x)
x = BatchNormalization()(x)
x = Dropout(0.5)(x)
output = Dense(num_classes, activation='softmax', dtype='float32')(x)

model = Model(inputs=base_model.input, outputs=output)

model.compile(
    optimizer=Adam(learning_rate=0.001),
    loss=tf.keras.losses.CategoricalCrossentropy(label_smoothing=0.1),
    metrics=['accuracy']
)

# --- Train ---
history = model.fit(
    train_gen,
    validation_data=val_gen,
    epochs=epochs,
    callbacks=[early_stopping, model_checkpoint, lr_schedule, CustomLoggingCallback()],
    class_weight=class_weights_dict
)

# --- Convert to TFLite ---
converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()

tflite_model_path = os.path.join(results_dir, "waste_classifier_se.tflite")
with open(tflite_model_path, "wb") as f:
    f.write(tflite_model)

print(f"TFLite model saved to: {tflite_model_path}")
