<?php

/**
 * EDD Testing Plugin - Misc Functions
 *
 * @package     EDD Testing Plugin
 * @subpackage  Classes/EDD Testing Plugin
 * @copyright   Copyright (c) 2018, Phil Johnston
 * @license     http://opensource.org/licenses/gpl-2.0.php GNU Public License
 * @since       1.0.0
*/

// This function will return a JSON array which contains all of the possible settings, with some default values inserted to help define tests.
function edd_testing_plugin_get_possible_options( $strip_api_keys = false ){

	$possible_values = array();

	$edd_settings = edd_get_registered_settings();
	$top_level_admin_setting_tabs = edd_get_settings_tabs();
	$second_level_admin_setting_tabs = edd_get_registered_settings_sections();
	$already_saved_values = get_option( 'edd_settings' );

	// Loop through each top tab in the admin settings
	foreach( $edd_settings as $top_tab_key => $top_tab ) {

		// Skip the general tab as these options don't typically affect anything
		if ( 'general' == $top_tab_key ) {
			continue;
		}

		// Loop through each page directly under a top tab in the admin settings
		foreach( $top_tab as $page_settings_key => $page_settings ) {

			// All tests will be done in test mode, so test mode can be skipped.
			if ( 'gateways' == $top_tab_key &&
				'test_mode' == $page_settings_key
			) {
				continue;
			}

			// Loop through each setting on a sub tab admin menu page
			foreach( $page_settings as $setting_key => $setting ) {

				// Test mode exists twice in the EDD settings, so skip that here too.
				if ( 'gateways' == $top_tab_key &&
					'test_mode' == $setting_key
				) {
					continue;
				}

				// Skip certain types of fields that aren't actual variables, but mere placeholders or information displayers.
				if (
					isset( $setting['type'] ) &&
					(
					'header' == $setting['type'] ||
					'hook' == $setting['type'] ||
					'descriptive_text' == $setting['type']
					)
				) {

					// Skip these fields because they are not actual settings
					continue;

				} else if ( ! isset( $setting['type'] ) ) {

					// If this field has an ID, retrieve its value and use it for the tests. Otherwise, it will be excluded from the tests.
					if ( isset( $setting['id'] ) ) {

						$possible_values[$top_tab_key][$page_settings_key][$setting['id']]['info'] = $setting;
						$possible_values[$top_tab_key][$page_settings_key][$setting['id']]['testing_values'] = edd_testing_plugin_get_values_for_testing( $setting );
					}

				} else if ( 'checkbox' == $setting['type'] ) {

					if ( isset( $setting['id'] ) ) {
						$possible_values[$top_tab_key][$page_settings_key][$setting['id']]['info'] = $setting;
						$possible_values[$top_tab_key][$page_settings_key][$setting['id']]['testing_values'] = array( 'checked', 'unchecked' );
					}

				} else if ( 'select' == $setting['type'] || 'radio' == $setting['type'] ) {

					if ( isset( $setting['id'] ) ) {

						$setting_options = array();

						foreach( $setting['options'] as $setting_option_key => $setting_option ) {
							$setting_options[] = $setting_option_key;
						}

						$possible_values[$top_tab_key][$page_settings_key][$setting['id']]['info'] = $setting;
						$possible_values[$top_tab_key][$page_settings_key][$setting['id']]['testing_values'] = $setting_options;
					}

				} else if( 'gateways' == $setting['type'] ) {

					// Loop through each possible gateway and add a checkbox enabled/disabled scenario for each
					foreach( $setting['options'] as $possibly_enabled_gateway_key => $possibly_enabled_gateway ) {
						$possible_values[$top_tab_key][$page_settings_key][$possibly_enabled_gateway_key]['info'] = array(
							'name' => $possibly_enabled_gateway['admin_label']
						);
						$possible_values[$top_tab_key][$page_settings_key][$possibly_enabled_gateway_key]['testing_values'] = array( 'checked', 'unchecked' );
					}

				} else {

					// If this field doesn't all into any of the above conditions for any reason
					if ( isset( $setting['id'] ) ) {

						$possible_values[$top_tab_key][$page_settings_key][$setting['id']]['info'] = $setting;
						$possible_values[$top_tab_key][$page_settings_key][$setting['id']]['testing_values'] = edd_testing_plugin_get_values_for_testing( $setting, $strip_api_keys );
					}

				}
			}
		}
	}

	// Re-assemble the array so it is useful and contains everything in 1 array, instead of being spread of 5 different, painfully unlinked arrays
	$usable_array_of_possible_values = array();

	// Loop through each top level tab
	foreach( $possible_values as $top_tab_key => $top_tab ) {

		// Add some helpful data about this top level tab
		$usable_array_of_possible_values[$top_tab_key] = array(
			'info' => array (
				'visual_name' => $top_level_admin_setting_tabs[$top_tab_key],
			),
			'contents' => $top_tab
		);

		// Loop through each second-level (tabs across top, but under the top tabs)
		foreach( $top_tab as $second_level_tab_key => $second_level_tab ) {

			// Add some helpful data about this second level item
			$usable_array_of_possible_values[$top_tab_key]['contents'][$second_level_tab_key] = array(
				'info' => array (
					'visual_name' => isset( $second_level_admin_setting_tabs[$top_tab_key][$second_level_tab_key] ) ? $second_level_admin_setting_tabs[$top_tab_key][$second_level_tab_key] : __( 'No name found', 'edd-testing-plugin' ),
				),
				'contents' => $possible_values[$top_tab_key][$second_level_tab_key]
			);

			// Loop through each third level (typically this is where the actual settings live in EDD)
			foreach( $second_level_tab as $third_level_tab_key => $third_level_tab ) {

				// Add some helpful data about this third level item
				$usable_array_of_possible_values[$top_tab_key]['contents'][$second_level_tab_key]['contents'][$third_level_tab_key] = array(
					'info' => array (
						'visual_name' => strip_tags( $third_level_tab['info']['name'] ),
						'context' => 'admin_setting'
					),
					'testing_values' => $third_level_tab['testing_values']
				);

			}

		}

	}

	return $usable_array_of_possible_values;

}

// This function is used by the edd_testing_plugin_get_possible_options function to get the best default value for a setting
function edd_testing_plugin_get_values_for_testing( $setting, $strip_api_keys = false ) {

	$values_for_testing = array();

	$saved_value = edd_get_option( $setting['id'] );
	$std_value = isset( $setting['std'] ) ? $setting['std'] : null;

	// If we should strip out the API keys, do so now
	if ( $strip_api_keys ) {

		if (
			//Paypal keys:
			$setting['id'] == 'paypal_live_api_username' ||
			$setting['id'] == 'paypal_live_api_password' ||
			$setting['id'] == 'paypal_live_api_signature' ||
			$setting['id'] == 'paypal_test_api_username' ||
			$setting['id'] == 'paypal_test_api_signature' ||
			//Stripe keys:
			$setting['id'] == 'test_secret_key' ||
			$setting['id'] == 'test_publishable_key' ||
			$setting['id'] == 'live_secret_key' ||
			$setting['id'] == 'live_publishable_key'
		) {
			$saved_value = 'use_locally_saved_value';
		}
	}

	if ( empty( $saved_value ) && empty( $std_value ) ) {

		// If there is no saved value, and no default value
		$values_for_testing[] = '';

	} else if ( empty( $saved_value ) && ! empty( $std_value ) ) {

		// If there is not saved value, but there is a default value
		$values_for_testing[] = $std_value;

	} else if ( ! empty( $saved_value ) && empty( $std_value ) ) {

		// If there is a saved value, but there is not a default value
		$values_for_testing[] = $saved_value;

	} else if ( ! empty( $saved_value ) && !empty( $std_value ) ) {

		// If there is a saved value, AND a default value, check if they are the same
		if ( $saved_value == $std_value ) {
			$values_for_testing[] = $saved_value;
		} else {
			$values_for_testing[] = $saved_value;
			$values_for_testing[] = $std_value;
		}
	}

	return $values_for_testing;
}
