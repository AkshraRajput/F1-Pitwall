import json
import urllib.request

from django.core.cache import cache
from django.http import Http404, JsonResponse
from django.shortcuts import render

UPSTREAM = "https://api.jolpi.ca/ergast/f1/"
CACHE_SECONDS = 30
# Only these endpoints can be proxied
ALLOWED = {
    "current.json",
    "current/driverStandings.json",
    "current/constructorStandings.json",
    "current/last/results.json",
}


def index(request):
    return render(request, "dashboard/index.html")


def f1_proxy(request, subpath):
    """Fetch from the Jolpica F1 API server-side and cache briefly,
    so many visitors don't each hit the upstream API."""
    if subpath not in ALLOWED:
        raise Http404("Unknown endpoint")

    key = f"f1:{subpath}"
    data = cache.get(key)
    if data is None:
        try:
            req = urllib.request.Request(UPSTREAM + subpath, headers={"User-Agent": "pitwall-dashboard"})
            with urllib.request.urlopen(req, timeout=8) as resp:
                data = json.loads(resp.read().decode("utf-8"))
        except Exception:
            return JsonResponse({"error": "upstream unavailable"}, status=502)
        cache.set(key, data, CACHE_SECONDS)

    response = JsonResponse(data)
    response["Cache-Control"] = f"public, s-maxage={CACHE_SECONDS}, stale-while-revalidate=60"
    return response
