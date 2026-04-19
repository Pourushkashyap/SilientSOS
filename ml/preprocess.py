import os
import librosa
import numpy as np
from sklearn.model_selection import train_test_split

# Label Mapping: calm=0, happy=0, sad=1, angry=2, fearful=3, disgust=2, surprised=1
def get_label(file_name):
    emotion = int(file_name.split('-')[2])
    if emotion in [5, 6, 7]:
        return 1  # danger
    else:
        return 0  # normal

def extract_features(file_path):
    y, sr = librosa.load(file_path, sr=16000)
    
    mfcc = np.mean(librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40).T, axis=0)
    
    # Pitch (fundamental frequency)
    pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
    pitch = np.mean(pitches[pitches > 0]) if np.any(pitches > 0) else 0

    zcr = np.mean(librosa.feature.zero_crossing_rate(y).T, axis=0)[0]
    energy = np.mean(librosa.feature.rms(y=y).T, axis=0)[0]

    feature_vector = np.hstack([mfcc, pitch, zcr, energy])
    return feature_vector

def preprocess_data():
    features = []
    labels = []
    data_dir = os.path.join(os.path.dirname(__file__), 'data', 'ravdess')
    
    # Mock behavior if directory doesn't exist to allow code to compile mapping
    if not os.path.exists(data_dir):
         raise Exception("❌ Dataset not found! Check path")

    for actor_dir in os.listdir(data_dir):
        actor_path = os.path.join(data_dir, actor_dir)
        if not os.path.isdir(actor_path): continue
        for file_name in os.listdir(actor_path):
            if file_name.endswith('.wav'):
                file_path = os.path.join(actor_path, file_name)
                features.append(extract_features(file_path))
                labels.append(get_label(file_name))
                
    X = np.array(features)
    y = np.array(labels)
    
    return train_test_split(X, y, test_size=0.2, random_state=42)

def generate_dummy_data():
    X = np.random.rand(100, 43)
    y = np.random.choice([0, 1, 2, 3], size=100)
    return train_test_split(X, y, test_size=0.2)

if __name__ == '__main__':
    X_train, X_test, y_train, y_test = preprocess_data()
    print(f"X_train shape: {X_train.shape}")
    print(f"Class distribution: {np.bincount(y_train)}")
    
    # Save processed feature vectors
   # 📁 Save inside data folder
BASE_DIR = os.path.dirname(__file__)
SAVE_DIR = os.path.join(BASE_DIR, 'data')

# create folder if not exists
os.makedirs(SAVE_DIR, exist_ok=True)

np.save(os.path.join(SAVE_DIR, 'X_train.npy'), X_train)
np.save(os.path.join(SAVE_DIR, 'X_test.npy'), X_test)
np.save(os.path.join(SAVE_DIR, 'y_train.npy'), y_train)
np.save(os.path.join(SAVE_DIR, 'y_test.npy'), y_test)

print(f"✅ Saved in: {SAVE_DIR}")
print("Preprocessing complete!")
