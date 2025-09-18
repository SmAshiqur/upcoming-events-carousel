<?php
/*
Plugin Name: Upcoming Events Carousel
Plugin URI: https://masjidsolutions.net/
Description: A plugin to display upcoming events as a carousel using data from a secure API.
Version: 2.0.1
Requires at least: 6.4.1
Requires PHP: 7.2
Author: MASJIDSOLUTIONS
Author URI: https://masjidsolutions.net/
License: GPL2
License URI: http://www.gnu.org/licenses/gpl-2.0.html
Text Domain: uec
GitHub Plugin URI: SmAshiqur/upcoming-events-carousel
*/

if (!defined('ABSPATH')) {
    exit;
}

// Plugin Update Checker
require_once plugin_dir_path(__FILE__) . 'lib/plugin-update-checker-master/plugin-update-checker.php';
use YahnisElsts\PluginUpdateChecker\v5\PucFactory;

$updateChecker = PucFactory::buildUpdateChecker(
    'https://github.com/SmAshiqur/upcoming-events-carousel',
    __FILE__,
    'upcoming-events-carousel'
);

// Set the branch (change to 'master' if that's your default branch)
$updateChecker->setBranch('main');

// Enable release assets if you plan to use GitHub releases
$updateChecker->getVcsApi()->enableReleaseAssets();

function upcoming_events_enqueue_scripts() {
    // Enqueue Swiper.js carousel library
    wp_enqueue_style('swiper-style', 'https://unpkg.com/swiper/swiper-bundle.min.css');
    wp_enqueue_script('swiper-script', 'https://unpkg.com/swiper/swiper-bundle.min.js', [], null, true);

    // Enqueue custom JavaScript
    wp_enqueue_script('upcoming-events-script', plugin_dir_url(__FILE__) . 'upcoming-events.js', ['jquery'], null, true);

    // Enqueue custom CSS
    wp_enqueue_style('upcoming-events-style', plugin_dir_url(__FILE__) . 'upcoming-events.css');
}
add_action('wp_enqueue_scripts', 'upcoming_events_enqueue_scripts');

function upcoming_events_shortcode($atts) {
    // Extract the company slug and link status from shortcode attributes
    $atts = shortcode_atts([
        'company' => 'default-company',
        'link'    => 'open' // Default to 'open'
    ], $atts, 'upcoming_events_carousel');

    $company_slug = esc_attr($atts['company']);
    $link_status = esc_attr($atts['link']);

    // Pass the slug and link status to JavaScript via data attributes
    return '<div id="carousel-container" class="swiper" 
                data-company="' . $company_slug . '" 
                data-link="' . $link_status . '">
                <div class="swiper-wrapper"></div>
                <div class="swiper-button-next"></div>
                <div class="swiper-button-prev"></div>
            </div>';
}
add_shortcode('upcoming_events_carousel', 'upcoming_events_shortcode');
?>