<?php

/**
 * Custom endpoint function which fetches the user roles
 *
 * @access   public
 * @since    1.0.0
 * @return   void
 */
function edd_testing_assistant_set_scenario(){

	if ( ! isset( $_GET['edd-testing-assistant-set-scenario'] ) ) {
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
	if ( ! wp_verify_nonce( $decoded['nonce'], 'edd_testing_assistant_update_scenario_nonce' ) ) {
		echo json_encode( array(
			'success' => false,
			'details' => 'Nonce failed.'
		) );
		die();
	}

	// If we made it this far, we have a valid request to set the scenario. Setting the scenario involves setting the admin settings, and possibly creating a new product with a set of settings as well.
	$current_scenario = $decoded['current_scenario'];
	$all_scenarios = $decoded['all_scenarios'];
	$need_to_create_product = false;

	// Empty the cart
	edd_empty_cart();

	// Check if we need to create a product or not
	foreach( $all_scenarios[$current_scenario]['values'] as $setting_key => $setting_data ) {

		if ( 'product_setting' == $setting_data['context'] ) {
			$need_to_create_product = true;
			break;
		}
	}

	// If we do need to create a product, make one now
	if ( $need_to_create_product ) {

		// Create the new post
		$post_id = wp_insert_post(
			array(
				'post_title'  => sprintf( __( 'EDD Testing Scenario %s Created automatically', 'edd-testing-assistant' ), $current_scenario ),
				'post_status' => 'publish',
				'post_type'   => 'download'
			)
		);

		// Add the item we just created to the cart
		edd_add_to_cart( $post_id );

	}

	// Loop through all of the settings in this scenario, setting each one up along the way
	foreach( $all_scenarios[$current_scenario]['values'] as $setting_key => $setting_data ) {

		$value_to_save = null;

		// If this is an admin setting
		if ( 'admin_setting' == $setting_data['context'] ) {

			// Check what the value is, as checkboxes have specific values
			if ( 'unchecked' == $setting_data['value'] ) {
				$value_to_save = 0;
			} else if ( 'checked' == $setting_data['value'] ) {
				$value_to_save = 1;
			} else {
				$value_to_save = $setting_data['value'];
			}

			edd_update_option( $setting_key, $value_to_save );

		} else if ( 'product_setting' == $setting_data['context'] ) {

			// Assign this as post meta to the product we created.
			update_post_meta( $post_id, $setting_key, $setting_data['value'] );

		} else if ( 'cart_setting' == $setting_data['context'] ) {

			// If this setting is a discount code in the cart
			if ( 'discount_code' == $setting_key ) {

				if ( 'none' == $setting_data['value'] ) {
					continue;
				}

				// Check if there is a percentage sign in the value
				if ( strpos( '%', $setting_data['value'] ) !== false ) {
					$exploder = explode( '%', $setting_data['value'] );
					$amount = $exploder[0];
					$type = 'percentage';
				} else {
					$amount = $setting_data['value'];
					$type = 'flat';
				}

				// Set up the values for our new discount code
				$meta = array(
					'code'              => __( 'Scenario: ' . $current_scenario ),
					'name'              => __( 'scenario_' . $current_scenario ),
					'status'            => 'active',
					'uses'              => '',
					'max_uses'          => '',
					'amount'            => $amount,
					'start'             => '',
					'expiration'        => '',
					'type'              => $type,
					'min_price'         => '',
					'product_reqs'      => array(),
					'product_condition' => '',
					'excluded_products' => array(),
					'is_not_global'     => false,
					'is_single_use'     => false,
				);

				// Create the discount code in question
				edd_store_discount( $meta );

				// Apply that discount to the cart
				edd_set_cart_discount( 'Scenario: ' . $current_scenario );
			}


		} else if ( 'tax_rate' == $setting_data['context'] ) {

			// Tax rates are handled differently in EDD3, so they have their own context (not admin_setting)
			$tax_rates = edd_get_tax_rates();

			// Make changes to the tax rates for this scenario to be true
			//Make changes to the tax rates for this scenario to be true

			// Update the tax rates
			edd_update_adjustment( $data );

		}
	}

	echo json_encode( array(
		'success' => true,
		'details' => 'All settings updated',
		'product_created' => $need_to_create_product,
		'data' => $setting_data,
		'current_scenario' => $current_scenario
	) );

	die();

}
add_action( 'init', 'edd_testing_assistant_set_scenario' );
