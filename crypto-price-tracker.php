<?php
/**
 * Plugin Name: Crypto-plugin
 * Description: Плагин для отображения криптовалютных цен
 * Version: 1.0.0
 * Author: Farid
 */

if (!defined('ABSPATH')) {
    exit;
}

class CryptoPlugin
{

    public function __construct()
    {
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_shortcode('my_vue_app', array($this, 'render_vue_app'));
    }

    public function enqueue_scripts()
    {
        $app_js_path = plugin_dir_path(__FILE__) . 'dist/assets/index-DlK7tntA.js';
        $css_path = plugin_dir_path(__FILE__) . 'dist/assets/index-CRccXoXh.css';


        if (file_exists($app_js_path)) {
            wp_enqueue_script(
                'my-vue-app',
                plugin_dir_url(__FILE__) . 'dist/assets/index-DlK7tntA.js',
                [],
                filemtime($app_js_path),
                true
            );
        }

        if (file_exists($css_path)) {
            wp_enqueue_style(
                'my-vue-style',
                plugin_dir_url(__FILE__) . 'dist/assets/index-CRccXoXh.css',
                array(),
                filemtime($css_path)
            );
        }

    }

    public function render_vue_app($atts)
    {
        // Атрибуты шорткода
        $atts = shortcode_atts(array(
            'title' => 'Crypto App',
            'app_id' => 'my-vue-app-' . uniqid() 
        ), $atts);

        ob_start();
        ?>
<div id="<?php echo esc_attr($atts['app_id']); ?>" class="vue-app-container">
    <h2 class="vue-app-title"><?php echo esc_html($atts['title']); ?></h2>

</div>
<?php
        return ob_get_clean();
    }
}

new MyVuePlugin();