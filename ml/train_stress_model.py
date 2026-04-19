import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, Bidirectional, LSTM
from tensorflow.keras.callbacks import EarlyStopping
from sklearn.utils import class_weight
import os
def build_stress_model(input_shape):
    model = Sequential([
        Bidirectional(LSTM(128, return_sequences=True), input_shape=input_shape),
        Dropout(0.3),
        Bidirectional(LSTM(64)),
        Dropout(0.3),
        Dense(32, activation='relu'),
        Dense(2, activation='softmax') # calm, sad, angry, fearful
    ])
    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    return model

if __name__ == '__main__':
  

    BASE_DIR = os.path.dirname(__file__)
    DATA_DIR = os.path.join(BASE_DIR, 'data')

    X_train = np.load(os.path.join(DATA_DIR, 'X_train.npy'))
    X_test = np.load(os.path.join(DATA_DIR, 'X_test.npy'))
    y_train = np.load(os.path.join(DATA_DIR, 'y_train.npy'))
    y_test = np.load(os.path.join(DATA_DIR, 'y_test.npy'))
    # LSTM expects 3D input: (batch_size, timesteps, features)
    X_train = X_train.reshape(X_train.shape[0], 1, X_train.shape[1])
    X_test = X_test.reshape(X_test.shape[0], 1, X_test.shape[1])

    model = build_stress_model((X_train.shape[1], X_train.shape[2]))
    model.summary()

    early_stopping = EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)
    
    class_weights = class_weight.compute_class_weight(
    class_weight='balanced',
    classes=np.unique(y_train),
    y=y_train
    )

    class_weights = dict(enumerate(class_weights))

    model.fit(
    X_train, y_train,
    validation_data=(X_test, y_test),
    epochs=20,
    batch_size=32,
    callbacks=[early_stopping],
    class_weight=class_weights   # 👈 ADD THIS
    )

    loss, acc = model.evaluate(X_test, y_test)
    print(f"Test Accuracy: {acc:.4f}")

    model.save(os.path.join(BASE_DIR, 'stress_model.h5'))
    print("Saved stress_model.h5")
