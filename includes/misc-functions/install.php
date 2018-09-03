<?php
/**
 * Installaion hooks for EDD Testing Assistant
 *
 * @link http://mintplugins.com/doc/
 * @since 1.0.0
 *
 * @package     EDD Testing Assistant
 * @subpackage  Functions
 *
 * @copyright   Copyright (c) 2018, Mint Plugins
 * @license     http://opensource.org/licenses/gpl-2.0.php GNU Public License
 * @author      Philip Johnston
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Install
 *
 * Runs on plugin install.
 *
 * @since 1.0
 * @return void
 */
function edd_testing_assistant_install() {

	// Set up the default products (which we'll use as product templates that tell us what meta options exist) upon installation
	edd_testing_assistant_set_default_products();

}
register_activation_hook( EDD_TESTING_ASSISTANT_PLUGIN_FILE, 'edd_testing_assistant_install' );
