from rest_framework import viewsets, permissions
from .models import Produit, Vente
from .serializers import ProduitSerializer, VenteSerializer

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_staff

class ProduitViewSet(viewsets.ModelViewSet):
    serializer_class = ProduitSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        return Produit.objects.all().order_by('-cree_le')

    def perform_create(self, serializer):
        serializer.save(cree_par=self.request.user)

class VenteViewSet(viewsets.ModelViewSet):
    serializer_class = VenteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Vente.objects.all().order_by('-fait_le')

    def perform_create(self, serializer):
        serializer.save(fait_par=self.request.user)