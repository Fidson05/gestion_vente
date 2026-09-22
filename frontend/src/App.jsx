import React, { useState, useEffect } from 'react';
import API from './api';
import Login from './Login';
import Dashboard from './Dashboard';

function App() {
  // 1. Récupération des données depuis localStorage au démarrage
  const [token, setToken] = useState(() => localStorage.getItem('access_token'));
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('is_admin') === 'true');
  const [userLogged, setUserLogged] = useState(() => localStorage.getItem('user_logged') || '');

  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [authError, setAuthError] = useState('');

  // États Produits
  const [produits, setProduits] = useState([]);
  const [nom, setNom] = useState('');
  const [prix, setPrix] = useState('');
  const [quantite, setQuantite] = useState('');
  const [stockMin, setStockMin] = useState('5');
  const [prodError, setProdError] = useState('');
  const [produitEnEdition, setProduitEnEdition] = useState(null);

  // États Ventes
  const [ventes, setVentes] = useState([]);
  const [produitASelectionner, setProduitASelectionner] = useState(null);
  const [quantiteAVendre, setQuantiteAVendre] = useState('1');
  const [venteError, setVenteError] = useState('');

  // 2. Charger les données si le token existe au démarrage
  useEffect(() => {
    if (token) {
      chargerDonnees();
    }
  }, [token]);

  const chargerDonnees = () => {
    chargerProduits();
    chargerVentes();
  };

  const chargerProduits = async () => {
    try {
      const response = await API.get('produits/');
      setProduits(response.data);
    } catch (err) {
      // Ne déconnecter QUE si le serveur confirme un Token invalide/expiré (401)
      if (err.response?.status === 401) {
        handleLogout(true);
      }
    }
  };

  const chargerVentes = async () => {
    try {
      const response = await API.get('ventes/');
      setVentes(response.data);
    } catch (err) {
      console.error("Erreur chargement ventes", err);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isRegister) {
        await API.post('auth/register/', { username, password, email });
        setIsRegister(false);
        setAuthError('Compte créé avec succès ! Connectez-vous.');
      } else {
        const response = await API.post('auth/login/', { username, password });

        const adminStatus = Boolean(response.data.is_staff || response.data.is_superuser);
        
        // Sauvegarde locale
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        localStorage.setItem('is_admin', adminStatus);
        localStorage.setItem('user_logged', response.data.username);

        // Mise à jour de l'état React
        setIsAdmin(adminStatus);
        setUserLogged(response.data.username);
        setToken(response.data.access);
      }
      setPassword('');
    } catch (err) {
      setAuthError(err.response?.data?.detail || "Erreur d'authentification.");
    }
  };

  // Déconnexion (Sécurisée avec Confirmation)
  const handleLogout = (force = false) => {
    if (force || window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
      localStorage.clear();
      setToken(null);
      setIsAdmin(false);
      setUserLogged('');
      setProduits([]);
      setVentes([]);
    }
  };

  const handleSaveProduit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return alert("Réservé aux administrateurs.");
    setProdError('');
    if (!nom || !prix || !quantite) {
      setProdError('Veuillez remplir tous les champs.');
      return;
    }
    const payload = { nom, prix_vente: parseFloat(prix), quantite_stock: parseInt(quantite), stock_minimum: parseInt(stockMin) };
    try {
      if (produitEnEdition) {
        await API.patch(`produits/${produitEnEdition.id}/`, payload);
        setProduitEnEdition(null);
      } else {
        await API.post('produits/', payload);
      }
      setNom(''); setPrix(''); setQuantite(''); setStockMin('5');
      chargerDonnees();
    } catch (err) {
      setProdError("Impossible d'enregistrer le produit.");
    }
  };

  const preparerModification = (p) => {
    if (!isAdmin) return;
    setProduitEnEdition(p);
    setNom(p.nom); setPrix(p.prix_vente); setQuantite(p.quantite_stock); setStockMin(p.stock_minimum);
    setProdError('');
  };

  const annulerModification = () => {
    setProduitEnEdition(null);
    setNom(''); setPrix(''); setQuantite(''); setStockMin('5');
  };

  const handleSupprimerProduit = async (id) => {
    if (!isAdmin) return alert("Réservé aux administrateurs.");
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      try {
        await API.delete(`produits/${id}/`);
        if (produitEnEdition?.id === id) annulerModification();
        if (produitASelectionner?.id === id) setProduitASelectionner(null);
        chargerDonnees();
      } catch (err) {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const handleEffectuerVente = async (e) => {
    e.preventDefault();
    setVenteError('');
    if (!produitASelectionner || !quantiteAVendre) return;
    try {
      await API.post('ventes/', { produit: produitASelectionner.id, quantite_vendue: parseInt(quantiteAVendre) });
      setProduitASelectionner(null);
      setQuantiteAVendre('1');
      chargerDonnees();
    } catch (err) {
      setVenteError(err.response?.data?.[0] || "Stock insuffisant ?");
    }
  };

  return !token ? (
    <Login 
      username={username} setUsername={setUsername}
      password={password} setPassword={setPassword}
      email={email} setEmail={setEmail}
      isRegister={isRegister} setIsRegister={setIsRegister}
      authError={authError} setAuthError={setAuthError}
      handleAuth={handleAuth}
    />
  ) : (
    <Dashboard 
      isAdmin={isAdmin}
      userLogged={userLogged}
      handleLogout={() => handleLogout(false)} chargerDonnees={chargerDonnees} produits={produits} ventes={ventes}
      nom={nom} setNom={setNom} prix={prix} setPrix={setPrix} quantite={quantite} setQuantite={setQuantite} stockMin={stockMin} setStockMin={setStockMin} prodError={prodError}
      produitEnEdition={produitEnEdition} preparerModification={preparerModification} annulerModification={annulerModification} handleSaveProduit={handleSaveProduit} handleSupprimerProduit={handleSupprimerProduit}
      produitASelectionner={produitASelectionner} setProduitASelectionner={setProduitASelectionner} quantiteAVendre={quantiteAVendre} setQuantiteAVendre={setQuantiteAVendre} venteError={venteError} setVenteError={setVenteError} handleEffectuerVente={handleEffectuerVente}
    />
  );
}

export default App;