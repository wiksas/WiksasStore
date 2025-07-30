
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
    