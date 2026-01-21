# train_export_pipeline.py
# Option 1 (recommandée) : Pipeline complet sklearn + ColumnTransformer + export .pkl
# Entraîne un modèle de détection de fraude et exporte un pipeline prêt pour l'API Flask

import argparse
import os
import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, FunctionTransformer
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression


def add_time_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Reproduit la logique Partie 1 :
    - timestamp -> hour, dayofweek
    - conserve les colonnes nécessaires au modèle
    """
    df = df.copy()

    if "timestamp" not in df.columns:
        raise ValueError("La colonne 'timestamp' est absente du dataset.")

    df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
    df["hour"] = df["timestamp"].dt.hour
    df["dayofweek"] = df["timestamp"].dt.dayofweek

    # Colonnes attendues d'après votre feature_engineering (Partie 1)
    expected = ["account_id", "amount", "hour", "dayofweek", "merchant_category", "location"]
    missing = [c for c in expected if c not in df.columns]
    if missing:
        raise ValueError(f"Colonnes manquantes pour l'entraînement: {missing}")

    return df[expected]


def build_pipeline(model_type: str = "rf", random_state: int = 42) -> Pipeline:
    """
    Pipeline complet :
      1) Feature engineering timestamp -> hour/dayofweek (FunctionTransformer)
      2) Imputation numérique + OneHotEncoder catégories (handle_unknown='ignore', drop='first')
      3) Modèle (RandomForest ou LogisticRegression)
    """
    numeric_features = ["account_id", "amount", "hour", "dayofweek"]
    categorical_features = ["merchant_category", "location"]

    numeric_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
    ])

    categorical_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(drop="first", handle_unknown="ignore")),
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, numeric_features),
            ("cat", categorical_transformer, categorical_features),
        ],
        remainder="drop",
    )

    if model_type.lower() == "lr":
        model = LogisticRegression(
            max_iter=2000,
            n_jobs=None,
            class_weight="balanced",
            random_state=random_state
        )
    else:
        # par défaut RandomForest (recommandé en projet étudiant)
        model = RandomForestClassifier(
            n_estimators=300,
            random_state=random_state,
            class_weight="balanced_subsample",
            n_jobs=-1
        )

    pipe = Pipeline(steps=[
        ("time_features", FunctionTransformer(add_time_features, validate=False)),
        ("preprocess", preprocessor),
        ("model", model),
    ])

    return pipe


def get_feature_names(pipeline: Pipeline) -> list[str]:
    """
    Récupère les noms des features après ColumnTransformer + OneHotEncoder.
    Utile pour debug / documentation.
    """
    preprocess = pipeline.named_steps["preprocess"]
    # noms numériques
    num_cols = preprocess.transformers_[0][2]
    # noms catégoriels onehot
    cat_pipe = preprocess.named_transformers_["cat"]
    ohe = cat_pipe.named_steps["onehot"]
    cat_cols = preprocess.transformers_[1][2]
    ohe_names = list(ohe.get_feature_names_out(cat_cols))
    return list(num_cols) + ohe_names


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", required=True, help="Chemin vers le CSV des transactions (Partie 1 / Partie 2).")
    parser.add_argument("--out", default="fraud_detection_model.pkl", help="Nom du fichier .pkl exporté.")
    parser.add_argument("--model", choices=["rf", "lr"], default="rf", help="Type de modèle: rf ou lr.")
    parser.add_argument("--test-size", type=float, default=0.30, help="Taille du split test.")
    args = parser.parse_args()

    # 1) Charger les données
    df = pd.read_csv(args.data)

    # contrôles minimaux
    if "is_fraud" not in df.columns:
        raise ValueError("La colonne 'is_fraud' est absente du dataset (target).")

    y = df["is_fraud"].astype(int)

    # 2) Construire pipeline
    pipeline = build_pipeline(model_type=args.model)

    # 3) Split
    X_train, X_test, y_train, y_test = train_test_split(
        df, y, test_size=args.test_size, random_state=42, stratify=y
    )

    # 4) Fit
    pipeline.fit(X_train, y_train)

    # 5) Évaluation rapide
    y_pred = pipeline.predict(X_test)

    if hasattr(pipeline.named_steps["model"], "predict_proba"):
        y_proba = pipeline.predict_proba(X_test)[:, 1]
        roc = roc_auc_score(y_test, y_proba)
    else:
        roc = np.nan

    print("=== Classification report ===")
    print(classification_report(y_test, y_pred))
    print(f"=== ROC AUC === {roc:.4f}" if not np.isnan(roc) else "=== ROC AUC non disponible ===")

    # 6) Export pipeline complet + feature_columns (post-encodage)
    feature_columns = get_feature_names(pipeline)

    bundle = {
        "model": pipeline,                 # pipeline complet (prétraitement + modèle)
        "feature_columns": feature_columns # utile pour debug / traçabilité
    }

    joblib.dump(bundle, args.out)
    print(f"\nOK: modèle exporté dans: {os.path.abspath(args.out)}")
    print(f"Nb features finales: {len(feature_columns)}")


if __name__ == "__main__":
    main()
