from django.urls import path

from apps.accounts.views.v1.token import (
    ThrottledTokenObtainPairView,
    ThrottledTokenRefreshView,
)
from apps.accounts.views.v1.user import MeView

urlpatterns = [
    path("token/", ThrottledTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", ThrottledTokenRefreshView.as_view(), name="token_refresh"),
    path("me/", MeView.as_view(), name="me"),
]
