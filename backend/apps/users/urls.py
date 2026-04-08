from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserLoginView,
    PublicRegistrationView,
    UserLogoutView,
    UserViewSet,
    TokenRefreshViewCustom,
    CustomTokenObtainPairView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
)

router = DefaultRouter()
router.register(r'', UserViewSet)
router.register(r'logout', UserLogoutView, basename='logout')

urlpatterns = [
    # Authentication endpoints
    path('auth/login/', UserLoginView.as_view(), name='token_obtain_pair'),
    path('auth/register/', PublicRegistrationView.as_view(), name='public_register'),
    path('auth/refresh/', TokenRefreshViewCustom.as_view(), name='token_refresh'),
    path('auth/token/', CustomTokenObtainPairView.as_view(), name='token_obtain'),
    path('auth/password-reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('auth/password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    
    # User management endpoints
    path('', include(router.urls)),
]
