# Akshra's Pit Wall (Django)

Live F1 dashboard. Django serves the page and a small cached proxy (`/api/f1/...`)
to the Jolpica F1 API; the browser refreshes the data every 60 s.

## Run locally
    python -m venv venv && source venv/bin/activate
    pip install -r requirements.txt
    python manage.py runserver
Open http://127.0.0.1:8000

## Deploy on Vercel
1. Push this folder to GitHub (manage.py at the repo root).
2. Vercel -> Add New -> Project -> import the repo (framework: Other).
3. Environment variables: DJANGO_SECRET_KEY = <any long random string>, DJANGO_DEBUG = 0
4. Deploy.

## Customise
Edit `static/js/config.js` (name, favourite driver/team, refresh rate).
