<?php

/**
 * Custom endpoint function which fetches the user roles
 *
 * @access   public
 * @since    1.0.0
 * @return   void
 */
function edd_testing_plugin_set_scenario(){

	if ( ! isset( $_GET['edd-testing-plugin-set-scenario'] ) ) {
		return false;
	}

	$contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';

	if ( $contentType !== "application/json" ) {
		echo json_encode( array(
			'success' => false,
			'details' => 'Request was incorrect.'
		) );
		die();
	}

	//Receive the RAW post data.
	$content = trim(file_get_contents("php://input"));

	$decoded = json_decode($content, true);

	//If json_decode failed, the JSON is invalid.
	if( ! is_array( $decoded ) ) {
		echo json_encode( array(
			'success' => false,
			'details' => 'Request was incorrect.'
		) );
		die();
	}

	// Verify the nonce
	if ( ! wp_verify_nonce( $decoded['nonce'], 'edd_testing_plugin_update_scenario_nonce' ) ) {
		echo json_encode( array(
			'success' => false,
			'details' => 'Nonce failed.'
		) );
		die();
	}

	// If we made it this far, we have a valid request to set the scenario. Setting the scenario involves setting the admin settings, and possibly creating a new product with a set of settings as well.
	$current_scenario = $decoded['current_scenario'];
	$all_scenarios = $decoded['all_scenarios'];

	// Loop through all of the settings in this scenario, setting each one up along the way
	foreach( $all_scenarios[$current_scenario]['values'] as $setting_key => $setting_data ) {

		$value_to_save = null;

		// If this is an admin setting
		if ( 'edd_admin_setting' == $setting_data['context'] ) {

			// Check what the value is, as checkboxes have specific values
			if ( 'unchecked' == $setting_data['value'] ) {
				$value_to_save = 0;
			} else if ( 'checked' == $setting_data['value'] ) {
				$value_to_save = 1;
			} else {
				$value_to_save = $setting_data['value'];
			}

			edd_update_option( $setting_key, $value_to_save );
		}
	}

	echo json_encode( array(
		'success' => true,
		'details' => 'All settings updated'
	) );
	die();

	die();

}
add_action( 'init', 'edd_testing_plugin_set_scenario' );
