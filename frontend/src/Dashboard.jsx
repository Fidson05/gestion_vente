import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, LogOut, PlusCircle, Trash2, Edit, ShieldCheck, UserCheck, Users, Key, Shield, Check, X } from 'lucide-react';
import API from './api';

function Dashboard({
  isAdmin,
  userLogged,
  handleLogout,
  chargerDonnees,
  produits,
  ventes,
  nom, setNom,
  prix, setPrix,
  quantite, setQuantite,
  stockMin, setStockMin,
  prodError,
  produitEnEdition,
  preparerModification,
  annulerModification,
  handleSaveProduit,
  handleSupprimerProduit,
  produitASelectionner, setProduitASelectionner,
  quantiteAVendre, setQuantiteAVendre,
  venteError, setVenteError,
  handleEffectuerVente
}) {
  // États de gestion des comptes (Admin)
  const [usersList, setUsersList] = useState([]);
  const [userError, setUserError] = useState('');
  const [userEdit, setUserEdit] = useState(null);
  const [editRole, setEditRole] = useState(false);
  const [editNewPass, setEditNewPass] = useState('');

  // États changement de mot de passe personnel
  const [showPassModal, setShowPassModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passMsg, setPassMsg] = useState({ error: '', success: '' });

  useEffect(() => {
    if (isAdmin) {
      chargerUtilisateurs();
    }
  }, [isAdmin]);

  const chargerUtilisateurs = async () => {
    try {
      const response = await API.get('users/');
      setUsersList(response.data);
    } catch (err) {
      console.error("Erreur chargement utilisateurs", err);
    }
  };

  const handleEditUserClick = (u) => {
    setUserEdit(u);
    setEditRole(u.is_staff);
    setEditNewPass('');
  };

  const handleSaveUserModifs = async (e) => {
    e.preventDefault();
    setUserError('');
    try {
      const payload = { is_staff: editRole };
      if (editNewPass) payload.new_password = editNewPass;

      await API.patch(`users/${userEdit.id}/`, payload);
      setUserEdit(null);
      setEditNewPass('');
      chargerUtilisateurs();
    } catch (err) {
      setUserError("Impossible de modifier cet utilisateur.");
    }
  };

  const handleSupprimerUtilisateur = async (id, username) => {
    if (window.confirm(`Voulez-vous vraiment supprimer le compte "${username}" ?`)) {
      try {
        await API.delete(`users/${id}/`);
        chargerUtilisateurs();
      } catch (err) {
        setUserError("Impossible de supprimer cet utilisateur.");
      }
    }
  };

  const handleChangeOwnPassword = async (e) => {
    e.preventDefault();
    setPassMsg({ error: '', success: '' });
    try {
      await API.post('auth/change-password/', {
        old_password: oldPassword,
        new_password: newPassword
      });
      setPassMsg({ error: '', success: 'Mot de passe modifié avec succès !' });
      setOldPassword('');
      setNewPassword('');
      setTimeout(() => setShowPassModal(false), 1500);
    } catch (err) {
      setPassMsg({ error: err.response?.data?.detail || "Erreur lors de la modification.", success: '' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      
      {/* BARRE DE NAVIGATION */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700 mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Package size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide">ZAY-VENTE</h1>
            <p className="text-xs text-slate-400">Système de gestion commercial</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-600">
            {isAdmin ? (
              <ShieldCheck className="text-emerald-400" size={18} />
            ) : (
              <UserCheck className="text-indigo-400" size={18} />
            )}
            <span className="text-sm font-medium">{userLogged}</span>
            <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${isAdmin ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-indigo-950 text-indigo-400 border border-indigo-800'}`}>
              {isAdmin ? 'Admin' : 'Vendeur'}
            </span>
          </div>

          <button
            onClick={() => setShowPassModal(true)}
            className="flex items-center space-x-1.5 bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg text-xs font-semibold border border-slate-600 transition"
            title="Modifier mon mot de passe"
          >
            <Key size={15} />
            <span>Sécurité</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            <LogOut size={16} />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SECTION GAUCHE */}
        <div className="space-y-6">
          
          {/* GESTION STOCK (ADMIN SEULEMENT) */}
          {isAdmin ? (
            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg">
              <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-indigo-400">
                <PlusCircle size={20} />
                <span>{produitEnEdition ? 'Modifier le produit' : 'Ajouter un produit'}</span>
              </h2>

              {prodError && <p className="text-sm text-rose-400 mb-3">{prodError}</p>}

              <form onSubmit={handleSaveProduit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Nom du produit</label>
                  <input
                    type="text"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Nom..."
                    className="w-full px-3 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Prix de vente (Ar)</label>
                    <input
                      type="number"
                      value={prix}
                      onChange={(e) => setPrix(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Stock initial</label>
                    <input
                      type="number"
                      value={quantite}
                      onChange={(e) => setQuantite(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Seuil d'alerte</label>
                  <input
                    type="number"
                    value={stockMin}
                    onChange={(e) => setStockMin(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 font-semibold rounded-lg transition"
                  >
                    {produitEnEdition ? 'Enregistrer modifs' : 'Ajouter au stock'}
                  </button>

                  {produitEnEdition && (
                    <button
                      type="button"
                      onClick={annulerModification}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm font-semibold transition"
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg text-slate-300">
              <h3 className="font-bold text-indigo-400 mb-2">Espace Vendeur</h3>
              <p className="text-sm text-slate-400">
                Sélectionnez un produit et effectuez la vente directement sur l'interface.
              </p>
            </div>
          )}

          {/* FORMULAIRE DE VENTE */}
          {produitASelectionner && (
            <div className="bg-indigo-950/40 p-5 rounded-xl border border-indigo-700/60 shadow-lg">
              <h2 className="text-lg font-semibold mb-3 flex items-center space-x-2 text-indigo-300">
                <ShoppingCart size={20} />
                <span>Effectuer une vente</span>
              </h2>

              <p className="text-sm font-semibold text-slate-200 mb-3">
                Produit : <span className="text-indigo-400">{produitASelectionner.nom}</span> ({produitASelectionner.prix_vente} Ar)
              </p>

              {venteError && <p className="text-sm text-rose-400 mb-3">{venteError}</p>}

              <form onSubmit={handleEffectuerVente} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Quantité à vendre</label>
                  <input
                    type="number"
                    min="1"
                    max={produitASelectionner.quantite_stock}
                    value={quantiteAVendre}
                    onChange={(e) => setQuantiteAVendre(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 font-semibold rounded-lg transition"
                  >
                    Valider la vente
                  </button>
                  <button
                    type="button"
                    onClick={() => setProduitASelectionner(null)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* GESTION AVANCÉE DES COMPTES (ADMIN ONLY) */}
          {isAdmin && (
            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg">
              <h2 className="text-lg font-semibold mb-3 flex items-center space-x-2 text-indigo-400">
                <Users size={20} />
                <span>Gestion des comptes</span>
              </h2>

              {userError && <p className="text-sm text-rose-400 mb-2">{userError}</p>}

              {/* Formulaire d'édition d'utilisateur */}
              {userEdit ? (
                <form onSubmit={handleSaveUserModifs} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600 space-y-3 mb-3">
                  <div className="flex justify-between items-center border-b border-slate-600 pb-2">
                    <span className="text-xs font-bold text-indigo-300">Édition : {userEdit.username}</span>
                    <button type="button" onClick={() => setUserEdit(null)} className="text-slate-400 hover:text-white">
                      <X size={16} />
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Rôle :</label>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value === 'true')}
                      className="w-full bg-slate-800 px-2 py-1.5 rounded text-sm border border-slate-600"
                    >
                      <option value="false">Vendeur</option>
                      <option value="true">Administrateur</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Nouveau mot de passe (optionnel) :</label>
                    <input
                      type="password"
                      placeholder="Laisser vide si inchangé"
                      value={editNewPass}
                      onChange={(e) => setEditNewPass(e.target.value)}
                      className="w-full bg-slate-800 px-2 py-1.5 rounded text-xs border border-slate-600"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button type="submit" className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold rounded">
                      Enregistrer
                    </button>
                    <button type="button" onClick={() => setUserEdit(null)} className="px-3 py-1.5 bg-slate-600 text-xs rounded">
                      Annuler
                    </button>
                  </div>
                </form>
              ) : null}

              {/* Liste des utilisateurs */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {usersList.map((u) => (
                  <div key={u.id} className="flex justify-between items-center p-2.5 bg-slate-700/60 rounded-lg text-sm border border-slate-600">
                    <div>
                      <p className="font-semibold">{u.username}</p>
                      <p className="text-xs text-slate-400">{u.is_staff ? 'Administrateur' : 'Vendeur'}</p>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleEditUserClick(u)}
                        className="p-1.5 text-amber-400 hover:bg-amber-950/50 rounded transition"
                        title="Modifier le rôle/mot de passe"
                      >
                        <Edit size={16} />
                      </button>

                      {/* On évite que l'admin se supprime lui-même ici */}
                      {u.username !== userLogged && (
                        <button
                          onClick={() => handleSupprimerUtilisateur(u.id, u.username)}
                          className="p-1.5 text-rose-400 hover:bg-rose-950/50 rounded transition"
                          title="Supprimer ce compte"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION DROITE */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* CATALOGUE PRODUITS */}
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-slate-200">Suivi des Stocks et Actions</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-slate-700/50 text-slate-400 border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Nom</th>
                    <th className="py-3 px-4">Prix</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">État</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {produits.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-700/30 transition">
                      <td className="py-3 px-4 font-semibold text-white">{p.nom}</td>
                      <td className="py-3 px-4 text-emerald-400 font-medium">{p.prix_vente} Ar</td>
                      <td className="py-3 px-4 font-bold">{p.quantite_stock}</td>
                      <td className="py-3 px-4">
                        {p.stock_insuffisant ? (
                          <span className="px-2 py-0.5 text-xs font-bold bg-rose-950 text-rose-400 rounded border border-rose-800">
                            ALERTE STOCK
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-xs font-bold bg-emerald-950 text-emerald-400 rounded border border-emerald-800">
                            DISPONIBLE
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => setProduitASelectionner(p)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded transition"
                        >
                          Vendre
                        </button>

                        {isAdmin && (
                          <>
                            <button
                              onClick={() => preparerModification(p)}
                              className="p-1.5 text-amber-400 hover:bg-amber-950/40 rounded transition"
                              title="Modifier"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleSupprimerProduit(p.id)}
                              className="p-1.5 text-rose-400 hover:bg-rose-950/40 rounded transition"
                              title="Supprimer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* HISTORIQUE VENTES */}
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-slate-200">
              Flux d'achats clients (Historique des ventes)
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-slate-700/50 text-slate-400 border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Produit</th>
                    <th className="py-3 px-4">Qté Vendue</th>
                    <th className="py-3 px-4">Recette Totale</th>
                    <th className="py-3 px-4">Vendeur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {ventes.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-700/30 transition">
                      <td className="py-3 px-4 font-semibold text-white">{v.produit_nom}</td>
                      <td className="py-3 px-4 text-indigo-400 font-bold">{v.quantite_vendue}</td>
                      <td className="py-3 px-4 text-amber-400 font-semibold">+{v.prix_total} Ar</td>
                      <td className="py-3 px-4 text-slate-400 font-medium">{v.fait_par_username}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

      {/* --- MODAL CHANGEMENT DE MOT DE PASSE PERSONNEL --- */}
      {showPassModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setShowPassModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold mb-4 flex items-center space-x-2 text-indigo-400">
              <Key size={20} />
              <span>Changer mon mot de passe</span>
            </h3>

            {passMsg.error && <p className="text-xs text-rose-400 mb-3">{passMsg.error}</p>}
            {passMsg.success && <p className="text-xs text-emerald-400 mb-3">{passMsg.success}</p>}

            <form onSubmit={handleChangeOwnPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Ancien mot de passe</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Nouveau mot de passe</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPassModal(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-semibold transition"
                >
                  Modifier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;