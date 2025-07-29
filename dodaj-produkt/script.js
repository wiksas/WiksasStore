// sklep/dodaj-produkt/script.js
document.addEventListener('DOMContentLoaded', () => {
    // Odwołania do elementów HTML na podstawie ich ID
    const addProductForm = document.getElementById('addProductForm'); // Zmienione ID formularza
    const statusMessage = document.getElementById('message');         // Zmienione ID wiadomości statusu
    const additionalImagesContainer = document.getElementById('additionalImagesContainer'); // Zmienione ID kontenera
    const addAdditionalImageBtn = document.getElementById('addMoreImages'); // Zmienione ID przycisku

    let additionalImageCount = 0; // Zaczynamy od 0, bo pierwsze pole już istnieje w HTML z id=_0

    // Obsługa dynamicznego dodawania pól na dodatkowe zdjęcia
    if (addAdditionalImageBtn) {
        addAdditionalImageBtn.addEventListener('click', () => {
            if (additionalImageCount < 4) { // Ogranicz do 5 dodatkowych zdjęć (0 do 4)
                additionalImageCount++; // Inkrementuj licznik
                const div = document.createElement('div');
                div.classList.add('form-group', 'additional-image-group'); // Dodajemy klasy
                div.innerHTML = `
                    <label for="additionalImageFile_${additionalImageCount}">Dodatkowe Zdjęcie ${additionalImageCount + 1} (plik):</label>
                    <input type="file" id="additionalImageFile_${additionalImageCount}" name="additionalImages" accept="image/*">
                    <small style="color: #888; display: block; margin-top: 5px;">(Zdjęcie do galerii produktu)</small>
                `;
                additionalImagesContainer.appendChild(div);
            } else {
                alert('Możesz dodać maksymalnie 5 dodatkowych zdjęć.');
            }
        });
    }

    // Obsługa wysyłania formularza
    if (addProductForm) {
        addProductForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // ZATRZYMUJE domyślne działanie formularza (przeładowanie strony)

            statusMessage.textContent = 'Dodawanie produktu...';
            statusMessage.style.color = 'orange';

            const formData = new FormData();
            
            // Pobieranie wartości z pól formularza - ZMIENIONE NA NOWE ATTRYBUTY NAME
            formData.append('name', addProductForm.productName.value);
            formData.append('price', addProductForm.productPrice.value);
            formData.append('shortDescription', addProductForm.productShortDesc.value);
            formData.append('fullDescription', addProductForm.productFullDesc.value);
            formData.append('specs', addProductForm.productSpecs.value);
            // Generowanie sluga z nazwy produktu
            formData.append('slug', generateSlug(addProductForm.productName.value));

            // Dodaj główne zdjęcie
            // WAŻNE: 'mainImageFile' to teraz nazwa z HTML
            if (addProductForm.mainImageFile.files && addProductForm.mainImageFile.files[0]) {
                formData.append('mainImage', addProductForm.mainImageFile.files[0]); // Nazwa 'mainImage' musi zgadzać się z Multerem na backendzie
            } else {
                statusMessage.textContent = 'Błąd: Główne zdjęcie jest wymagane.';
                statusMessage.style.color = 'red';
                return; // Zatrzymaj wysyłanie formularza, jeśli brak głównego zdjęcia
            }

            // Dodaj dodatkowe zdjęcia
            // Iterujemy przez dynamicznie dodane pola oraz to pierwsze, które jest w HTMLu
            for (let i = 0; i <= additionalImageCount; i++) {
                const input = document.getElementById(`additionalImageFile_${i}`); // Zmienione ID
                if (input && input.files && input.files[0]) {
                    formData.append('additionalImages', input.files[0]); // Nazwa 'additionalImages' musi zgadzać się z Multerem na backendzie
                }
            }

            try {
                const response = await fetch('http://localhost:3000/api/products', {
                    method: 'POST',
                    body: formData // FormData automatycznie ustawia Content-Type: multipart/form-data
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Błąd HTTP: ${response.status} ${response.statusText}`);
                }

                const newProduct = await response.json();
                statusMessage.textContent = 'Produkt dodany pomyślnie!';
                statusMessage.style.color = 'green';
                addProductForm.reset(); // Wyczyść formularz
                
                // Zresetuj pola dodatkowych zdjęć do początkowego stanu (tylko jedno pole)
                additionalImagesContainer.innerHTML = `
                    <div class="form-group additional-image-group">
                        <label for="additionalImageFile_0">Dodatkowe Zdjęcie 1 (plik):</label>
                        <input type="file" id="additionalImageFile_0" name="additionalImages" accept="image/*">
                        <small style="color: #888; display: block; margin-top: 5px;">(Zdjęcie do galerii produktu)</small>
                    </div>
                `;
                additionalImageCount = 0; // Zresetuj licznik
                
            } catch (error) {
                console.error('Błąd dodawania produktu:', error);
                statusMessage.textContent = `Błąd: ${error.message}`;
                statusMessage.style.color = 'red';
            }
        });
    }

    // Funkcja do generowania sluga
    function generateSlug(name) {
        return name
            .toString()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-');
    }
});