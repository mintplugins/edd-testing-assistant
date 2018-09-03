<?php
/*
Plugin Name: EDD Testing Assistant
Plugin URI: https://easydigitaldownloads.com
Description: This plugin tells how many scenarios need to be tested in the Easy Digital Downloads ecosystem anytime a change is made.
Version: 1.0.0.0
Author: Easy Digital Downloads
Author URI: http://easydigitaldownloads.com
Text Domain: edd-testing-assistant
Domain Path: languages
License: GPL2
*/


// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) exit;

if ( ! class_exists( 'EDD_Testing_Plugin' ) ) :

/**
 * Main EDD_Testing_Plugin Class.
 *
 * @since 1.4
 */
final class EDD_Testing_Plugin {

	/** Singleton *************************************************************/

	/**
	 * @var EDD_Testing_Plugin The one true EDD_Testing_Plugin
	 * @since 1.4
	 */
	private static $instance;

	/**
	 * Main EDD_Testing_Plugin Instance.
	 *
	 * Insures that only one instance of EDD_Testing_Plugin exists in memory at any one
	 * time. Also prevents needing to define globals all over the place.
	 *
	 * @since 1.4
	 * @static
	 * @staticvar array $instance
	 * @uses EDD_Testing_Plugin::setup_constants() Setup the constants needed.
	 * @uses EDD_Testing_Plugin::includes() Include the required files.
	 * @uses EDD_Testing_Plugin::load_textdomain() load the language files.
	 * @see EDD_Testing_Plugin()
	 * @return object|EDD_Testing_Plugin The one true EDD_Testing_Plugin
	 */
	public static function instance() {
		if ( ! isset( self::$instance ) && ! ( self::$instance instanceof EDD_Testing_Plugin ) ) {
			self::$instance = new EDD_Testing_Plugin;
			self::$instance->setup_constants();

			self::$instance->includes();

			add_action( 'plugins_loaded', array( self::$instance, 'load_textdomain' ) );

		}

		return self::$instance;
	}

	/**
	 * Throw error on object clone.
	 *
	 * The whole idea of the singleton design pattern is that there is a single
	 * object therefore, we don't want the object to be cloned.
	 *
	 * @since 1.6
	 * @access protected
	 * @return void
	 */
	public function __clone() {
		// Cloning instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, __( 'Cheatin&#8217; huh?', 'edd-testing-assistant' ), '1.0.0' );
	}

	/**
	 * Setup plugin constants.
	 *
	 * @access private
	 * @since 1.4
	 * @return void
	 */
	private function setup_constants() {

		// Plugin version.
		if ( ! defined( 'EDD_TESTING_ASSISTANT_VERSION' ) ) {
			define( 'EDD_TESTING_ASSISTANT_VERSION', '1.0.0' );
		}

		// Plugin Folder Path.
		if ( ! defined( 'EDD_TESTING_ASSISTANT_PLUGIN_DIR' ) ) {
			define( 'EDD_TESTING_ASSISTANT_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
		}

		// Plugin Folder URL.
		if ( ! defined( 'EDD_TESTING_ASSISTANT_PLUGIN_URL' ) ) {
			define( 'EDD_TESTING_ASSISTANT_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
		}

		// Plugin Root File.
		if ( ! defined( 'EDD_TESTING_ASSISTANT_PLUGIN_FILE' ) ) {
			define( 'EDD_TESTING_ASSISTANT_PLUGIN_FILE', __FILE__ );
		}

	}

	/**
	 * Include required files.
	 *
	 * @access private
	 * @since 1.4
	 * @return void
	 */
	private function includes() {

		/**
		 * Admin Enqueue Scripts
		 */
		require( EDD_TESTING_ASSISTANT_PLUGIN_DIR . 'includes/misc-functions/admin-enqueue-scripts.php' );

		/**
		 * Settings Functions
		 */
		require( EDD_TESTING_ASSISTANT_PLUGIN_DIR . 'includes/admin/admin-page.php' );

		/**
		 * Ajax Functions
		 */
		require( EDD_TESTING_ASSISTANT_PLUGIN_DIR . 'includes/misc-functions/ajax-functions.php' );

		/**
		 * Misc Functions
		 */
		require( EDD_TESTING_ASSISTANT_PLUGIN_DIR . 'includes/misc-functions/misc-functions.php' );

		/**
		 * Extensions
		 */
		require( EDD_TESTING_ASSISTANT_PLUGIN_DIR . 'includes/misc-functions/extensions/edd-recurring.php' );
		require( EDD_TESTING_ASSISTANT_PLUGIN_DIR . 'includes/misc-functions/extensions/edd-software-licensing.php' );

	}

	/**
	 * Loads the plugin language files.
	 *
	 * @since 1.4
	 * @return void
	 */
	public function load_textdomain() {

		// Set filter for plugin's languages directory
		$edd_testing_assistant_lang_dir = dirname( plugin_basename( EDD_TESTING_ASSISTANT_PLUGIN_FILE ) ) . '/languages/';
		$edd_testing_assistant_lang_dir = apply_filters( 'edd_testing_assistant_languages_directory', $edd_testing_assistant_lang_dir );


		// Traditional WordPress plugin locale filter
		$locale        = apply_filters( 'plugin_locale',  get_locale(), 'mp-stacks' );
		$mofile        = sprintf( '%1$s-%2$s.mo', 'mp-stacks', $locale );

		// Setup paths to current locale file
		$mofile_local  = $edd_testing_assistant_lang_dir . $mofile;
		$mofile_global = WP_LANG_DIR . '/mp-stacks/' . $mofile;

		if ( file_exists( $mofile_global ) ) {
			// Look in global /wp-content/languages/edd_testing_assistant folder
			load_textdomain( 'edd_testing_assistant', $mofile_global );
		} elseif ( file_exists( $mofile_local ) ) {
			// Look in local /wp-content/plugins/edd_testing_assistant/languages/ folder
			load_textdomain( 'edd_testing_assistant', $mofile_local );
		} else {
			// Load the default language files
			load_plugin_textdomain( 'edd_testing_assistant', false, $edd_testing_assistant_lang_dir );
		}

	}

}

endif; // End if class_exists check.


/**
 * The main function for that returns EDD_Testing_Plugin
 *
 * The main function responsible for returning the one true EDD_Testing_Plugin
 * Instance to functions everywhere.
 *
 * Use this function like you would a global variable, except without needing
 * to declare the global.
 *
 * Example: <?php $edd_testing_assistant = EDD_Testing_Plugin(); ?>
 *
 * @since 1.4
 * @return object|EDD_Testing_Plugin The one true EDD_Testing_Plugin Instance.
 */
function EDD_Testing_Plugin() {
	return EDD_Testing_Plugin::instance();
}

// Get EDD_Testing_Plugin Running.
EDD_Testing_Plugin();
