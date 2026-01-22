import argparse
import joblib
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, FunctionTransformer
from sklearn.metrics import classification_report, roc_auc_score

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier

# IMPORTANT: la fonction est maintenant dans un module importable (pas __main__)
from ml_utils import add_time_features


def build_pipeline(model_name: str):
    # Préprocessing :
    # 1) FunctionTransformer -> add_time_features (timestamp -> hour/dayofweek + sélection colonnes)
    # 2) ColumnTransformer -> OneHot sur catégorielles + passthrough numériques
    time_transform = FunctionTransformer(add_time_features, validate=False)

    numeric_features = ["account_id", "amount", "hour", "dayofweek"]
    categorical_features = ["merchant_category", "location"]

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", "passthrough", numeric_features),
            ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features),
        ]
    )

    if model_name == "lr":
        clf = LogisticRegression(max_iter=1000)
    else:
        clf = RandomForestClassifier(
            n_estimators=300,
            random_state=42,
            class_weight="balanced"
        )

    pipeline = Pipeline(steps=[
        ("time_features", time_transform),
        ("preprocessor", preprocessor),
        ("model", clf),
    ])

    return pipeline


def main():
    parser = argparse.ArgumentParser(description="Train + export fraud detection pipeline")
    parser.add_argument("--data", required=True, help="Path to CSV dataset (must include is_fraud + timestamp etc.)")
    parser.add_argument("--out", default="fraud_detection_model.pkl", help="Output pickle file")
    parser.add_argument("--model", choices=["rf", "lr"], default="rf", help="Model type: rf or lr")
    parser.add_argument("--test-size", type=float, default=0.2, help="Test size ratio")
    args = parser.parse_args()

    df = pd.read_csv(args.data)

    required_cols = {"account_id", "amount", "merchant_category", "location", "timestamp", "is_fraud"}
    missing = required_cols - set(df.columns)
    if missing:
        raise ValueError(f"Dataset invalide, colonnes manquantes: {sorted(list(missing))}")

    X = df[["account_id", "amount", "merchant_category", "location", "timestamp"]].copy()
    y = df["is_fraud"].astype(int)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=args.test_size, random_state=42, stratify=y
    )

    pipeline = build_pipeline(args.model)
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    print("\n=== Classification report ===")
    print(classification_report(y_test, y_pred))

    if hasattr(pipeline, "predict_proba"):
        proba = pipeline.predict_proba(X_test)[:, 1]
        try:
            auc = roc_auc_score(y_test, proba)
            print(f"ROC AUC: {auc:.4f}")
        except Exception:
            pass

    # Export du pipeline complet (préprocessing + modèle)
    bundle = {"model": pipeline}
    joblib.dump(bundle, args.out)

    print(f"\nOK: modèle exporté dans: {args.out}")


if __name__ == "__main__":
    main()
