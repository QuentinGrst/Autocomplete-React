import React, { useState } from 'react';
import './main.css';
import ReactDOM from 'react-dom';
import Autocomplete from './Components/Autocomplete';

function App() {
  const [userSelection, setUserSelection] = useState([]);
  const [productSelection, setProductSelection] = useState([]);
  const [combinedSelection, setCombinedSelection] = useState([]);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [selectedTemplateProducts, setSelectedTemplateProducts] = useState([]);

  const productTemplate = (item) => (
    <div>
      <strong>{item.name}</strong>
      <p>{item.price} €</p>
      <small>{item.description}</small>
    </div>
  );

  return (
    <div>
      <h2>Recherche Utilisateur</h2>
      <Autocomplete
        type="user"
        placeholder="Rechercher un utilisateur..."
        selectedItems={userSelection}
        setSelectedItems={setUserSelection}
      />

      <h2>Recherche Produit</h2>
      <Autocomplete
        type="product"
        placeholder="Rechercher un produit..."
        selectedItems={productSelection}
        setSelectedItems={setProductSelection}
      />

      <h2>Recherche Combinée</h2>
      <Autocomplete
        type="combined"
        placeholder="Rechercher dans utilisateurs et produits..."
        selectedItems={combinedSelection}
        setSelectedItems={setCombinedSelection}
      />

      <h2>Recherche Produit avec Template</h2>
      <Autocomplete
        type="product"
        placeholder="Rechercher un produit avec modèle..."
        selectedItems={selectedTemplateProducts}
        setSelectedItems={setSelectedTemplateProducts}
        template={productTemplate}
      />

      <h2>Recherche Produit avec Suggestion</h2>
      <Autocomplete
        type="product"
        placeholder="Tapez pour obtenir une suggestion..."
        selectedItems={suggestedProducts}
        setSelectedItems={setSuggestedProducts}
        suggestMode={true}
      />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
