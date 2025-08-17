import os
import time
from PIL import Image
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.layers import *
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, Callback, LearningRateScheduler
from sklearn.utils.class_weight import compute_class_weight

# mount drive - always forget this step lol
from google.colab import drive
drive.mount('/content/drive')

# my dataset paths
base_path = "/content/drive/MyDrive/dataset"
train_path = f"{base_path}/train"
validation_path = f"{base_path}/val"  
test_path = f"{base_path}/test"

save_path = "/content/drive/MyDrive/results"
if not os.path.exists(save_path):
    os.makedirs(save_path)

# quick function to check if image is corrupted
def check_img(img_path):
    try:
        img = Image.open(img_path)
        img.convert('RGB').load()
        return True
    except:
        print(f"Bad image found: {img_path}")
        return False

# clean up corrupted images - learned this the hard way
def cleanup_folder(folder_path):
    count = 0
    for root, dirs, files in os.walk(folder_path):
        for file in files:
            full_path = os.path.join(root, file)
            if not check_img(full_path):
                os.remove(full_path)
                count += 1
    print(f"Cleaned up {count} bad images from {folder_path}")

# run cleanup on all folders
cleanup_folder(train_path)
cleanup_folder(validation_path) 
cleanup_folder(test_path)

# config stuff
img_size = (224, 224)
batch_sz = 32
n_classes = 5
max_epochs = 10

# data generators with augmentation
train_datagen = ImageDataGenerator(
    preprocessing_function=tf.keras.applications.efficientnet.preprocess_input,
    rotation_range=15,
    width_shift_range=0.1,
    height_shift_range=0.1,
    zoom_range=0.1,
    horizontal_flip=True,
    fill_mode='nearest'
)

val_datagen = ImageDataGenerator(
    preprocessing_function=tf.keras.applications.efficientnet.preprocess_input
)

train_data = train_datagen.flow_from_directory(
    train_path, 
    target_size=img_size, 
    batch_size=batch_sz, 
    class_mode='categorical'
)

val_data = val_datagen.flow_from_directory(
    validation_path, 
    target_size=img_size, 
    batch_size=batch_sz, 
    class_mode='categorical'
)

test_data = val_datagen.flow_from_directory(
    test_path, 
    target_size=img_size, 
    batch_size=batch_sz, 
    class_mode='categorical', 
    shuffle=False
)

# handle class imbalance
class_weights_array = compute_class_weight(
    'balanced',
    classes=np.unique(train_data.classes),
    y=train_data.classes
)
class_weight_dict = dict(enumerate(class_weights_array))

# custom callback for timing - helps me track training speed
class TrainingTimer(Callback):
    def on_epoch_begin(self, epoch, logs=None):
        self.epoch_start = time.time()
    
    def on_epoch_end(self, epoch, logs=None):
        elapsed = time.time() - self.epoch_start
        logs = logs or {}
        print(f"Epoch {epoch+1} took {elapsed:.1f}s - "
              f"loss: {logs.get('loss', 0):.4f} "
              f"acc: {logs.get('accuracy', 0):.4f} "
              f"val_loss: {logs.get('val_loss', 0):.4f} "
              f"val_acc: {logs.get('val_accuracy', 0):.4f}")

# learning rate decay - found this works better than default
def lr_decay(epoch, lr):
    if epoch > 0 and epoch % 5 == 0:
        return lr * 0.7
    return lr

# callbacks setup
early_stopping = EarlyStopping(
    monitor='val_loss', 
    patience=8, 
    restore_best_weights=True
)
model_checkpoint = ModelCheckpoint(
    f"{save_path}/best_model.keras", 
    save_best_only=True
)
lr_schedule = LearningRateScheduler(lr_decay)
timer_callback = TrainingTimer()

# squeeze and excitation block - adds attention mechanism
def se_attention(input_tensor, ratio=16):
    channel_axis = -1
    channels = input_tensor.shape[channel_axis]
    
    se_shape = (1, 1, channels)
    
    se = GlobalAveragePooling2D()(input_tensor)
    se = Reshape(se_shape)(se)
    se = Dense(channels // ratio, activation='relu', use_bias=False)(se)
    se = Dense(channels, activation='sigmoid', use_bias=False)(se)
    
    return multiply([input_tensor, se])

# build the model
input_layer = Input(shape=(224, 224, 3))

# use efficientnet as backbone
backbone = EfficientNetB0(
    weights='imagenet', 
    include_top=False, 
    input_tensor=input_layer
)

# unfreeze last 30 layers for fine-tuning
for layer in backbone.layers[:-30]:
    layer.trainable = False

# add custom head
x = backbone.output
x = se_attention(x)  # add attention
x = Dropout(0.3)(x)
x = GlobalAveragePooling2D()(x)
x = Dense(256, activation='relu', kernel_regularizer=tf.keras.regularizers.l2(0.001))(x)
x = BatchNormalization()(x)
x = Dropout(0.5)(x)
predictions = Dense(n_classes, activation='softmax', dtype='float32')(x)

model = Model(inputs=input_layer, outputs=predictions)

# compile with label smoothing - helps with overfitting
model.compile(
    optimizer=Adam(learning_rate=0.001),
    loss=tf.keras.losses.CategoricalCrossentropy(label_smoothing=0.1),
    metrics=['accuracy']
)

# train the model
print("Starting training...")
training_history = model.fit(
    train_data,
    validation_data=val_data,
    epochs=max_epochs,
    callbacks=[early_stopping, model_checkpoint, lr_schedule, timer_callback],
    class_weight=class_weight_dict
)

# convert to tflite for mobile deployment
converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()

tflite_file = f"{save_path}/waste_classifier.tflite"
with open(tflite_file, "wb") as f:
    f.write(tflite_model)

print(f"Model saved as TFLite: {tflite_file}")
