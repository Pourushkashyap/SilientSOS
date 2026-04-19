import os
import numpy as np
import librosa
from sklearn.model_selection import train_test_split

DATA_PATH = "./ml/data/speech_commands"

labels_map = {
    "no": 0,
    "yes": 1,
    "go": 2
}

def extract_features(file_path):
    y, sr = librosa.load(file_path, duration=1.0)
    spec = librosa.feature.melspectrogram(y=y, sr=sr)
    spec = librosa.power_to_db(spec)
    spec = np.resize(spec, (128, 128))
    return spec

X, y = [], []

for label in labels_map:
    folder = os.path.join(DATA_PATH, label)
    for file in os.listdir(folder):
        if file.endswith(".wav"):
            path = os.path.join(folder, file)
            X.append(extract_features(path))
            y.append(labels_map[label])

X = np.array(X).reshape(-1, 128, 128, 1)
y = np.array(y)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

BASE_DIR = os.path.dirname(__file__)
SAVE_DIR = os.path.join(BASE_DIR, 'data')
os.makedirs(SAVE_DIR, exist_ok=True)

np.save(os.path.join(SAVE_DIR, "kw_X_train.npy"), X_train)
np.save(os.path.join(SAVE_DIR, "kw_X_test.npy"), X_test)
np.save(os.path.join(SAVE_DIR, "kw_y_train.npy"), y_train)
np.save(os.path.join(SAVE_DIR, "kw_y_test.npy"), y_test)

print("✅ Keyword data ready")