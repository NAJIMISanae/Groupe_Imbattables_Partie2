import argparse
import os
import sys
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix, classification_report, roc_curve, auc

from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.linear_model import LogisticRegression


def ensure_dirs(out_dir: str):
    os.makedirs(os.path.join(out_dir, "figures"), exist_ok=True)
    os.makedirs(os.path.join(out_dir, "csv"), exist_ok=True)
    os.makedirs(os.path.join(out_dir, "reports"), exist_ok=True)


def save_fig(path: str):
    plt.tight_layout()
    plt.savefig(path, dpi=160)
    plt.close()


def load_data(path: str) -> pd.DataFrame:
    if not os.path.exists(path):
        raise FileNotFoundError(f"Fichier introuvable: {path}")

    df = pd.read_csv(path)

    # Contrôles attendus
    expected_cols = {
        "transaction_id", "account_id", "amount",
        "merchant_category", "location", "timestamp", "is_fraud"
    }
    missing = expected_cols - set(df.columns)
    if missing:
        raise ValueError(f"Colonnes manquantes dans le CSV: {missing}")

    return df


def basic_eda(df: pd.DataFrame, out_dir: str):
    # 1) Stats descriptives
    desc_num = df.describe(include=[np.number]).T
    desc_all = df.describe(include="all").T

    desc_num.to_csv(os.path.join(out_dir, "reports", "stats_descriptives_numeriques.csv"))
    desc_all.to_csv(os.path.join(out_dir, "reports", "stats_descriptives_toutes_colonnes.csv"))

    # 2) Répartition fraude vs légitime
    counts = df["is_fraud"].value_counts().sort_index()
    proportions = df["is_fraud"].value_counts(normalize=True).sort_index()

    plt.figure()
    counts.plot(kind="bar")
    plt.title("Répartition fraude vs légitime")
    plt.xlabel("is_fraud (0 = légitime, 1 = fraude)")
    plt.ylabel("Nombre de transactions")
    plt.xticks(rotation=0)
    save_fig(os.path.join(out_dir, "figures", "fraud_vs_legit.png"))

    # 3) Distribution des montants
    plt.figure()
    plt.hist(df["amount"], bins=60)
    plt.title("Distribution des montants")
    plt.xlabel("amount")
    plt.ylabel("Fréquence")
    save_fig(os.path.join(out_dir, "figures", "amount_distribution.png"))

    # 4) Distribution log1p (utile si montants très étalés)
    plt.figure()
    plt.hist(np.log1p(df["amount"]), bins=60)
    plt.title("Distribution log(1 + amount)")
    plt.xlabel("log1p(amount)")
    plt.ylabel("Fréquence")
    save_fig(os.path.join(out_dir, "figures", "amount_distribution_log1p.png"))

    # 5) Montants : fraude vs légitime
    legit = df[df["is_fraud"] == 0]["amount"]
    fraud = df[df["is_fraud"] == 1]["amount"]

    plt.figure()
    plt.hist(legit, bins=60, alpha=0.7, label="Légitime")
    plt.hist(fraud, bins=60, alpha=0.7, label="Fraude")
    plt.title("Montants : légitime vs fraude")
    plt.xlabel("amount")
    plt.ylabel("Fréquence")
    plt.legend()
    save_fig(os.path.join(out_dir, "figures", "amount_legit_vs_fraud.png"))

    # Petit résumé EDA
    eda_summary = {
        "n_rows": int(df.shape[0]),
        "n_cols": int(df.shape[1]),
        "fraud_count": int(counts.get(1, 0)),
        "legit_count": int(counts.get(0, 0)),
        "fraud_rate": float(proportions.get(1, 0.0)),
        "amount_mean_legit": float(legit.mean()) if len(legit) else np.nan,
        "amount_mean_fraud": float(fraud.mean()) if len(fraud) else np.nan,
        "amount_median_legit": float(legit.median()) if len(legit) else np.nan,
        "amount_median_fraud": float(fraud.median()) if len(fraud) else np.nan,
        "missing_values_total": int(df.isna().sum().sum())
    }
    pd.Series(eda_summary).to_csv(os.path.join(out_dir, "reports", "eda_summary.csv"))

    return eda_summary


def feature_engineering(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.Series, pd.DataFrame]:
    """
    Retourne:
      X_enc : features encodées
      y     : target
      meta  : colonnes utiles pour reconstruire des exports (transaction_id etc.)
    """
    df = df.copy()

    # Timestamp -> features heure/jour
    df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
    df["hour"] = df["timestamp"].dt.hour
    df["dayofweek"] = df["timestamp"].dt.dayofweek

    # Meta pour exports
    meta = df[["transaction_id", "account_id", "amount", "merchant_category", "location", "timestamp"]].copy()

    # Features
    X = df[["account_id", "amount", "hour", "dayofweek", "merchant_category", "location"]].copy()
    y = df["is_fraud"].astype(int)

    # Encodage one-hot
    X_enc = pd.get_dummies(X, columns=["merchant_category", "location"], drop_first=True)

    # Remplissage simple des NaN (au cas où timestamp invalide -> hour/dayofweek NaN)
    for col in ["hour", "dayofweek"]:
        if col in X_enc.columns:
            X_enc[col] = X_enc[col].fillna(X_enc[col].median())

    return X_enc, y, meta


def train_and_evaluate_supervised(model_name: str, X, y, meta, out_dir: str):
    X_train, X_test, y_train, y_test, meta_train, meta_test = train_test_split(
        X, y, meta, test_size=0.3, random_state=42, stratify=y
    )

    if model_name == "rf":
        model = RandomForestClassifier(
            n_estimators=200,
            random_state=42,
            class_weight="balanced"
        )
    elif model_name == "lr":
        model = LogisticRegression(
            max_iter=2000,
            class_weight="balanced"
        )
    else:
        raise ValueError("model_name doit être 'rf' ou 'lr' pour le supervisé")

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    # Probabilités pour ROC/AUC + Top10
    if hasattr(model, "predict_proba"):
        y_proba = model.predict_proba(X_test)[:, 1]
    else:
        # fallback
        y_proba = model.decision_function(X_test)

    cm = confusion_matrix(y_test, y_pred)
    report = classification_report(y_test, y_pred, digits=4, output_dict=False)

    # ROC / AUC
    fpr, tpr, _ = roc_curve(y_test, y_proba)
    roc_auc = auc(fpr, tpr)

    plt.figure()
    plt.plot(fpr, tpr, label=f"AUC = {roc_auc:.2f}")
    plt.plot([0, 1], [0, 1], linestyle="--")
    plt.title("Courbe ROC")
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.legend()
    save_fig(os.path.join(out_dir, "figures", "roc_curve.png"))

    # Export Top10
    test_results = meta_test.copy()
    test_results["fraud_score"] = y_proba
    top10 = test_results.sort_values("fraud_score", ascending=False).head(10)
    top10_path = os.path.join(out_dir, "csv", "top10_transactions_suspectes.csv")
    top10.to_csv(top10_path, index=False)

    # Export metrics
    metrics_path = os.path.join(out_dir, "reports", "metrics.txt")
    with open(metrics_path, "w", encoding="utf-8") as f:
        f.write("=== Matrice de confusion ===\n")
        f.write(str(cm) + "\n\n")
        f.write("=== Classification report ===\n")
        f.write(report + "\n")
        f.write(f"\n=== ROC AUC ===\n{roc_auc:.4f}\n")

    return {
        "model": model_name,
        "confusion_matrix": cm,
        "classification_report": report,
        "roc_auc": float(roc_auc),
        "top10_path": top10_path,
        "metrics_path": metrics_path
    }


def train_and_evaluate_isolation_forest(X, y, meta, out_dir: str):
    """
    Isolation Forest : non supervisé.
    Pour comparer avec y (is_fraud), on utilise y_test pour métriques, mais le modèle n'a pas été entraîné sur y.
    """
    X_train, X_test, y_train, y_test, meta_train, meta_test = train_test_split(
        X, y, meta, test_size=0.3, random_state=42, stratify=y
    )

    # contamination : approx taux de fraude observé (si disponible)
    contamination = float(y_train.mean()) if y_train.mean() > 0 else 0.01
    contamination = min(max(contamination, 0.001), 0.2)  # borne raisonnable

    model = IsolationForest(
        n_estimators=200,
        random_state=42,
        contamination=contamination
    )
    model.fit(X_train)

    # IsolationForest: -1 anomalie, 1 normal
    pred_if = model.predict(X_test)
    # convert to "fraude" (1 = fraude) : anomalie(-1) -> 1, normal(1) -> 0
    y_pred = np.where(pred_if == -1, 1, 0)

    # Score : plus petit = plus anormal. On inverse pour avoir "plus grand = plus suspect"
    scores = -model.score_samples(X_test)

    cm = confusion_matrix(y_test, y_pred)
    report = classification_report(y_test, y_pred, digits=4, output_dict=False)

    # ROC/AUC avec score
    fpr, tpr, _ = roc_curve(y_test, scores)
    roc_auc = auc(fpr, tpr)

    plt.figure()
    plt.plot(fpr, tpr, label=f"AUC = {roc_auc:.2f}")
    plt.plot([0, 1], [0, 1], linestyle="--")
    plt.title("Courbe ROC (IsolationForest)")
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.legend()
    save_fig(os.path.join(out_dir, "figures", "roc_curve.png"))

    # Top10 anomalies
    test_results = meta_test.copy()
    test_results["fraud_score"] = scores
    top10 = test_results.sort_values("fraud_score", ascending=False).head(10)
    top10_path = os.path.join(out_dir, "csv", "top10_transactions_suspectes.csv")
    top10.to_csv(top10_path, index=False)

    metrics_path = os.path.join(out_dir, "reports", "metrics.txt")
    with open(metrics_path, "w", encoding="utf-8") as f:
        f.write("=== Matrice de confusion (IsolationForest) ===\n")
        f.write(str(cm) + "\n\n")
        f.write("=== Classification report (comparaison vs is_fraud) ===\n")
        f.write(report + "\n")
        f.write(f"\n=== ROC AUC ===\n{roc_auc:.4f}\n")
        f.write(f"\nContamination utilisée: {contamination:.4f}\n")

    return {
        "model": "if",
        "confusion_matrix": cm,
        "classification_report": report,
        "roc_auc": float(roc_auc),
        "top10_path": top10_path,
        "metrics_path": metrics_path
    }


def write_report_stub(eda_summary: dict, eval_summary: dict, out_dir: str):
    """
    Génère un texte synthèse utilisable dans le rapport PDF (2 pages).
    """
    lines = []
    lines.append("TÂCHE 2.2 — Détection d’Anomalies avec Machine Learning\n")
    lines.append("1) Analyse exploratoire (EDA)\n")
    lines.append(f"- Nombre de transactions : {eda_summary['n_rows']}\n")
    lines.append(f"- Taux de fraude : {eda_summary['fraud_rate']:.2%}\n")
    lines.append(f"- Montant moyen (légitime) : {eda_summary['amount_mean_legit']:.2f}\n")
    lines.append(f"- Montant moyen (fraude)   : {eda_summary['amount_mean_fraud']:.2f}\n")
    lines.append("\n2) Modélisation et évaluation\n")
    lines.append(f"- Modèle : {eval_summary['model']}\n")
    lines.append(f"- ROC AUC : {eval_summary['roc_auc']:.4f}\n")
    lines.append(f"- Métriques détaillées : {eval_summary['metrics_path']}\n")
    lines.append(f"- Top10 exporté : {eval_summary['top10_path']}\n")
    lines.append("\n3) Fichiers générés\n")
    lines.append("- Figures: outputs/figures (fraud_vs_legit.png, amount_distribution.png, roc_curve.png, etc.)\n")
    lines.append("- CSV : outputs/csv/top10_transactions_suspectes.csv\n")
    lines.append("- Résumés : outputs/reports/\n")

    out_path = os.path.join(out_dir, "reports", "resume_rapport.txt")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("".join(lines))

    return out_path


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", required=True, help="Chemin vers sample_transactions.csv")
    parser.add_argument("--out_dir", default="outputs", help="Dossier de sortie")
    parser.add_argument("--model", default="rf", choices=["rf", "lr", "if"], help="Modèle: rf, lr, if")
    args = parser.parse_args()

    ensure_dirs(args.out_dir)

    df = load_data(args.data)

    eda_summary = basic_eda(df, args.out_dir)

    X, y, meta = feature_engineering(df)

    if args.model in ["rf", "lr"]:
        eval_summary = train_and_evaluate_supervised(args.model, X, y, meta, args.out_dir)
    else:
        eval_summary = train_and_evaluate_isolation_forest(X, y, meta, args.out_dir)

    resume_path = write_report_stub(eda_summary, eval_summary, args.out_dir)

    print("\n=== OK: TÂCHE 2.2 exécutée ===")
    print(f"Modèle : {eval_summary['model']}")
    print(f"ROC AUC : {eval_summary['roc_auc']:.4f}")
    print(f"Top10 : {eval_summary['top10_path']}")
    print(f"Résumé rapport : {resume_path}")
    print(f"Figures : {os.path.join(args.out_dir, 'figures')}")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n[ERREUR] {e}")
        sys.exit(1)
