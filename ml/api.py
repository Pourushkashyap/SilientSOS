from flask import Flask, request, jsonify
import numpy as np
from tensorflow.keras.models import load_model
from preprocess import extract_features

app = Flask(__name__)

# load model
model = load_model("stress_model.h5")

@app.route("/predict", methods=["POST"])
def predict():
    try:
        file = request.files["audio"]

        # preprocess
        features = extract_features(file)
        features = np.expand_dims(features, axis=0)

        prediction = model.predict(features)
        confidence = float(prediction[0][0])

        return jsonify({
            "confidence": confidence,
            "danger": confidence > 0.8
        })

    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == "__main__":
    app.run(port=8000)