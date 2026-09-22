from rest_framework import serializers
from .models import Produit, Vente

class ProduitSerializer(serializers.ModelSerializer):
    cree_par_username = serializers.ReadOnlyField(source='cree_par.username')
    stock_insuffisant = serializers.ReadOnlyField()

    class Meta:
        model = Produit
        fields = ['id', 'nom', 'prix_vente', 'quantite_stock', 'stock_minimum', 'cree_le', 'cree_par_username', 'stock_insuffisant']
        read_only_fields = ['cree_par']

# --- AJOUTE CE BLOC ---
class VenteSerializer(serializers.ModelSerializer):
    produit_nom = serializers.ReadOnlyField(source='produit.nom')
    fait_par_username = serializers.ReadOnlyField(source='fait_par.username')

    class Meta:
        model = Vente
        fields = ['id', 'produit', 'produit_nom', 'quantite_vendue', 'prix_total', 'fait_le', 'fait_par_username']
        read_only_fields = ['fait_par', 'prix_total']