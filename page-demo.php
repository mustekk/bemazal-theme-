<?php
/**
 * Template Name: Demo Page
 *
 * Demo page to test all theme features: Swiper, Fancybox, and Masonry
 *
 * @package Bemazal
 */

get_header();
?>

<main class="site-main container py-5">
    <h1 class="mb-5">Bemazal Theme Demo</h1>

    <!-- Swiper Demo -->
    <section class="mb-5">
        <h2 class="mb-3">Swiper Slider Demo</h2>
        <div class="swiper" style="max-width: 800px;">
            <div class="swiper-wrapper">
                <div class="swiper-slide">
                    <div class="p-5 bg-primary text-white text-center">
                        <h3>Slide 1</h3>
                        <p>This is a Swiper slider with navigation and pagination</p>
                    </div>
                </div>
                <div class="swiper-slide">
                    <div class="p-5 bg-success text-white text-center">
                        <h3>Slide 2</h3>
                        <p>Swiper is working correctly!</p>
                    </div>
                </div>
                <div class="swiper-slide">
                    <div class="p-5 bg-info text-white text-center">
                        <h3>Slide 3</h3>
                        <p>All modules are loaded</p>
                    </div>
                </div>
            </div>
            <div class="swiper-button-prev"></div>
            <div class="swiper-button-next"></div>
            <div class="swiper-pagination"></div>
        </div>
    </section>

    <!-- Fancybox Demo -->
    <section class="mb-5">
        <h2 class="mb-3">Fancybox Lightbox Demo</h2>
        <div class="row">
            <div class="col-md-4">
                <a href="https://via.placeholder.com/1200x800/FF5733/FFFFFF?text=Image+1" data-fancybox="gallery">
                    <img src="https://via.placeholder.com/400x300/FF5733/FFFFFF?text=Image+1" class="img-fluid" alt="Demo Image 1">
                </a>
            </div>
            <div class="col-md-4">
                <a href="https://via.placeholder.com/1200x800/33FF57/FFFFFF?text=Image+2" data-fancybox="gallery">
                    <img src="https://via.placeholder.com/400x300/33FF57/FFFFFF?text=Image+2" class="img-fluid" alt="Demo Image 2">
                </a>
            </div>
            <div class="col-md-4">
                <a href="https://via.placeholder.com/1200x800/3357FF/FFFFFF?text=Image+3" data-fancybox="gallery">
                    <img src="https://via.placeholder.com/400x300/3357FF/FFFFFF?text=Image+3" class="img-fluid" alt="Demo Image 3">
                </a>
            </div>
        </div>
    </section>

    <!-- Masonry Demo -->
    <section class="mb-5">
        <h2 class="mb-3">Masonry Grid Demo</h2>
        <div class="masonry-grid">
            <div class="masonry-sizer"></div>
            <div class="masonry-item" style="width: 33.333%;">
                <div class="card">
                    <div class="card-body bg-light">
                        <h5 class="card-title">Item 1</h5>
                        <p class="card-text">This is a masonry grid layout.</p>
                    </div>
                </div>
            </div>
            <div class="masonry-item" style="width: 33.333%;">
                <div class="card">
                    <div class="card-body bg-light">
                        <h5 class="card-title">Item 2</h5>
                        <p class="card-text">Items are automatically positioned in an optimal layout. This item has more text to demonstrate variable heights.</p>
                    </div>
                </div>
            </div>
            <div class="masonry-item" style="width: 33.333%;">
                <div class="card">
                    <div class="card-body bg-light">
                        <h5 class="card-title">Item 3</h5>
                        <p class="card-text">Masonry is working!</p>
                    </div>
                </div>
            </div>
            <div class="masonry-item" style="width: 33.333%;">
                <div class="card">
                    <div class="card-body bg-light">
                        <h5 class="card-title">Item 4</h5>
                        <p class="card-text">Fourth item with different content length to show the grid adapts.</p>
                    </div>
                </div>
            </div>
            <div class="masonry-item" style="width: 33.333%;">
                <div class="card">
                    <div class="card-body bg-light">
                        <h5 class="card-title">Item 5</h5>
                        <p class="card-text">Fifth item.</p>
                    </div>
                </div>
            </div>
            <div class="masonry-item" style="width: 33.333%;">
                <div class="card">
                    <div class="card-body bg-light">
                        <h5 class="card-title">Item 6</h5>
                        <p class="card-text">Last item in the grid. All JavaScript libraries are initialized correctly!</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Bootstrap Components -->
    <section class="mb-5">
        <h2 class="mb-3">Bootstrap Components</h2>
        <button class="btn btn-primary">Primary Button</button>
        <button class="btn btn-success">Success Button</button>
        <button class="btn btn-info">Info Button</button>
        <div class="alert alert-success mt-3">Bootstrap 5 is loaded and working!</div>
    </section>
</main>

<?php get_footer(); ?>
