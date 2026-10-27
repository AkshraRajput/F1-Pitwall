from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("api/f1/<path:subpath>", views.f1_proxy, name="f1_proxy"),
]
