from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('produits.urls')), # Tout notre module produit sera accessible via /api/
]