import './Autocomplete.css';
import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';

export default function Autocomplete({
  type,
  placeholder,
  selectedItems,
  setSelectedItems,
  suggestMode = false,
  dataSource,
  template,
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [localData, setLocalData] = useState([]);
  const [suggestedText, setSuggestedText] = useState('');
  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (type === 'local' && dataSource) {
      fetch(dataSource)
        .then((response) => response.json())
        .then((data) => setLocalData(data))
        .catch((err) => console.error('Erreur de chargement JSON:', err));
    }
  }, [type, dataSource]);

  const fetchData = async (baseUrl, searchQuery) => {
    let page = 1;
    let allData = [];

    while (true) {
      const response = await fetch(`${baseUrl}/${page}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const result = await response.json();
      const data = result.data || [];

      if (data.length === 0) break;
      allData = [...allData, ...data];
      page += 1;
    }

    return allData.filter((item) =>
      baseUrl.includes('user')
        ? item.firstName.toLowerCase().startsWith(searchQuery.toLowerCase()) ||
          item.lastName.toLowerCase().startsWith(searchQuery.toLowerCase())
        : item.name.toLowerCase().startsWith(searchQuery.toLowerCase())
    );
  };

  useEffect(() => {
    if (query) {
      if (type === 'local') {
        const results = localData.filter((item) =>
          item.firstName
            ? item.firstName.toLowerCase().startsWith(query.toLowerCase()) ||
              item.lastName.toLowerCase().startsWith(query.toLowerCase())
            : item.name.toLowerCase().startsWith(query.toLowerCase())
        );
        setResults(results);
        setShowResults(!suggestMode);
        if (suggestMode && results.length > 0)
          setSuggestedText(results[0].name || '');
      } else if (type === 'combined') {
        Promise.all([
          fetchData('http://localhost:3000/user', query),
          fetchData('http://localhost:3000/product', query),
        ]).then(([userResults, productResults]) => {
          setResults([...userResults, ...productResults]);
          setShowResults(!suggestMode);
          if (suggestMode && [...userResults, ...productResults].length > 0) {
            setSuggestedText([...userResults, ...productResults][0].name || '');
          }
        });
      } else {
        const baseUrl =
          type === 'user'
            ? 'http://localhost:3000/user'
            : 'http://localhost:3000/product';
        fetchData(baseUrl, query).then((results) => {
          setResults(results);
          setShowResults(!suggestMode);
          if (suggestMode && results.length > 0)
            setSuggestedText(results[0].name || '');
        });
      }
    } else {
      setResults([]);
      setShowResults(false);
      setSuggestedText('');
    }
  }, [query, type, localData, suggestMode]);

  const handleKeyDown = (e) => {
    if (e.key === 'Tab' && suggestedText) {
      e.preventDefault();
      setQuery(suggestedText);
      setSuggestedText('');
    }
  };

  const handleSelectItem = (item) => {
    setSelectedItems([...selectedItems, item]);
    setQuery('');
    setResults([]);
    setShowResults(false);
    setSuggestedText('');
  };

  const handleClickOutside = (event) => {
    if (
      autocompleteRef.current &&
      !autocompleteRef.current.contains(event.target)
    ) {
      setShowResults(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="autocomplete-container" ref={autocompleteRef}>
      <div className="input-wrapper">
        <div className="selected-tags">
          {selectedItems.map((item, index) => (
            <span key={index} className="tag">
              {item.firstName
                ? `${item.firstName} ${item.lastName}`
                : item.name}
              <FontAwesomeIcon
                icon={faTimes}
                onClick={() =>
                  setSelectedItems(selectedItems.filter((_, i) => i !== index))
                }
                className="remove-icon"
              />
            </span>
          ))}
          <input
            className="autocomplete-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              suggestMode && suggestedText
                ? `${placeholder} (Suggestion : ${suggestedText})`
                : placeholder
            }
            onFocus={() => setShowResults(!suggestMode)}
            onKeyDown={handleKeyDown}
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
        </div>
        {showResults && results.length > 0 && !suggestMode && (
          <div className="autocomplete-results">
            {results.map((item) =>
              template ? (
                <div
                  key={item.id || item.name}
                  onClick={() => handleSelectItem(item)}>
                  {template(item)}
                </div>
              ) : (
                <div
                  key={item.id || item.name}
                  className="autocomplete-item"
                  onClick={() => handleSelectItem(item)}>
                  <strong>
                    {item.firstName
                      ? `${item.firstName} ${item.lastName}`
                      : item.name}
                  </strong>
                  {item.price && <span className="price">{item.price} €</span>}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
