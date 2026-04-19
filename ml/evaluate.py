import numpy as np
from tensorflow.keras.models import load_model
from sklearn.metrics import classification_report, confusion_matrix

def evaluate_models():
    print("Evaluating Stress Model...")
    try:
        stress_model = load_model('stress_model.h5')
        X_test = np.load('X_test.npy')
        y_test = np.load('y_test.npy')
        X_test = np.expand_dims(X_test, axis=1)

        y_pred = np.argmax(stress_model.predict(X_test), axis=1)
        print(classification_report(y_test, y_pred))
        print("Confusion Matrix:")
        print(confusion_matrix(y_test, y_pred))
    except Exception as e:
        print("Could not evaluate stress model:", e)

    print("\nEvaluating Keyword Model...")
    try:
        keyword_model = load_model('keyword_model.h5')
        # Dummy test data evaluation for keyword model
        X_kw_test = np.random.rand(50, 128, 128, 1)
        y_kw_test = np.random.choice(13, size=50)

        y_kw_pred = np.argmax(keyword_model.predict(X_kw_test), axis=1)
        print(classification_report(y_kw_test, y_kw_pred))
    except Exception as e:
        print("Could not evaluate keyword model:", e)

if __name__ == '__main__':
    evaluate_models()
