from rest_framework.permissions import BasePermission


class IsAdminUser(BasePermission):
    """Permission to only allow admin users to access."""
    
    def has_permission(self, request, view):
        """Check if user is authenticated and is admin."""
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'admin'
        )


class IsOwnerOrAdmin(BasePermission):
    """Permission to only allow owners of an object or admin to access."""
    
    def has_object_permission(self, request, view, obj):
        """Check if user is owner or admin."""
        # Admin users can access any object
        if request.user.role == 'admin':
            return True
        
        # Users can only access their own objects
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'customer') and hasattr(obj.customer, 'user'):
            return obj.customer.user == request.user
        
        return False


class IsStaffOrAdmin(BasePermission):
    """Permission to allow staff and admin users."""
    
    def has_permission(self, request, view):
        """Check if user is authenticated and is staff or admin."""
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in ['staff', 'admin']
        )