# ⚠️ Data Folder - SAMPLES ONLY

## 🚫 CRITICAL WARNING

**This folder is for SAMPLES and TEST DATA ONLY.**

### ❌ DO NOT:
- Store production datasets here
- Commit large CSV/Parquet files to Git
- Keep real student submissions here
- Use this for data backup

### ✅ DO:
- Store small sample datasets for testing
- Keep example records for CI/CD pipelines
- Use processed/ for output verification only

---

## Why?

If this project grows (10K+ students), the `data/` folder would balloon and:
1. **Slow down Git clones/pulls** (repo bloat)
2. **Increase storage costs** (GitHub has limits)
3. **Complicate backups** (too much data)
4. **Create version control headaches**

---

## Production Data Strategy

For real deployments:
1. **PostgreSQL** for student records (configs/database.yaml)
2. **S3/Cloud Storage** for large datasets
3. **Data warehouse** for analytics
4. **Separate backup system** for compliance

---

## Current Structure

- `raw/` → Small CSV samples for testing (max 1MB)
- `processed/` → Example parquet outputs for validation
- `outputs/` → Generated reports (cleared regularly)
- `temp/` → Temporary files (not committed)

**Keep it clean. Keep it lean. Keep it fast.**

