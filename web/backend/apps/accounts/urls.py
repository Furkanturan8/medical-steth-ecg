from django.urls import include, path

urlpatterns = [
    path("v1/", include("apps.accounts.urls_v1")),
]
