// server.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const uploadsDir = path.join(__dirname, 'uploads');
const productPagesBaseDir = path.join(__dirname, '..', 'glowna', 'produkt');
const productsFilePath = path.join(__dirname, 'produkty.json');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}
if (!fs.existsSync(productPagesBaseDir)) {
    fs.mkdirSync(productPagesBaseDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const productNameSlug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const productUploadDir = path.join(uploadsDir, productNameSlug);
        if (!fs.existsSync(productUploadDir)) {
            fs.mkdirSync(productUploadDir, { recursive: true });
        }
        cb(null, productUploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

function loadProducts() {
    if (fs.existsSync(productsFilePath)) {
        try {
            const data = fs.readFileSync(productsFilePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Błąd parsowania JSON z produkty.json:', error);
            return [];
        }
    }
    return [];
}

function saveProducts(products) {
    try {

        fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2), 'utf8');
    } catch (error) {
        console.error('Błąd zapisu produktów do produkty.json:', error);
    }
}

app.post('/api/products', upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'additionalImages', maxCount: 10 }
]), (req, res) => {
    const products = loadProducts();

    const { name, price, shortDescription, fullDescription, specifications } = req.body;

    const productSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const productPageDir = path.join(productPagesBaseDir, productSlug);

    if (!fs.existsSync(productPageDir)) {
        fs.mkdirSync(productPageDir, { recursive: true });
    }


    const mainImagePath = req.files['mainImage'] ?
        path.join('uploads', productSlug, path.basename(req.files['mainImage'][0].path)).replace(/\\/g, '/') : '';
    const additionalImagePaths = req.files['additionalImages'] ?
        req.files['additionalImages'].map(file =>
            path.join('uploads', productSlug, path.basename(file.path)).replace(/\\/g, '/')
        ) : [];


    const newProduct = {
        id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1, // Proste ID
        name,
        price: parseFloat(price),
        shortDescription,
        fullDescription,
        specifications: specifications ? specifications.split('\n').map(s => s.trim()).filter(s => s) : [],
        mainImage: mainImagePath,
        additionalImages: additionalImagePaths
    };

    products.push(newProduct);
    saveProducts(products);


    generateProductDetailPage(newProduct, productPageDir);

    res.status(201).json(newProduct); 
});


app.get('/api/products', (req, res) => {
    const products = loadProducts();
    res.json(products);
});


app.use('/backend/uploads', express.static(uploadsDir));


function generateProductDetailPage(product, productDir) {


    const mainImageHtmlPath = `../../../backend/${product.mainImage}`;
    const thumbnailsHtml = product.additionalImages.map(img => {
        const thumbHtmlPath = `../../../backend/${img}`;
        return `<img src="${thumbHtmlPath}" alt="${product.name} Thumbnail" data-full-image="${thumbHtmlPath}">`;
    }).join('');

    const specsHtml = product.specifications.map(spec => {
        const parts = spec.split(':');
        return `<li><b>${parts[0].trim()}:</b> ${parts.slice(1).join(':').trim()}</li>`;
    }).join('');

    const htmlContent = `
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>76r76 - WIKSAS</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link rel="stylesheet" href="../../../glowna/style.css"> 
    <link rel="icon" type="image/x-icon" href="../../logo.png">
    <script src="script.js"></script> </head>
<body>

    <header>
        <div class="header-left">
            <div class="logo">
                <a href="../../../glowna/index.html"> <img src="../../logo.png" alt="WIKSAS Logo"> </a>
                <span class="logo-text">Wiksas <br> twój sklep</span>
            </div>
        </div>
        <div class="search-container">
            <div class="search-input-group">
                <input type="text" placeholder="Czego szukasz?">
            </div>
            <button class="search-button">
                <i class="fas fa-search"></i>
            </button>
        </div>
        <div class="header-right">
            <div class="user-info">
                Cześć, <br> zaloguj się
            </div>
            <div class="icons-group">
                <i class="fas fa-user"></i>
                <i class="fas fa-shopping-cart"></i>
            </div>
        </div>
    </header>

    <main class="product-detail-page">
        <div class="product-detail-container">
            <div class="product-image-gallery">
                <img src="${mainImageHtmlPath}" alt="${product.name} Main Image" id="mainProductImage">
                <div class="thumbnail-gallery">
                    <img src="${mainImageHtmlPath}" alt="${product.name} Main Image" data-full-image="${mainImageHtmlPath}">
                    ${thumbnailsHtml}
                </div>
            </div>
            <div class="product-info">
                <h1>${product.name}</h1>
                <p class="product-price">${product.price.toFixed(2)} zł</p>

                <div class="product-short-description">
                    <p>${product.shortDescription}</p>
                </div>

                <div class="product-actions">
                    <button class="add-to-cart-lg" data-product-id="${product.id}">Dodaj do koszyka <i class="fas fa-shopping-cart"></i></button>
                </div>

                <div class="product-specs">
                    <h2>Specyfikacja:</h2>
                    <ul>
                        ${specsHtml}
                    </ul>
                </div>
                <div class="product-description-full">
                    <h2>Szczegółowy opis:</h2>
                    <p>${product.fullDescription}</p>
                </div>
            </div>
        </div>
    </main>

    <footer>
        &copy; 2025 WIKSAS. Wszelkie prawa zastrzeżone.
    </footer>

</body>
</html>
    `;

    // Zapisz wygenerowany HTML do pliku index.html w katalogu produktu
    fs.writeFileSync(path.join(productDir, 'index.html'), htmlContent, 'utf8');

    // Generuj i zapisz script.js dla strony produktu (obsługa galerii miniaturek)
    const scriptContent = `
document.addEventListener('DOMContentLoaded', function() {
    const mainImage = document.getElementById('mainProductImage');

    if (mainImage) {
        const thumbnails = document.querySelectorAll('.thumbnail-gallery img');

        if (thumbnails.length > 0) {
            thumbnails[0].classList.add('active');
        }

        thumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', function() {
                mainImage.src = this.dataset.fullImage;

                // Usuń klasę 'active' ze wszystkich miniaturek, a następnie dodaj do klikniętej
                thumbnails.forEach(thumb => thumb.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }
});
    `;
    fs.writeFileSync(path.join(productDir, 'script.js'), scriptContent, 'utf8');
}


app.listen(PORT, () => {
    console.log(`Serwer Node.js działa na porcie ${PORT}`);
});