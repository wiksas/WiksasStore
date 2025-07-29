// sklep/produkt/script.js (jeden skrypt dla wszystkich stron produktów)

document.addEventListener('DOMContentLoaded', async () => {
    const productDetailContent = document.getElementById('productDetailContent'); // Ten element jest kluczowy

    if (!productDetailContent) {
        console.error('Błąd: Element #productDetailContent nie znaleziony.');
        return;
    }

    productDetailContent.innerHTML = '<p style="text-align: center;">Ładowanie szczegółów produktu...</p>';

    // Pobierz slug z URL
    const urlParams = new URLSearchParams(window.location.search);
    let productSlug = urlParams.get('slug'); // Spróbuj pobrać slug z parametru URL (np. ?slug=laptop-acer)

    // Alternatywnie, jeśli używasz folderów:
    if (!productSlug) {
        const pathParts = window.location.pathname.split('/');
        // Zakładamy, że URL wygląda np. /sklep/produkt/laptop-acer/index.html
        // Potrzebujemy "laptop-acer"
        // Szukamy folderu, który jest ostatni przed index.html
        // Przykładowo, jeśli pathParts = ["", "sklep", "produkt", "laptop-acer", "index.html"]
        // productSlug będzie pathParts[pathParts.length - 2]
        if (pathParts[pathParts.length - 1] === 'index.html' && pathParts.length >= 2) {
            productSlug = pathParts[pathParts.length - 2];
        }
    }

    if (!productSlug) {
        productDetailContent.innerHTML = '<p style="color: red; text-align: center;">Błąd: Nie znaleziono identyfikatora produktu w adresie URL.</p>';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/products');
        if (!response.ok) {
            throw new Error(`Błąd HTTP: ${response.status} ${response.statusText}`);
        }
        const products = await response.json();
        const product = products.find(p => p.slug === productSlug);

        if (product) {
            productDetailContent.innerHTML = `
                <div class="product-gallery">
                    <img id="mainProductImage" src="http://localhost:3000${product.mainImage}" alt="${product.name}" class="main-product-image">
                    <div class="thumbnail-gallery">
                        ${product.additionalImages.map(img => `
                            <img src="http://localhost:3000${img}" alt="${product.name} thumbnail" class="thumbnail" onclick="changeMainImage('${img}')">
                        `).join('')}
                    </div>
                </div>
                <div class="product-info">
                    <h2>${product.name}</h2>
                    <p class="price">${product.price.toFixed(2)} zł</p>
                    <p class="short-description">${product.shortDescription}</p>
                    <h3>Pełny opis:</h3>
                    <p class="full-description">${product.fullDescription}</p>
                    <h3>Specyfikacja:</h3>
                    <ul class="specs-list">
                        ${product.specs.map(spec => `<li>${spec}</li>`).join('')}
                    </ul>
                    <button class="add-to-cart-btn">Dodaj do koszyka</button>
                </div>
            `;

            window.changeMainImage = function(newImageUrl) {
                const mainImage = document.getElementById('mainProductImage');
                if (mainImage) {
                    mainImage.src = `http://localhost:3000${newImageUrl}`;
                }
            };

        } else {
            productDetailContent.innerHTML = '<p style="color: red; text-align: center;">Produkt nie znaleziony.</p>';
        }

    } catch (error) {
        console.error('Błąd ładowania szczegółów produktu:', error);
        productDetailContent.innerHTML = `<p style="color: red; text-align: center;">Błąd ładowania: ${error.message}</p>`;
    }
});