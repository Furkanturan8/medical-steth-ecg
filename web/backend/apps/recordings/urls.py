from django.urls import include, path

urlpatterns = [
    path("v1/", include("apps.recordings.urls_v1")),
]
