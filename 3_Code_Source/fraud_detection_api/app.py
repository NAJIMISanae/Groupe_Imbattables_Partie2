from flask import Flask, request, jsonify
import joblib
import pandas as pd
import numpy as np

app = Flask(__name__)

bundle = joblib.load("fraud_detection_model.pkl")
model = bundle["model"]

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(force=True)

        required = ["amount", "account_id", "merchant_category", "location", "timestamp"]
        if not all(k in data for k in required):
            return jsonify({
                "error": "JSON invalide. Champs requis: amount, account_id, merchant_category, location, timestamp"
            }), 400

        X = pd.DataFrame([{
            "amount": float(data["amount"]),
            "account_id": int(data["account_id"]),
            "merchant_category": str(data["merchant_category"]),
            "location": str(data["location"]),
            "timestamp": str(data["timestamp"]),
        }])

        pred = model.predict(X)[0]

        if hasattr(model, "predict_proba"):
            proba = float(model.predict_proba(X)[0][1])
        else:
            score = model.decision_function(X)[0]
            proba = float(1 / (1 + np.exp(-score)))

        return jsonify({"is_fraud": bool(int(pred)), "fraud_score": proba}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
