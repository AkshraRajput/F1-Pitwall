import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Set DJANGO_SECRET_KEY and DJANGO_DEBUG=0 in Vercel -> Settings -> Environment Variables
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-only-change-me")
DEBUG = os.environ.get("DJANGO_DEBUG", "1") == "1"
ALLOWED_HOSTS = ["*"]

INSTALLED_APPS = [
    "django.contrib.staticfiles",
    "dashboard",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",   # serves /static/ in production
    "django.middleware.common.CommonMiddleware",
]

ROOT_URLCONF = "pitwall.urls"
WSGI_APPLICATION = "pitwall.wsgi.application"

TEMPLATES = [{
    "BACKEND": "django.template.backends.django.DjangoTemplates",
    "DIRS": [BASE_DIR / "templates"],
    "APP_DIRS": True,
    "OPTIONS": {"context_processors": ["django.template.context_processors.request"]},
}]

STATIC_URL = "/static/"
STATICFILES_DIRS = [BASE_DIR / "static"]
STATIC_ROOT = BASE_DIR / "staticfiles"
WHITENOISE_USE_FINDERS = True   # no collectstatic needed on Vercel

DATABASES = {}   # no database needed
CACHES = {"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}}
USE_TZ = True
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
