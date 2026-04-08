from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.contrib.auth import authenticate
import logging
from .models import User
from .serializers import (
    CustomTokenObtainPairSerializer,
    UserLoginSerializer,
    UserSerializer,
    UserCreateSerializer,
    PublicRegistrationSerializer,
    ChangePasswordSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)

logger = logging.getLogger(__name__)


class LoginThrottle(AnonRateThrottle):
    """Custom throttle for login attempts."""
    scope = 'login'


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom JWT token obtain view."""
    serializer_class = CustomTokenObtainPairSerializer


class UserLoginView(TokenObtainPairView):
    """User login view with JWT token generation."""
    permission_classes = (AllowAny,)
    serializer_class = UserLoginSerializer
    
    def post(self, request, *args, **kwargs):
        """Login user and return JWT tokens."""
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        # Add custom claims
        refresh['name'] = user.name
        refresh['email'] = user.email
        refresh['role'] = user.role
        
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)


class PublicRegistrationView(APIView):
    """Public account request endpoint."""

    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = PublicRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response(
            {
                'message': 'Account request submitted. An administrator will review and activate access.',
                'user': UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class UserLogoutView(viewsets.GenericViewSet):
    """User logout view."""
    permission_classes = (IsAuthenticated,)
    
    def create(self, request):
        """Logout user by blacklisting refresh token."""
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
                return Response(
                    {"message": "Successfully logged out"}, 
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    {"error": "Refresh token is required"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            return Response(
                {"error": "Invalid token"}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for managing users."""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        """Return appropriate serializer class."""
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action == 'change_password':
            return ChangePasswordSerializer
        return UserSerializer
    
    def get_permissions(self):
        """Set permissions based on action."""
        if self.action in {'me', 'update_profile', 'change_password'}:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated]
        
        return [permission() for permission in permission_classes]

    def _require_admin(self, request):
        if request.user.role != 'admin':
            return Response(
                {"error": "Only admin users can manage users"},
                status=status.HTTP_403_FORBIDDEN,
            )
        return None

    def list(self, request, *args, **kwargs):
        if (response := self._require_admin(request)) is not None:
            return response

        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        if (response := self._require_admin(request)) is not None:
            return response

        return super().retrieve(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        """Create new user (admin only)."""
        if (response := self._require_admin(request)) is not None:
            return response

        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if (response := self._require_admin(request)) is not None:
            return response

        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if (response := self._require_admin(request)) is not None:
            return response

        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if (response := self._require_admin(request)) is not None:
            return response

        return super().destroy(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Get current user profile."""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put'], permission_classes=[IsAuthenticated])
    def update_profile(self, request):
        """Update current user profile."""
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            # Don't allow users to change their own role unless they're admin
            if 'role' in request.data and user.role != 'admin':
                return Response(
                    {"error": "You cannot change your own role"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def change_password(self, request):
        """Change user password."""
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            return Response(
                {"message": "Password changed successfully"}, 
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def toggle_active(self, request, pk=None):
        """Toggle user active status (admin only)."""
        if (response := self._require_admin(request)) is not None:
            return response
        
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        
        return Response(
            {
                "message": f"User {'activated' if user.is_active else 'deactivated'} successfully",
                "is_active": user.is_active
            }, 
            status=status.HTTP_200_OK
        )


class TokenRefreshViewCustom(TokenRefreshView):
    """Custom token refresh view."""
    
    def post(self, request, *args, **kwargs):
        """Refresh access token."""
        try:
            response = super().post(request, *args, **kwargs)
            return response
        except TokenError as e:
            return Response(
                {"error": "Invalid or expired refresh token"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )


class PasswordResetRequestView(APIView):
    """Send a password reset email to the requested address."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {
                "message": (
                    "If an account exists for that email, a reset OTP has been sent."
                )
            },
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):
    """Complete a password reset using a valid token."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {"message": "Password reset successfully."},
            status=status.HTTP_200_OK,
        )
