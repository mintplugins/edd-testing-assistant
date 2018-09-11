<?php

/**
 * EDD Testing Assistant - Misc Functions
 *
 * @package     EDD Testing Assistant
 * @subpackage  Classes/EDD Testing Assistant
 * @copyright   Copyright (c) 2018, Phil Johnston
 * @license     http://opensource.org/licenses/gpl-2.0.php GNU Public License
 * @since       1.0.0
*/

// This function will return an array which contains all of the possible admin settings, with some default values inserted to help define tests.
function edd_testing_assistant_get_possible_options( $strip_api_keys = false ){

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
						$possible_values[$top_tab_key][$page_settings_key][$setting['id']]['testing_values'] = edd_testing_assistant_get_values_for_testing( $setting );
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
							'name' => $possibly_enabled_gateway['admin_label'],
							'context' => 'payment_gateway'
						);
						$possible_values[$top_tab_key][$page_settings_key][$possibly_enabled_gateway_key]['testing_values'] = array( 'checked', 'unchecked' );
					}

				} else {

					// If this field doesn't all into any of the above conditions for any reason
					if ( isset( $setting['id'] ) ) {

						$possible_values[$top_tab_key][$page_settings_key][$setting['id']]['info'] = $setting;
						$possible_values[$top_tab_key][$page_settings_key][$setting['id']]['testing_values'] = edd_testing_assistant_get_values_for_testing( $setting, $strip_api_keys );
					}

				}
			}
		}
	}

	// Re-assemble the array so it is useful and contains everything in 1 array, instead of being spread over 5 different, unlinked arrays
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
					'visual_name' => isset( $second_level_admin_setting_tabs[$top_tab_key][$second_level_tab_key] ) ? $second_level_admin_setting_tabs[$top_tab_key][$second_level_tab_key] : __( 'No name found', 'edd-testing-assistant' ),
				),
				'contents' => $possible_values[$top_tab_key][$second_level_tab_key]
			);

			// Loop through each third level (typically this is where the actual settings live in EDD)
			foreach( $second_level_tab as $third_level_tab_key => $third_level_tab ) {

				// Add some helpful data about this third level item
				$usable_array_of_possible_values[$top_tab_key]['contents'][$second_level_tab_key]['contents'][$third_level_tab_key] = array(
					'info' => array (
						'visual_name' => strip_tags( $third_level_tab['info']['name'] ),
						'context' => isset( $third_level_tab['info']['context'] ) ? strip_tags( $third_level_tab['info']['context'] ) : 'admin_setting'
					),
					'testing_values' => $third_level_tab['testing_values']
				);

			}

		}

	}

	$values_for_testing = $usable_array_of_possible_values+ edd_testing_assistant_get_possible_cart_settings();
	// + edd_testing_assistant_get_possible_product_settings();

	return $values_for_testing;

}

// This function is used by the edd_testing_assistant_get_possible_options function to get the best default value for a setting
function edd_testing_assistant_get_values_for_testing( $setting, $strip_api_keys = false ) {

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

// This function return an array which contains all of the possible Product settings
function edd_testing_assistant_get_possible_product_settings() {

	//Get the templates for products
	$non_variably_priced_product_template = get_option( 'edd_testing_assistant_non_variably_priced_product_template' );
	$variably_priced_product_template = get_option( 'edd_testing_assistant_variably_priced_product_template' );

	$product_options = array();

	// Add all core options for products
	$edd_product_settings = apply_filters( 'edd_testing_assistant_product_settings', edd_download_metabox_fields() );

	// We need to add more data about each field, we'll rebuild that here
	$rebuilt_product_fields = array(
		'product_settings' => array(
			'info' => array(
				'visual_name' => __( 'Product-Specific Settings', 'edd-testing-assistant' ),
			),
			'contents' => array(
				'core_settings' => array(
					'info' => array(
						'visual_name' => __( 'Easy Digital Downloads Core', 'edd-testing-assistant' ),
					),
					'contents' => array(
					)
				),
			)
		)
	 );

	// Loop through each core product value
	foreach( $edd_product_settings as $value_slug ) {

		// Set the type of field based on the name of it.
		switch ( $value_slug ) {
			case '_edd_product_type':

				// Add the data about this field to the new array
				$rebuilt_product_fields['product_settings']['contents']['core_settings']['contents'][$value_slug] = array(
					'info' => array (
						'visual_name' => __( 'Product Type', 'edd-testing-assistant' ),
						'context' => 'product_setting'
					),
					'testing_values' => array(
						'default',
						'bundle'
					)
				);

				break;

			case 'edd_price':

				// Add the data about this field to the new array
				$rebuilt_product_fields['product_settings']['contents']['core_settings']['contents'][$value_slug] = array(
					'info' => array (
						'visual_name' => __( 'Price', 'edd-testing-assistant' ),
						'context' => 'product_setting'
					),
					'testing_values' => array(
						'100'
					)
				);

				break;

			case '_variable_pricing':

				// Variable pricing is not yet handled, so breaking here while it gets built out below
				break;

				// Add the data about this field to the new array
				$rebuilt_product_fields['product_settings']['contents']['core_settings']['contents'][$value_slug] = array(
					'info' => array (
						'visual_name' => __( 'Enable variable pricing', 'edd-testing-assistant' ),
						'context' => 'product_setting'
					),
					'testing_values' => array(
						'checked',
						'unchecked'
					)
				);

				break;

			case '_edd_price_options_mode':

				// Variable pricing is not yet handled, so breaking here while it gets built out below
				break;

				// Add the data about this field to the new array
				$rebuilt_product_fields['product_settings']['contents']['core_settings']['contents'][$value_slug] = array(
					'info' => array (
						'visual_name' => __( 'Multi-Option purchase mode', 'edd-testing-assistant' ),
						'context' => 'product_setting'
					),
					'testing_values' => array(
						'checked',
						'unchecked'
					)
				);

				break;

			case 'edd_variable_prices':

				// Variable pricing is not yet handled, so breaking here while it gets built out below
				break;

				// Lets pull in all of the values that are saved to the variable prices from our product template
				edd_get_variable_prices( $variably_priced_product_template );

				// Add testing values for the name of a variably priced product
				$rebuilt_product_fields['product_settings']['contents']['core_settings']['contents']['name'] = array(
					'info' => array (
						'visual_name' => __( 'Variable Price Name', 'edd-testing-assistant' ),
						'context' => 'product_setting'
					),
					'testing_values' => array(
						'Small',
						'Medium',
						'Large'
					)
				);

				// Add testing values for the amount of a variably priced product
				$rebuilt_product_fields['product_settings']['contents']['core_settings']['contents']['amount'] = array(
					'info' => array (
						'visual_name' => __( 'Variable Price Amount', 'edd-testing-assistant' ),
						'context' => 'product_setting'
					),
					'testing_values' => array(
						'Small',
						'Medium',
						'Large'
					)
				);

				// Add testing values for the license limit (Software Licensing) of a variably priced product
				$rebuilt_product_fields['product_settings']['contents']['core_settings']['contents']['license_limit'] = array(
					'info' => array (
						'visual_name' => __( 'Variable Price Sl License Limit', 'edd-testing-assistant' ),
						'context' => 'product_setting'
					),
					'testing_values' => array(
						'0',
						'1',
						'2'
					)
				);

				// Add testing values for the "recurring enabled" (EDD Recurring) of a variably priced product
				$rebuilt_product_fields['product_settings']['contents']['core_settings']['contents']['recurring'] = array(
					'info' => array (
						'visual_name' => __( 'Recurring Enabled', 'edd-testing-assistant' ),
						'context' => 'product_setting'
					),
					'testing_values' => array(
						'yes',
						'no',
					)
				);

				// Add testing values for the Trial Quantity (EDD Recurring) of a variably priced product
				$rebuilt_product_fields['product_settings']['contents']['core_settings']['contents']['trial-quantity'] = array(
					'info' => array (
						'visual_name' => __( 'Free Trial Quantity (number of days/weeks/months)', 'edd-testing-assistant' ),
						'context' => 'product_setting'
					),
					'testing_values' => array(
						'0',
						'1',
						'2'
					)
				);

				// Add testing values for the Trial Unit (EDD Recurring) of a variably priced product
				$rebuilt_product_fields['product_settings']['contents']['core_settings']['contents']['trial-unit'] = array(
					'info' => array (
						'visual_name' => __( 'Free Trial Unit (is the period days, weeks, months, or years)', 'edd-testing-assistant' ),
						'context' => 'product_setting'
					),
					'testing_values' => array(
						'day',
						'week',
						'month',
						'year'
					)
				);

				// Add testing values for the Recurring Period (EDD Recurring) of a variably priced product
				$rebuilt_product_fields['product_settings']['contents']['core_settings']['contents']['period'] = array(
					'info' => array (
						'visual_name' => __( 'Recurring Period', 'edd-testing-assistant' ),
						'context' => 'product_setting'
					),
					'testing_values' => array(
						'day',
						'week',
						'month',
						'year'
					)
				);

				// Add testing values for the Recurring Times (EDD Recurring) of a variably priced product
				$rebuilt_product_fields['product_settings']['contents']['core_settings']['contents']['times'] = array(
					'info' => array (
						'visual_name' => __( 'Recurring Times', 'edd-testing-assistant' ),
						'context' => 'product_setting'
					),
					'testing_values' => array(
						'0',
						'1',
						'2',
					)
				);

				// Add testing values for the Recurring Times (EDD Recurring) of a variably priced product
				$rebuilt_product_fields['product_settings']['contents']['core_settings']['contents']['signup_fee'] = array(
					'info' => array (
						'visual_name' => __( 'Recurring Signup Fee', 'edd-testing-assistant' ),
						'context' => 'product_setting'
					),
					'testing_values' => array(
						'0',
						'1',
						'2',
					)
				);

				break;

			case 'edd_download_files':

				// Not handled yet
				break;

			case '_edd_download_tax_exclusive':

				// Add the data about this field to the new array
				$rebuilt_product_fields['product_settings']['contents']['core_settings']['contents'][$value_slug] = array(
					'info' => array (
						'visual_name' => __( 'Ignore Tax', 'edd-testing-assistant' ),
						'context' => 'product_setting'
					),
					'testing_values' => array(
						'checked',
						'unchecked'
					)
				);

				break;

		}

	}

	return apply_filters( 'edd_testing_assistant_product_fields', $rebuilt_product_fields, $edd_product_settings );
}

// This function return an array which contains all of the possible Cart settings
function edd_testing_assistant_get_possible_cart_settings() {

	$cart_options = array();

	// We need to add more data about each field, we'll rebuild that here
	$rebuilt_cart_fields = array(
		'cart_settings' => array(
			'info' => array(
				'visual_name' => __( 'Cart - State at checkout', 'edd-testing-assistant' ),
			),
			'contents' => array(
				'core_settings' => array(
					'info' => array(
						'visual_name' => __( 'Easy Digital Downloads Core', 'edd-testing-assistant' ),
					),
					'contents' => array(
						'discount_code' => array(
							'info' => array (
								'visual_name' => __( 'Discount Code - Add "%" if percentage. Use number only for flat amount (1% vs 1)', 'edd-testing-assistant' ),
								'context' => 'cart_setting'
							),
							'testing_values' => array(
								'none',
								'1%',
								'1',
							)
						),
						/*
						'billing_address_line_1' => array(
							'info' => array (
								'visual_name' => __( 'Billing Address Line 1', 'edd-testing-assistant' ),
								'context' => 'cart_setting'
							),
							'testing_values' => array(
								'123 Fake Street',
							)
						),
						'billing_address_line_2' => array(
							'info' => array (
								'visual_name' => __( 'Billing Address Line 2', 'edd-testing-assistant' ),
								'context' => 'cart_setting'
							),
							'testing_values' => array(
								'Apartment 123',
							)
						),
						'billing_city' => array(
							'info' => array (
								'visual_name' => __( 'Billing City', 'edd-testing-assistant' ),
								'context' => 'cart_setting'
							),
							'testing_values' => array(
								'Toronto',
							)
						),
						'billing_zip' => array(
							'info' => array (
								'visual_name' => __( 'Billing Zip/Postal Code', 'edd-testing-assistant' ),
								'context' => 'cart_setting'
							),
							'testing_values' => array(
								'12345',
								'13371',
								'n4k5n3',
							)
						),
						'billing_country' => array(
							'info' => array (
								'visual_name' => __( 'Billing Zip/Postal Code', 'edd-testing-assistant' ),
								'context' => 'cart_setting'
							),
							'testing_values' => array(
								'CA',
								'US',
								'MN',
							)
						),
						'billing_state' => array(
							'info' => array (
								'visual_name' => __( 'Billing State', 'edd-testing-assistant' ),
								'context' => 'cart_setting'
							),
							'testing_values' => array(
								'',
								'Ontario',
								'Alaska',
								'Test',
							)
						),
						*/
					)
				),
			)
		)
	 );

	return apply_filters( 'edd_testing_assistant_cart_fields', $rebuilt_cart_fields );
}
