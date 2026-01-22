# Étude de Cas Pratique – DigitalBank France  
## Sécurité, Données & Résilience d’un Système Bancaire

---

##  Description du projet
Ce projet a été réalisé dans le cadre de l’étude de cas pratique ESIS/CPDIA 2025‑2026.
Il consiste à restaurer, sécuriser, moderniser et monitorer l’infrastructure d’une banque en ligne après une cyberattaque majeure.
Le projet vise à mettre en œuvre une réponse complète et professionnelle couvrant :
la restauration et la sécurisation des données,
l’analyse de logs et la détection d’intrusions,
la détection de fraude par Machine Learning,
la conformité RGPD,
la sauvegarde et la reprise après sinistre (DRP).
La solution finale combine une base PostgreSQL restaurée, une API no‑code Supabase, des automatisations Make.com, des dashboards Power BI, et un monitoring complet via Grafana & Prometheus et un déploiement de ce projet sur Render /docker. 

---

##  Membres du groupe et rôles
| Nom                | Rôle 
| Sanae  Najimi      | Lead Data & Sécurité 
| Céline Saoudi      | Monitoring
| Abdelhamid Sadoudi | Backend/API
| Reve Kémy Diavou   | Automatisation
| Lydia Abid         | BI & Visualisation 

--- 

##  Architecture Technique
┌──────────────────────────────┐
│        Utilisateurs           │
│  (Admin / Analyste / Client)  │
└───────────────┬──────────────┘
│
▼
┌────────────────────────┐
│     Frontend BI        │
│       Power BI  │
└──────────────┬─────────┘
│
▼
┌──────────────────────────────────┐
│          API Layer (Supabase)     │
│  - Auth (JWT, OAuth)              │
│  - Row Level Security (RLS)       │
│  - REST & Realtime API            │
└──────────────────┬────────────────┘
│
▼
┌────────────────────────────────┐
│   PostgreSQL restauré (pgAdmin) │
│   - clients, comptes, cartes    │
│   - transactions                 │
│   - logs anonymisés              │
└────────────────────────────────┘
│
▼
┌────────────────────────────────┐
│   Automatisations Make.com       │
│   - Alertes fraude              │
│   - Alertes sécurité            │
│   - Rapports quotidiens         │
└────────────────────────────────┘
│
▼
┌────────────────────────────────┐
│ Monitoring & Metrics            │
│ Prometheus + Grafana            │
│ - CPU / RAM / API latency       │
│ - Erreurs / requêtes / alertes  │
└────────────────────────────────┘

---

##  Technologies Utilisées

### Base de données
- PostgreSQL 14+
- pgAdmin 4
- Extension pgcrypto

### Backend / API
- Supabase (PostgreSQL + Auth + API REST)
- RLS (Row Level Security)
- JWT Authentication

### Visualisation / BI
- Power BI

### Automatisation
- Make.com (alertes, workflows, rapports)

### Monitoring
- Prometheus
- Grafana
- Exporters (Node Exporter, PostgreSQL Exporter)

### Déploiement
- Render (API ML)
- Supabase Cloud
- Docker

---

##  Prérequis

- PostgreSQL 14+
- pgAdmin 4
- Python 
- Docker (Prometheus/Grafana)
- Power BI Desktop
- Comptes : Supabase, Make.com, Render, github, postman

---

##  Installation

### 1. Restauration de la base PostgreSQL avec pgAdmin
CREATE DATABASE digitalbank_restored;

### 2. Configuration du chiffrement (pgcrypto)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

### 3. Mise en place de Supabase (API + Auth)

### 4. Déploiement du modèle ML sur Render et Creation de l'API flask

### 5. Automatisation avec make.com

### 6. Monitoring et visualisation avec grafana et prometheus

### 7. Connexion a POWER BI