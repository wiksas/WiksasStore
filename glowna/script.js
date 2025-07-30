
async function fetchProducts() {
    try {
        const response = await fetch('http://localhost:3000/api/products');
        if (!response.ok) {
            throw new Error(`Błąd HTTP: ${response.status} ${response.statusText}`);
        }
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Błąd ładowania produktów:', error);
        const productListings = document.getElementById('product-listings');
        if (productListings) {
            productListings.innerHTML = '<p>Błąd ładowania produktów. Spróbuj odświeżyć stronę lub skontaktuj się z administratorem.</p>';
        }
    }
}

function displayProducts(products) {
    const productListings = document.getElementById('product-listings');
    if (!productListings) {
        console.error("Element #product-listings nie został znaleziony w DOM.");
        return;
    }
    productListings.innerHTML = '';

    if (products.length === 0) {
        productListings.innerHTML = '<p>Brak dostępnych produktów.</p>';
        return;
    }

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');

        const productSlug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

        const imageUrl = `http://localhost:3000/backend/${product.mainImage}`;
        const productPageUrl = `./produkt/${productSlug}/index.html`;

        productCard.innerHTML = `
            <a href="${productPageUrl}" class="product-link">
                <img src="${imageUrl}" alt="${product.name}" class="product-image">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">${product.price.toFixed(2)} zł</p>
                <p class="product-description">${product.shortDescription}</p>
            </a>
            <button class="add-to-cart-button" data-product-id="${product.id}">Dodaj do koszyka</button>
        `;
        productListings.appendChild(productCard);
    });
}



document.addEventListener('DOMContentLoaded', fetchProducts);