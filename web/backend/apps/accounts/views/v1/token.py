from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


class ThrottledTokenObtainPairView(TokenObtainPairView):
    # Brute-force koruması — bkz. token_obtain oranı (settings.py).
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "token_obtain"


class ThrottledTokenRefreshView(TokenRefreshView):
    # Login'den ayrı, daha cömert bir kapsam: bir sayfa yüklemesinde birden
    # fazla eşzamanlı istek (örn. Next.js link prefetch) aynı anda refresh
    # deneyebiliyor — login'in sıkı limitiyle paylaşırsa 429'a düşüyor.
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "token_refresh"
