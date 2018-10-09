<?php

/**
 * Add the fields from Recurring Payments so they can have testing values added.
 *
 * @since    1.0.0
 * @param    array $edd_product_settings
 * @return   void
 */
function edd_testing_assistant_recurring_product_settings( $edd_product_settings ) {

	// Add fields from Recurring Payments:
	$edd_product_settings[] = 'edd_period';
	$edd_product_settings[] = 'edd_times';
	$edd_product_settings[] = 'edd_recurring';
	$edd_product_settings[] = 'edd_signup_fee';
	$edd_product_settings[] = 'edd_trial_period';

	return $edd_product_settings;

}
add_filter( 'edd_testing_assistant_product_settings', 'edd_testing_assistant_recurring_product_settings' );

/**
 * Handle the fields from Recurring Payments so they can have testing values added
 *
 * @since    1.0.0
 * @param    array $edd_product_settings
 * @return   void
 */
function edd_testing_assistant_recurring_rebuilt_product_settings( $rebuilt_product_fields, $edd_product_settings ) {

	// We need to add more data about each field, we'll rebuild that here
	$rebuilt_product_fields['product_settings']['contents']['edd_recurring'] = array(
			'info' => array(
				'visual_name' => __( 'EDD Recurring', 'edd-testing-assistant' ),
			),
			'contents' => array()
	 );

	foreach( $edd_product_settings as $value_slug ) {

		// Set the type of field based on the name of it.
		switch ( $value_slug ) {
			case 'edd_recurring':

				// Add the data about this field to the new array
				$rebuilt_product_fields['product_settings']['contents']['edd_recurring']['contents'][$value_slug] = array(
					'info' => array (
						'visual_name' => __( 'Recurring - Enabled', 'edd-testing-assistant' ),
						'context' => 'product_setting'
					),
					'testing_values' => array(
						'yes',
						'no'
					)
				);

				break;

			case 'edd_period':

				// Add the data about this field to the new array
				$rebuilt_product_fields['product_settings']['contents']['edd_recurring']['contents'][$value_slug] = array(
					'info' => array (
						'visual_name' => __( 'Recurring - Period', 'edd-testing-assistant' ),
						'context' => 'product_setting'
					),
					'testing_values' => array(
						'day',
						'week',
						'month',
						'year'
					)
				);

				break;

			case 'edd_times':

				// Add the data about this field to the new array
				$rebuilt_product_fields['product_settings']['contents']['edd_recurring']['contents'][$value_slug] = array(
					'info' => array (
						'visual_name' => __( 'Recurring - Times', 'edd-testing-assistant' ),
						'context' => 'product_setting'
					),
					'testing_values' => array(
						'0',
						'1',
						'2',
					)
				);

				break;

			case 'edd_signup_fee':

				// Add the data about this field to the new array
				$rebuilt_product_fields['product_settings']['contents']['edd_recurring']['contents'][$value_slug] = array(
					'info' => array (
						'visual_name' => __( 'Recurring - Signup Fee', 'edd-testing-assistant' ),
						'context' => 'product_setting'
					),
					'testing_values' => array(
						'0',
						'1',
						'2',
					)
				);

				break;

			case 'edd_trial_period':

				// Add the data about this field to the new array
				$rebuilt_product_fields['product_settings']['contents']['edd_recurring']['contents'][$value_slug] = array(
					'info' => array (
						'visual_name' => __( 'Recurring - 1 Day Free Trial', 'edd-testing-assistant' ),
						'context' => 'product_setting'
					),
					'testing_values' => array(
						'checked',
						'unchecked',
					)
				);

				break;
		}
	}

	return $rebuilt_product_fields;

}
add_filter( 'edd_testing_assistant_product_fields', 'edd_testing_assistant_recurring_rebuilt_product_settings', 10, 2 );

/**
 * Handle saving a free trial since it is an anomaly in EDD, and saves an array of combined values, instead of each key->value
 *
 * @since    1.0.0
 * @param    mixed $value_to_save
 * @param    string $key
 * @param    mixed $value_from_ajax
 * @return   mixed
 */
function edd_testing_assistant_format_free_trial_for_save( $value_to_save, $key, $value_from_ajax ){

	if ( 'edd_trial_period' !== $key ) {
		return $value_to_save;
	}

	$value_to_save = array(
		'quantity' => 1,
		'unit'     => 'day',
	);

	return $value_to_save;

}
add_filter( 'edd_testing_assistant_product_setting_to_save', 'edd_testing_assistant_format_free_trial_for_save', 10, 3 );
