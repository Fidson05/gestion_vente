from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import ProduitViewSet, VenteViewSet
from .auth_views import CustomTokenObtainPairView, RegisterView, UserDetailView, ChangePasswordView

router = DefaultRouter()
router.register(r'produits', ProduitViewSet, basename='product')
router.register(r'ventes', VenteViewSet, basename='vente')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('users/', UserDetailView.as_view(), name='list_users'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='manage_user'),
]