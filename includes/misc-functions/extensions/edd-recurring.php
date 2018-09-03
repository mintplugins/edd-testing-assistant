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
						'checked',
						'unchecked'
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
		}
	}

	return $rebuilt_product_fields;

}
add_filter( 'edd_testing_assistant_product_fields', 'edd_testing_assistant_recurring_rebuilt_product_settings', 10, 2 );
