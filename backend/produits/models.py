from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

class Produit(models.Model):
    nom = models.CharField(max_length=255)
    # Correction ici : decimal_places au lieu de decimal_digits
    prix_vente = models.DecimalField(max_digits=10, decimal_places=2) 
    quantite_stock = models.IntegerField(default=0)
    stock_minimum = models.IntegerField(default=5)
    cree_le = models.DateTimeField(auto_now_add=True)
    cree_par = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.nom

    @property
    def stock_insuffisant(self):
        return self.quantite_stock <= self.stock_minimum


class Vente(models.Model):
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE, related_name='ventes')
    quantite_vendue = models.IntegerField()
    # Correction ici aussi : decimal_places au lieu de decimal_digits
    prix_total = models.DecimalField(max_digits=12, decimal_places=2) 
    fait_le = models.DateTimeField(auto_now_add=True)
    fait_par = models.ForeignKey(User, on_delete=models.CASCADE)

    def clean(self):
        if self.quantite_vendue > self.produit.quantite_stock:
            raise ValidationError(f"Stock insuffisant. Seulement {self.produit.quantite_stock} disponible(s).")

    def save(self, *args, **kwargs):
        self.clean()
        self.prix_total = self.produit.prix_vente * self.quantite_vendue
        
        # Soustraction du stock
        self.produit.quantite_stock -= self.quantite_vendue
        self.produit.save()
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Vente de {self.quantite_vendue} {self.produit.nom}"