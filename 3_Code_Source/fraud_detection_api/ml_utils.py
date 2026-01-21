import pandas as pd

def add_time_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Ajoute des features temporelles à partir d'une colonne 'timestamp'
    et retourne un DataFrame avec les colonnes attendues par le pipeline.

    Colonnes de sortie :
      - account_id (int)
      - amount (float)
      - hour (int)
      - dayofweek (int)
      - merchant_category (str)
      - location (str)
    """
    df = df.copy()

    if "timestamp" not in df.columns:
        raise ValueError("La colonne 'timestamp' est absente.")

    df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
    df["hour"] = df["timestamp"].dt.hour
    df["dayofweek"] = df["timestamp"].dt.dayofweek

    expected = ["account_id", "amount", "hour", "dayofweek", "merchant_category", "location"]
    missing = [c for c in expected if c not in df.columns]
    if missing:
        raise ValueError(f"Colonnes manquantes pour la transformation: {missing}")

    return df[expected]
