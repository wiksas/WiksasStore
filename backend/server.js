// backend/server.js

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const PRODUCTS_FILE = path.join(__dirname, 'produkty.json');


if (!fs.existsSync(PRODUCTS_FILE)) {
    fs.writeFileSync(PRODUCTS_FILE, '[]', 'utf8');
    console.log('Utworzono pusty plik produkty.json w folderze backend.');
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const slug = req.body.slug || 'temp-product';
        const uploadPath = path.join(__dirname, 'uploads', slug);
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });



app.get('/api/products', (req, res) => {
    fs.readFile(PRODUCTS_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error('Błąd odczytu produktów:', err);
            return res.status(500).json({ message: 'Błąd serwera podczas odczytu produktów.' });
        }
        try {
            res.json(JSON.parse(data));
        } catch (parseError) {
            console.error('Błąd parsowania JSON z produkty.json:', parseError);
            return res.status(500).json({ message: 'Błąd serwera: Nieprawidłowy format pliku produktów.' });
        }
    });
});


app.post('/api/products', upload.fields([
    { name: 'mainImage', maxCount: 1 }, 
    { name: 'additionalImages', maxCount: 5 }
]), (req, res) => {
    const { name, price, shortDescription, fullDescription, specs, slug } = req.body;

    if (!slug) {
        console.error('Błąd: Slug produktu jest wymagany!');
        return res.status(400).json({ message: 'Błąd: Slug produktu jest wymagany.' });
    }


    const mainImage = req.files && req.files['mainImage'] && req.files['mainImage'][0] ? `/uploads/${slug}/${req.files['mainImage'][0].originalname}` : null;
    const additionalImages = req.files && req.files['additionalImages'] ?
        req.files['additionalImages'].map(file => `/uploads/${slug}/${file.originalname}`) : [];


    fs.readFile(PRODUCTS_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error('Błąd odczytu produktów przed dodaniem:', err);
            return res.status(500).json({ message: 'Błąd serwera.' });
        }

        let products = [];
        try {
            products = JSON.parse(data);
        } catch (parseError) {
            console.error('Błąd parsowania istniejącego JSON produktów:', parseError);
            return res.status(500).json({ message: 'Błąd serwera: Nieprawidłowy format pliku produktów.' });
        }
        if (products.some(p => p.slug === slug)) {
            return res.status(409).json({ message: 'Produkt z tym slugiem już istnieje.' });
        }

        const newProduct = {
            id: Date.now(),
            name,
            price: parseFloat(price),
            mainImage,
            additionalImages,
            shortDescription,
            fullDescription,
            specs: specs ? specs.split('\n').map(s => s.trim()).filter(s => s.length > 0) : [],
            slug 
        };

        products.push(newProduct);
        fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('Błąd zapisu produktów:', err);
                return res.status(500).json({ message: 'Błąd zapisu produktu.' });
            }
            res.status(201).json(newProduct);
        });
    });
});

app.listen(PORT, () => {
    console.log(`Serwer Node.js działa na porcie ${PORT}`);
});