from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserLoginView,
    UserLogoutView,
    UserViewSet,
    TokenRefreshViewCustom,
    CustomTokenObtainPairView
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'logout', UserLogoutView, basename='logout')

urlpatterns = [
    # Authentication endpoints
    path('auth/login/', UserLoginView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshViewCustom.as_view(), name='token_refresh'),
    path('auth/token/', CustomTokenObtainPairView.as_view(), name='token_obtain'),
    
    # User management endpoints
    path('', include(router.urls)),
]
