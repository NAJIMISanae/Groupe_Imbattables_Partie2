from flask import Flask, request, jsonify
import joblib
import pandas as pd
import numpy as np

app = Flask(__name__)

# IMPORTANT:
# Le modèle exporté a picklé la fonction add_time_features comme provenant de "__main__".
# Donc quand on charge le .pkl depuis app.py (qui devient __main__), on DOIT définir
# add_time_features ici, avec le même nom, AVANT joblib.load().

def add_time_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    if "timestamp" not in df.columns:
        raise ValueError("La colonne 'timestamp' est absente.")

    df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
    df["hour"] = df["timestamp"].dt.hour
    df["dayofweek"] = df["timestamp"].dt.dayofweek

    expected = ["account_id", "amount", "hour", "dayofweek", "merchant_category", "location"]
    missing = [c for c in expected if c not in df.columns]
    if missing:
        raise ValueError(f"Colonnes manquantes pour la prédiction: {missing}")

    return df[expected]


# On charge le bundle exporté par train_export_pipeline.py
# bundle = {"model": pipeline, "feature_columns": [...]}
bundle = joblib.load("fraud_detection_model.pkl")
model = bundle["model"]  # pipeline complet (preprocessing + modèle)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(force=True)

        # Format recommandé : JSON structuré
        required = ["amount", "account_id", "merchant_category", "location", "timestamp"]
        if not all(k in data for k in required):
            return jsonify({
                "error": "JSON invalide. Champs requis: amount, account_id, merchant_category, location, timestamp",
                "example": {
                    "amount": 9999.99,
                    "account_id": 123,
                    "merchant_category": "electronics",
                    "location": "Paris",
                    "timestamp": "2025-12-20T02:15:00"
                }
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
            # fallback si un modèle sans proba
            score = model.decision_function(X)[0]
            proba = float(1 / (1 + np.exp(-score)))

        return jsonify({
            "is_fraud": bool(int(pred)),
            "fraud_score": proba
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
