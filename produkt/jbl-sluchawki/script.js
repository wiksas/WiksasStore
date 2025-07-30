document.addEventListener('DOMContentLoaded', function() {
    const mainImage = document.getElementById('mainProductImage');

    if (mainImage) {
        const thumbnails = document.querySelectorAll('.thumbnail-gallery img');

        thumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', function() {
                mainImage.src = this.dataset.fullImage;

                thumbnails.forEach(thumb => thumb.classList.remove('active'));
                this.classList.add('active');
            });
        });

        if (thumbnails.length > 0) {
            thumbnails[0].classList.add('active');
        }
    }
});