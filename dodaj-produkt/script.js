document.addEventListener('DOMContentLoaded', () => {
    const addProductForm = document.getElementById('addProductForm');
    const statusMessage = document.getElementById('message');
    const additionalImagesContainer = document.getElementById('additionalImagesContainer');
    const addAdditionalImageBtn = document.getElementById('addMoreImages');
    let additionalImageCount = 0;


    if (addAdditionalImageBtn) {
        addAdditionalImageBtn.addEventListener('click', () => {
            if (additionalImageCount < 4) {
                additionalImageCount++;
                const div = document.createElement('div');
                div.classList.add('form-group', 'additional-image-group');
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

    if (addProductForm) {
        addProductForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            statusMessage.textContent = 'Dodawanie produktu...';
            statusMessage.style.color = 'orange';

            const formData = new FormData();
            
            formData.append('name', addProductForm.productName.value);
            formData.append('price', addProductForm.productPrice.value);
            formData.append('shortDescription', addProductForm.productShortDesc.value);
            formData.append('fullDescription', addProductForm.productFullDesc.value);
            formData.append('specifications', addProductForm.productSpecs.value);
            formData.append('slug', generateSlug(addProductForm.productName.value));


            if (addProductForm.mainImageFile.files && addProductForm.mainImageFile.files[0]) {
                formData.append('mainImage', addProductForm.mainImageFile.files[0]);
            } else {
                statusMessage.textContent = 'Błąd: Główne zdjęcie jest wymagane.';
                statusMessage.style.color = 'red';
                return;
            }

            for (let i = 0; i <= additionalImageCount; i++) {
                const input = document.getElementById(`additionalImageFile_${i}`);
                if (input && input.files && input.files[0]) {
                    formData.append('additionalImages', input.files[0]);
                }
            }

            try {
                const response = await fetch('http://localhost:3000/api/products', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Błąd HTTP: ${response.status} ${response.statusText}`);
                }

                const newProduct = await response.json();
                statusMessage.textContent = 'Produkt dodany pomyślnie!';
                statusMessage.style.color = 'green';
                addProductForm.reset();

                additionalImagesContainer.innerHTML = `
                    <div class="form-group additional-image-group">
                        <label for="additionalImageFile_0">Dodatkowe Zdjęcie 1 (plik):</label>
                        <input type="file" id="additionalImageFile_0" name="additionalImages" accept="image/*">
                        <small style="color: #888; display: block; margin-top: 5px;">(Zdjęcie do galerii produktu)</small>
                    </div>
                `;
                additionalImageCount = 0;
                
            } catch (error) {
                console.error('Błąd dodawania produktu:', error);
                statusMessage.textContent = `Błąd: ${error.message}`;
                statusMessage.style.color = 'red';
            }
        });
    }

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