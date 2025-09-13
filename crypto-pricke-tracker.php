<?php
/**
 * Plugin Name: Crypto Price Tracker
 * Description: Отслеживание цен криптовалют в реальном времени с использованием WordPress Interactivity API
 * Version: 1.0.0
 * Author: Your Name
 */

// Безопасность
if (! defined('ABSPATH')) {
    exit;
}

// Константы плагина
define('CRYPTO_PRICE_TRACKER_VERSION', '1.0.0');
define('CRYPTO_PRICE_TRACKER_PLUGIN_URL', plugin_dir_url(__FILE__));
define('CRYPTO_PRICE_TRACKER_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('CRYPTO_API_BASE_URL', 'https://crypto-api-app-production.up.railway.app/price/');

class CryptoPriceTracker
{

    public function __construct()
    {
        add_action('init', [$this, 'init']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_scripts']);
        add_shortcode('crypto_price', [$this, 'shortcode_handler']);
        add_shortcode('crypto_selector', [$this, 'selector_shortcode_handler']);
    }

    public function init()
    {
        // Регистрируем блок, если используем Gutenberg
        if (function_exists('register_block_type')) {
            $asset_file = include CRYPTO_PRICE_TRACKER_PLUGIN_PATH . 'build/index.asset.php';

            register_block_type(CRYPTO_PRICE_TRACKER_PLUGIN_PATH . 'build', [
                'editor_script' => 'crypto-price-tracker-editor',
                'view_script'   => 'crypto-price-tracker-view',
                'style'         => 'crypto-price-tracker-style',
            ]);
        }
    }

    public function enqueue_scripts()
    {
        // Подключаем один скомпилированный JS файл как модуль
        wp_enqueue_script(
            'crypto-price-tracker',
            CRYPTO_PRICE_TRACKER_PLUGIN_URL . 'build/crypto-price-tracker.js',
            ['wp-interactivity'], // Зависимости
            CRYPTO_PRICE_TRACKER_VERSION,
            [
                'in_footer' => true,
                'strategy'  => 'module',
            ]
        );

        // Подключаем скомпилированный CSS
        wp_enqueue_style(
            'crypto-price-tracker-style',
            CRYPTO_PRICE_TRACKER_PLUGIN_URL . 'build/style.css',
            [],
            CRYPTO_PRICE_TRACKER_VERSION
        );

        // Локализация
        wp_localize_script('crypto-price-tracker', 'cryptoPriceData', [
            'apiUrl'         => rest_url('crypto-price-tracker/v1/price/'),
            'nonce'          => wp_create_nonce('wp_rest'),
            'availableCoins' => ['bitcoin', 'ethereum', 'solana'],
        ]);
    }

    // ... остальные методы shortcode_handler, selector_shortcode_handler, get_crypto_price остаются без изменений ...
}

new CryptoPriceTracker();

// REST API endpoints
add_action('rest_api_init', function () {
    register_rest_route('crypto-price-tracker/v1', '/price/(?P<coin>[a-zA-Z0-9]+)', [
        'methods'             => 'GET',
        'callback'            => 'crypto_price_tracker_api_handler',
        'permission_callback' => '__return_true',
        'args'                => [
            'coin' => [
                'validate_callback' => function ($param, $request, $key) {
                    $available_coins = ['bitcoin', 'ethereum', 'solana'];
                    return in_array(strtolower($param), $available_coins);
                },
            ],
        ],
    ]);
});

function crypto_price_tracker_api_handler($request)
{
    $coin    = strtolower($request->get_param('coin'));
    $api_url = CRYPTO_API_BASE_URL . $coin;

    $response = wp_remote_get($api_url, [
        'timeout' => 10,
        'headers' => [
            'Accept' => 'application/json',
        ],
    ]);

    if (is_wp_error($response)) {
        return rest_ensure_response([
            'success' => false,
            'error'   => $response->get_error_message(),
            'data'    => null,
        ]);
    }

    $status_code = wp_remote_retrieve_response_code($response);
    $body        = wp_remote_retrieve_body($response);
    $data        = json_decode($body, true);

    if ($status_code !== 200 || ! $data) {
        return rest_ensure_response([
            'success' => false,
            'error'   => 'Не удалось получить данные от API',
            'data'    => null,
        ]);
    }

    return rest_ensure_response([
        'success' => true,
        'data'    => [
            'price'     => floatval($data['price'] ?? 0),
            'change'    => floatval($data['change'] ?? 0),
            'timestamp' => time(),
        ],
    ]);
}
