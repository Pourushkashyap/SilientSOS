import os
import subprocess

def export_models():
    # Make sure output directories exist
    os.makedirs('../mobile/src/models/stress_model', exist_ok=True)
    os.makedirs('../mobile/src/models/keyword_model', exist_ok=True)

    print("Exporting Stress Model to TF.js format...")
    try:
        subprocess.run([
            "tensorflowjs_converter", 
            "--input_format=keras", 
            "stress_model.h5", 
            "../mobile/src/models/stress_model"
        ], check=True)
        print("Successfully exported stress_model")
    except Exception as e:
        print("Failed to export stress_model:", e)

    print("Exporting Keyword Model to TF.js format...")
    try:
        subprocess.run([
            "tensorflowjs_converter", 
            "--input_format=keras", 
            "keyword_model.h5", 
            "../mobile/src/models/keyword_model"
        ], check=True)
        print("Successfully exported keyword_model")
    except Exception as e:
        print("Failed to export keyword_model:", e)

if __name__ == '__main__':
    export_models()
