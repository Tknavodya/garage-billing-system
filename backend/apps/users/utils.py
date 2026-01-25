"""
Authentication utilities for the users app.
"""

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from .models import User


def generate_tokens_for_user(user):
    """Generate JWT tokens for a user."""
    refresh = RefreshToken.for_user(user)
    
    # Add custom claims
    refresh['name'] = user.name
    refresh['email'] = user.email
    refresh['role'] = user.role
    
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token)
    }


def authenticate_user(email, password):
    """Authenticate user with email and password."""
    try:
        user = User.objects.get(email=email)
        if user.check_password(password) and user.is_active:
            return user
    except User.DoesNotExist:
        pass
    return None


def create_user_response(user, tokens=None):
    """Create a standardized user response."""
    from .serializers import UserSerializer
    
    user_data = UserSerializer(user).data
    
    response_data = {
        'user': user_data
    }
    
    if tokens:
        response_data.update(tokens)
    
    return response_data


def validate_password_strength(password):
    """Validate password strength."""
    errors = []
    
    if len(password) < 6:
        errors.append("Password must be at least 6 characters long.")
    
    if not any(char.isdigit() for char in password):
        errors.append("Password must contain at least one digit.")
    
    if not any(char.isupper() for char in password):
        errors.append("Password must contain at least one uppercase letter.")
    
    if not any(char.islower() for char in password):
        errors.append("Password must contain at least one lowercase letter.")
    
    return errors


def check_user_permissions(user, required_role=None):
    """Check if user has required permissions."""
    if not user.is_authenticated:
        return False
    
    if not user.is_active:
        return False
    
    if required_role:
        if required_role == 'admin' and user.role != 'admin':
            return False
        elif required_role == 'staff' and user.role not in ['staff', 'admin']:
            return False
    
    return True


def get_user_from_token(token):
    """Get user from JWT token."""
    try:
        from rest_framework_simplejwt.tokens import UntypedToken
        from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
        from django.contrib.auth import get_user_model
        
        UntypedToken(token)  # Validate token
        
        # Decode token to get user ID
        from rest_framework_simplejwt.tokens import AccessToken
        access_token = AccessToken(token)
        user_id = access_token['user_id']
        
        User = get_user_model()
        return User.objects.get(id=user_id)
    
    except (InvalidToken, TokenError, User.DoesNotExist):
        return None


class AuthenticationMixin:
    """Mixin to add authentication utilities to views."""
    
    def get_authenticated_user(self):
        """Get the authenticated user from request."""
        return getattr(self.request, 'user', None)
    
    def is_admin(self):
        """Check if current user is admin."""
        user = self.get_authenticated_user()
        return user and user.is_authenticated and user.role == 'admin'
    
    def is_staff_or_admin(self):
        """Check if current user is staff or admin."""
        user = self.get_authenticated_user()
        return user and user.is_authenticated and user.role in ['staff', 'admin']
    
    def check_ownership(self, obj):
        """Check if current user owns the object or is admin."""
        user = self.get_authenticated_user()
        if not user or not user.is_authenticated:
            return False
        
        if user.role == 'admin':
            return True
        
        if hasattr(obj, 'user'):
            return obj.user == user
        
        return False