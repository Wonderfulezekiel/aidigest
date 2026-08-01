# 🚀 Deployment Guide — PDF AIDigest

This guide provides simple, step-by-step instructions to push your repository to GitHub, deploy the **Backend on Render**, and deploy the **Frontend on Vercel**.

---

## 📌 Step 1: Push Code to GitHub

Open PowerShell in your project root directory (`c:\Users\hp\Documents\aidigest`) and run:

```bash
git init
git add .
git commit -m "Initial commit - Complete PDF AIDigest App"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```
> *(Replace `YOUR_GITHUB_REPO_URL` with your actual GitHub repository URL, e.g., `https://github.com/your-username/aidigest.git`)*

---

## 🐍 Step 2: Deploy Backend to Render

1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the Web Service settings:
   - **Name:** `pdf-aidigest-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Under **Environment Variables**, add the following keys from your `backend/.env`:
   - `SUPABASE_URL`: `https://fcqvngpnuwowsbbiipap.supabase.co`
   - `SUPABASE_KEY`: *(Your Supabase Anon/Service Key)*
   - `PINECONE_API_KEY`: *(Your Pinecone API Key)*
   - `PINECONE_INDEX_NAME`: `pdf-aidigest-index`
   - `OPENROUTER_API_KEY`: *(Your OpenRouter API Key)*
   - `OPENROUTER_MODEL`: `openrouter/free`
   - `OPENROUTER_EMBEDDING_MODEL`: `openai/text-embedding-3-small`
5. Click **Create Web Service**. Once deployed, copy your Render Live Backend URL (e.g. `https://pdf-aidigest-backend.onrender.com`).

---

## ⚡ Step 3: Deploy Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** -> **Project**.
2. Import your GitHub repository.
3. In Project Settings:
   - **Framework Preset:** `Next.js`
   - **Root Directory:** Edit and select `frontend`
4. Under **Environment Variables**, add:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://pdf-aidigest-backend.onrender.com/api` *(replace with your actual Render URL)*
5. Click **Deploy**. Vercel will build and deploy your Next.js application!

---

🎉 **Done!** Your PDF AIDigest application is live and fully functional on Vercel & Render.
