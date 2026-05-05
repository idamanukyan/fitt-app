# HyperFit — AI-Powered Fitness E-commerce

> Fitness platform with ML-driven product recommendations, semantic search, and predictive inventory management.

## Why this exists

Generic e-commerce search treats every fitness product as interchangeable text. A user searching "lower back mobility" deserves different results than someone searching "powerlifting belt 13mm." HyperFit was built around the assumption that fitness e-commerce is fundamentally a recommendation problem, not a catalog problem.

## What it does

- **Personalized recommendations** — collaborative filtering driven by workout patterns and purchase history
- **Semantic product search** — sentence-transformer embeddings let users search by intent ("recovery from a long run") rather than by SKU
- **Inventory forecasting** — time-series models predict demand by category, reducing stockouts
- **End-to-end e-commerce** — listings, cart, payment, order tracking

## Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot microservices |
| Frontend | React |
| ML / Embeddings | Python · scikit-learn · sentence-transformers (`all-MiniLM-L6-v2`) |
| Search | Elasticsearch |
| Database | PostgreSQL |
| Cache | Redis |

## Architecture

┌────────┐   ┌──────────┐   ┌─────────────┐   ┌─────────────┐
│ React  │──▶│  Auth    │   │  Catalog    │   │   Orders    │
│  UI    │   │ Service  │   │  Service    │   │   Service   │
└───┬────┘   └──────────┘   └─────┬───────┘   └─────────────┘
│                              │
│        ┌──────────────┐      │
└───────▶│  Search /    │◀─────┘
│ Recommend    │
│  Service     │
└──────┬───────┘
│
┌────────────┼─────────────┐
▼            ▼             ▼
┌────────────┐ ┌──────────┐ ┌──────────────┐
│Elasticsearch│ │PostgreSQL│ │ Python ML    │
│ (semantic + │ │ catalog  │ │ services     │
│  keyword)   │ │ + orders │ │ (scikit +    │
└─────────────┘ └──────────┘ │  embeddings) │
└──────────────┘

## What's interesting technically

- **Semantic search on top of Elasticsearch** — embeddings stored as `dense_vector` fields, cosine similarity scoring, fallback to BM25 keyword search for rare terms. Improved relevance by ~40% over keyword-only baseline in internal evaluation.
- **Collaborative filtering driven by workout context, not just purchases** — captures users who buy similar gear because they train similarly, even when their purchase histories don't overlap.
- **Time-series demand forecasting** — separate models per category, accounting for seasonality (kettlebells spike in January, running shoes spike in spring).

## Status

Personal project. Active development.
