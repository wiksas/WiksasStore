// sklep/glowna/script.js
document.addEventListener('DOMContentLoaded', () => {
    const productListings = document.getElementById('product-listings');

    if (!productListings) {
        console.error('Błąd: Element #product-listings nie znaleziony.');
        return;
    }

    // Funkcja do pobierania i wyświetlania produktów
    async function fetchProducts() {
        productListings.innerHTML = '<p class="loading-message">Ładowanie produktów...</p>'; // Komunikat ładowania
        try {
            const response = await fetch('http://localhost:3000/api/products'); // Adres API backendu
            if (!response.ok) {
                // Jeśli odpowiedź nie jest OK (np. 404, 500), rzuć błąd
                throw new Error(`Błąd HTTP: ${response.status} ${response.statusText}`);
            }
            const products = await response.json(); // Parsuj odpowiedź jako JSON

            productListings.innerHTML = ''; // Wyczyść komunikat ładowania

            if (products.length === 0) {
                productListings.innerHTML = '<p class="no-products-message">Brak dostępnych produktów.</p>';
                return;
            }

            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.classList.add('product-card');


                const imageUrl = `http://localhost:3000${product.mainImage}`;

                const productDetailPageUrl = `../produkt/${product.slug}/index.html`;

                productCard.innerHTML = `
                    <a href="${productDetailPageUrl}" class="product-link">
                        <img src="${imageUrl}" alt="${product.name}" class="product-image">
                        <h3 class="product-name">${product.name}</h3>
                        <p class="product-price">${product.price.toFixed(2)} zł</p>
                        <p class="product-description">${product.shortDescription}</p>
                    </a>
                    <button class="add-to-cart-button">Dodaj do koszyka</button>
                `;
                productListings.appendChild(productCard);
            });
        } catch (error) {
            console.error('Błąd ładowania produktów:', error);
            productListings.innerHTML = `<p class="error-message">Błąd: ${error.message}. Spróbuj odświeżyć stronę lub skontaktuj się z administratorem.</p>`;
        }
    }

    fetchProducts(); // Wywołaj funkcję po załadowaniu DOM
});