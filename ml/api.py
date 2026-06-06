from flask import Flask, request, jsonify
import numpy as np
from tensorflow.keras.models import load_model
import librosa
import tempfile
import os
import shutil

app = Flask(__name__)

model = load_model("ml/stress_model.h5")

def convert_to_wav(input_path):
    output_path = input_path + "_converted.wav"
    
    # Method 1: try ffmpeg command directly
    ffmpeg_cmd = shutil.which("ffmpeg")
    
    if ffmpeg_cmd:
        import subprocess
        try:
            subprocess.run([
                ffmpeg_cmd, "-y",
                "-i", input_path,
                "-ar", "16000",
                "-ac", "1",
                "-f", "wav",
                output_path
            ], check=True, capture_output=True)
            print("✅ Converted via ffmpeg")
            return output_path
        except Exception as e:
            print(f"⚠️ ffmpeg failed: {e}")

    # Method 2: try pydub as fallback
    try:
        from pydub import AudioSegment
        audio = AudioSegment.from_file(input_path)
        audio = audio.set_frame_rate(16000).set_channels(1)
        audio.export(output_path, format="wav")
        print("✅ Converted via pydub")
        return output_path
    except Exception as e:
        print(f"⚠️ pydub failed: {e}")

    # Method 3: try loading directly with librosa (sometimes works)
    return input_path  # return original path, let librosa try


def extract_features(file_storage):
    with tempfile.NamedTemporaryFile(suffix=".m4a", delete=False) as tmp:
        file_storage.save(tmp.name)
        tmp_path = tmp.name

    wav_path = None
    try:
        print(f"📦 Saved temp file: {tmp_path}, size: {os.path.getsize(tmp_path)} bytes")

        wav_path = convert_to_wav(tmp_path)

        y, sr = librosa.load(wav_path, sr=16000)

        if len(y) == 0:
            raise Exception("Audio is empty after loading")

        print(f"🎵 Audio loaded: {len(y)} samples at {sr}Hz")

        mfcc = np.mean(librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40).T, axis=0)

        pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
        pitch = np.mean(pitches[pitches > 0]) if np.any(pitches > 0) else 0.0

        zcr = np.mean(librosa.feature.zero_crossing_rate(y).T, axis=0)[0]
        energy = np.mean(librosa.feature.rms(y=y).T, axis=0)[0]

        feature_vector = np.hstack([mfcc, pitch, zcr, energy])
        return feature_vector

    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)
        if wav_path and wav_path != tmp_path and os.path.exists(wav_path):
            os.unlink(wav_path)


@app.route("/predict", methods=["POST"])
def predict():
    try:
        file = request.files.get("audio")
        if not file:
            return jsonify({"error": "No audio file provided"}), 400

        print(f"📁 Received: {file.filename}, type: {file.content_type}")

        features = extract_features(file)
        features = features.reshape(1, 1, -1)

        prediction = model.predict(features)
        danger_confidence = float(prediction[0][1])

        print(f"🧠 Danger confidence: {danger_confidence:.3f}")

        return jsonify({
            "confidence": danger_confidence,
            "danger": danger_confidence > 0.6
        })

    except Exception as e:
        print(f"❌ Predict error: {e}")
        import traceback
        traceback.print_exc()  # prints full error details in terminal
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=False)