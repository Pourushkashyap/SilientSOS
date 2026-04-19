import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, GlobalAveragePooling2D, Dense, Dropout, BatchNormalization
from tensorflow.keras.callbacks import EarlyStopping
import os
def build_keyword_model(input_shape):
    model = Sequential([
        Conv2D(32, kernel_size=(3,3), activation='relu', input_shape=input_shape),
        BatchNormalization(),
        MaxPooling2D(pool_size=(2,2)),
        
        Conv2D(64, kernel_size=(3,3), activation='relu'),
        BatchNormalization(),
        MaxPooling2D(pool_size=(2,2)),

        Conv2D(128, kernel_size=(3,3), activation='relu'),
        BatchNormalization(),
        GlobalAveragePooling2D(),

        Dense(64, activation='relu'),
        Dropout(0.4),
        Dense(3, activation='softmax') # 12 keywords + background
    ])
    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    return model

if __name__ == '__main__':
    # Generating dummy mel spectrograms for keyword testing
    print("Generating dummy data for keyword CNN...")
   

    BASE_DIR = os.path.dirname(__file__)
    DATA_DIR = os.path.join(BASE_DIR, 'data')

    X_train = np.load(os.path.join(DATA_DIR, 'kw_X_train.npy'))
    X_test = np.load(os.path.join(DATA_DIR, 'kw_X_test.npy'))
    y_train = np.load(os.path.join(DATA_DIR, 'kw_y_train.npy'))
    y_test = np.load(os.path.join(DATA_DIR, 'kw_y_test.npy'))

    model = build_keyword_model((128, 128, 1))
    model.summary()

    early_stopping = EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)

    model.fit(X_train, y_train, validation_data=(X_test, y_test), epochs=20, batch_size=16, callbacks=[early_stopping])

    loss, acc = model.evaluate(X_test, y_test)
    print(f"Test Accuracy: {acc:.4f}")

    model.save(os.path.join(BASE_DIR, 'keyword_model.h5'))
    print("Saved keyword_model.h5")
