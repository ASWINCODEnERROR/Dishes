(function () {
    'use strict';

    // Initialize AOS
    AOS.init({
        duration: 800,
        easing: 'slide',
        once: true
    });

    // Preloader function
    var preloader = function() {
        var loader = document.querySelector('.loader');
        var overlay = document.getElementById('overlayer');

        // Check if loader and overlay exist
        if (!loader || !overlay) {
            console.error('Loader or overlay element not found');
            return; // Exit the function if elements are not found
        }

        // Fade out function
        function fadeOut(el) {
            el.style.opacity = 1; // Start with full opacity
            (function fade() {
                // Decrease opacity
                if ((el.style.opacity -= .1) < 0) {
                    el.style.display = "none"; // Hide element when opacity is 0
                } else {
                    requestAnimationFrame(fade); // Continue fading
                }
            })();
        }

        // Start fade out after a delay
        setTimeout(function() {
            fadeOut(loader);
            fadeOut(overlay);
        }, 200);
    };

    // Execute preloader
    preloader();

    // Tiny Slider initialization
    var tinyslider = function() {
        var slider = document.querySelectorAll('.features-slider');
        var postSlider = document.querySelectorAll('.post-slider');
        var testimonialSlider = document.querySelectorAll('.testimonial-slider');

        // Initialize features slider
        if (slider.length > 0) {
            tns({
                container: '.features-slider',
                mode: 'carousel',
                speed: 700,
                items: 3,
                gutter: 30,
                loop: false,
                edgePadding: 80,
                controlsContainer: '#features-slider-nav',
                nav: false,
                responsive: {
                    0: { items: 1 },
                    700: { items: 2 },
                    900: { items: 3 }
                }
            });
        }

        // Initialize post slider
        if (postSlider.length > 0) {
            tns({
                container: '.post-slider',
                mode: 'carousel',
                speed: 700,
                items: 3,
                gutter: 30,
                loop: true,
                edgePadding: 10,
                controlsContainer: '#post-slider-nav',
                nav: true,
                autoplay: true,
                autoplayButtonOutput: false,
                responsive: {
                    0: { items: 1 },
                    700: { items: 2 },
                    900: { items: 3 }
                }
            });
        }

        // Initialize testimonial slider
        if (testimonialSlider.length > 0) {
            tns({
                container: '.testimonial-slider',
                mode: 'carousel',
                speed: 700,
                items: 1,
                gutter: 30,
                loop: true,
                edgePadding: 10,
                controlsContainer: '#testimonial-slider-nav',
                nav: true,
                autoplay: true,
                autoplayButtonOutput: false,
                controls: false,
                responsive: {
                    0: { items: 1 },
                    700: { items: 1 },
                    900: { items: 1 }
                }
            });
        }
    };

    // Execute Tiny Slider
    tinyslider();

    // GLightbox initialization for videos
    var lightboxVideo = GLightbox({
        selector: '.glightbox'
    });

})();
