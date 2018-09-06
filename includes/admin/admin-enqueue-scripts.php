<?php

/**
 * EDD Testing Assistant
 *
 * @package     EDD Testing Assistant
 * @subpackage  Classes/EDD Testing Assistant
 * @copyright   Copyright (c) 2018, Phil Johnston
 * @license     http://opensource.org/licenses/gpl-2.0.php GNU Public License
 * @since       1.0.0
*/

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function edd_testing_assistant_admin_enqueue_scripts(){

	// Use minified libraries if SCRIPT_DEBUG is turned off
	$suffix = ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ) ? '' : '.min';
	$dependencies = array();

	// Add React files
	wp_enqueue_script( 'react', EDD_TESTING_ASSISTANT_PLUGIN_URL . 'includes/js/libraries/react/react.js', $dependencies, EDD_TESTING_ASSISTANT_VERSION, true );
	$dependencies[] = 'react';

	wp_enqueue_script( 'react-dom', EDD_TESTING_ASSISTANT_PLUGIN_URL . 'includes/js/libraries/react/react-dom.js', $dependencies, EDD_TESTING_ASSISTANT_VERSION, true );
	$dependencies[] = 'react-dom';

	// Add Babel file
	wp_enqueue_script( 'babel', EDD_TESTING_ASSISTANT_PLUGIN_URL . 'includes/js/libraries/babel/browser.js', $dependencies, null );
	$dependencies[] = 'babel';

	wp_enqueue_script( 'edd_testing_assistant_misc_functions_js', EDD_TESTING_ASSISTANT_PLUGIN_URL . 'includes/js/admin/misc-functions.js', $dependencies, EDD_TESTING_ASSISTANT_VERSION, true );
	$dependencies[] = 'edd_testing_assistant_misc_functions_js';

	wp_enqueue_script( 'edd_testing_assistant_build_scenarios_js', EDD_TESTING_ASSISTANT_PLUGIN_URL . 'includes/js/admin/view-build-scenarios.js', $dependencies, EDD_TESTING_ASSISTANT_VERSION, true );
	$dependencies[] = 'edd_testing_assistant_build_scenarios_js';

	wp_enqueue_script( 'edd_testing_assistant_get_scenarios_js', EDD_TESTING_ASSISTANT_PLUGIN_URL . 'includes/js/admin/view-get-scenarios.js', $dependencies, EDD_TESTING_ASSISTANT_VERSION, true );
	$dependencies[] = 'edd_testing_assistant_get_scenarios_js';

	wp_enqueue_script( 'edd_testing_assistant_run_scenarios_js', EDD_TESTING_ASSISTANT_PLUGIN_URL . 'includes/js/admin/view-run-scenarios.js', $dependencies, EDD_TESTING_ASSISTANT_VERSION, true );
	$dependencies[] = 'edd_testing_assistant_run_scenarios_js';

	wp_enqueue_script( 'edd_testing_assistant_main_js', EDD_TESTING_ASSISTANT_PLUGIN_URL . 'includes/js/admin/edd-testing-assistant-main.js', $dependencies, EDD_TESTING_ASSISTANT_VERSION, true );

	wp_localize_script( 'edd_testing_assistant_main_js', 'edd_testing_assistant_main_js_vars',
		array(
			'ajaxurl' => get_bloginfo( 'url' ),
			'ajax_nonce_value' => wp_create_nonce( 'edd_testing_assistant_update_scenario_nonce' ),
			'settings_and_views' => edd_testing_assistant_get_views_and_settings(),
		)
	);

	// Load the styles for the admin settings
	wp_enqueue_style( 'edd_testing_assistant_admin_skin', plugins_url( '/css/edd-testing-assistant-admin.css', dirname( __FILE__ ) ), EDD_TESTING_ASSISTANT_VERSION );
}
add_action( 'admin_enqueue_scripts', 'edd_testing_assistant_admin_enqueue_scripts' );

function edd_testing_assistant_admin_modify_jsx_tag( $tag, $handle, $src ) {
	// Check that this is output of JSX file
	if (
		'edd_testing_assistant_misc_functions_js' == $handle ||
		'edd_testing_assistant_build_scenarios_js' == $handle ||
		'edd_testing_assistant_get_scenarios_js' == $handle ||
		'edd_testing_assistant_run_scenarios_js' == $handle ||
		'edd_testing_assistant_main_js' == $handle ||
		'edd_testing_assistant_admin_js' == $handle
	) {
		$tag = str_replace( "<script type='text/javascript'", "<script type='text/babel'", $tag );
	}

	return $tag;
}
add_filter( 'script_loader_tag', 'edd_testing_assistant_admin_modify_jsx_tag', 10, 3 );
