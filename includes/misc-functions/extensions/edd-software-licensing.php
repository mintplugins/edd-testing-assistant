<?php

/**
 * Add the fields from Software Licensing so they can have testing values added.
 *
 * @since    1.0.0
 * @param    array $edd_product_settings
 * @return   void
 */
function edd_testing_assistant_software_licensing_product_settings( $edd_product_settings ) {

	// Add fields from Software Licensing:
	$edd_product_settings[] = '_edd_sl_enabled';
	$edd_product_settings[] = '_edd_sl_limit';
	$edd_product_settings[] = '_edd_sl_version';
	$edd_product_settings[] = '_edd_sl_upgrade_file_key';
	$edd_product_settings[] = '_edd_sl_changelog';
	$edd_product_settings[] = 'edd_sl_download_lifetime';
	$edd_product_settings[] = '_edd_sl_exp_unit';
	$edd_product_settings[] = '_edd_sl_exp_length';
	$edd_product_settings[] = '_edd_sl_renewal_discount';

	return $edd_product_settings;

}
add_filter( 'edd_testing_assistant_product_settings', 'edd_testing_assistant_software_licensing_product_settings' );

/**
 * Handle the fields from Software Licensing so they can have testing values added
 *
 * @since    1.0.0
 * @param    array $edd_product_settings
 * @return   void
 */
function edd_testing_assistant_software_licensing_rebuilt_product_settings( $rebuilt_product_fields, $edd_product_settings ) {

	// We need to add more data about each field, we'll rebuild that here
	$rebuilt_product_fields['product_settings']['contents']['edd_software_licensing'] = array(
			'info' => array(
				'visual_name' => __( 'EDD Software Licensing', 'edd-testing-assistant' ),
			),
			'contents' => array()
	 );

	foreach( $edd_product_settings as $value_slug ) {

		// Set the type of field based on the name of it.
		switch ( $value_slug ) {
			case '_edd_sl_enabled':

				// Add the data about this field to the new array
				$rebuilt_product_fields['product_settings']['contents']['edd_software_licensing']['contents'][$value_slug] = array(
					'info' => array (
						'visual_name' => __( 'Software Licensing - Enabled', 'edd-testing-assistant' ),
						'context' => 'product_setting'
					),
					'testing_values' => array(
						'checked',
						'unchecked'
					)
				);

				break;

			case '_edd_sl_limit':

				// Add the data about this field to the new array
				$rebuilt_product_fields['product_settings']['contents']['edd_software_licensing']['contents'][$value_slug] = array(
					'info' => array (
						'visual_name' => __( 'Software Licensing - Site Limit', 'edd-testing-assistant' ),
						'context' => 'product_setting'
					),
					'testing_values' => array(
						'0',
						'1',
						'2',
					)
				);

				break;

			case '_edd_sl_version':

				// Add the data about this field to the new array
				$rebuilt_product_fields['product_settings']['contents']['edd_software_licensing']['contents'][$value_slug] = array(
					'info' => array (
						'visual_name' => __( 'Software Licensing - Version', 'edd-testing-assistant' ),
						'context' => 'product_setting'
					),
					'testing_values' => array(
						'1.0',
					)
				);

				break;

			case '_edd_sl_upgrade_file_key':

				// Add the data about this field to the new array
				$rebuilt_product_fields['product_settings']['contents']['edd_software_licensing']['contents'][$value_slug] = array(
					'info' => array (
						'visual_name' => __( 'Software Licensing - File to deliver (number)', 'edd-testing-assistant' ),
						'context' => 'product_setting'
					),
					'testing_values' => array(
						'1',
						'2',
						'3',
					)
				);

				break;

			case '_edd_sl_changelog':

				// Add the data about this field to the new array
				$rebuilt_product_fields['product_settings']['contents']['edd_software_licensing']['contents'][$value_slug] = array(
					'info' => array (
						'visual_name' => __( 'Software Licensing - Changelog', 'edd-testing-assistant' ),
						'context' => 'product_setting'
					),
					'testing_values' => array(
						'',
					)
				);

				break;

			case 'edd_sl_download_lifetime':

				// Add the data about this field to the new array
				$rebuilt_product_fields['product_settings']['contents']['edd_software_licensing']['contents'][$value_slug] = array(
					'info' => array (
						'visual_name' => __( 'Software Licensing - License Length: Lifetime', 'edd-testing-assistant' ),
						'context' => 'product_setting'
					),
					'testing_values' => array(
						'checked',
						'unchecked',
					)
				);

				break;

			case '_edd_sl_exp_unit':

				// Add the data about this field to the new array
				$rebuilt_product_fields['product_settings']['contents']['edd_software_licensing']['contents'][$value_slug] = array(
					'info' => array (
						'visual_name' => __( 'Software Licensing - License Length Number (eg: X years)', 'edd-testing-assistant' ),
						'context' => 'product_setting'
					),
					'testing_values' => array(
						'1',
					)
				);

				break;

			case '_edd_sl_exp_length':

				// Add the data about this field to the new array
				$rebuilt_product_fields['product_settings']['contents']['edd_software_licensing']['contents'][$value_slug] = array(
					'info' => array (
						'visual_name' => __( 'Software Licensing - License Length Unit (eg: 1 year/week/month)', 'edd-testing-assistant' ),
						'context' => 'product_setting'
					),
					'testing_values' => array(
						'days',
						'weeks',
						'months',
						'years'
					)
				);

			case '_edd_sl_renewal_discount':

				// Add the data about this field to the new array
				$rebuilt_product_fields['product_settings']['contents']['edd_software_licensing']['contents'][$value_slug] = array(
					'info' => array (
						'visual_name' => __( 'Software Licensing - Renewal Discount (%)', 'edd-testing-assistant' ),
						'context' => 'product_setting'
					),
					'testing_values' => array(
						'0',
						'1',
					)
				);

				break;

		}
	}

	return $rebuilt_product_fields;

}
add_filter( 'edd_testing_assistant_product_fields', 'edd_testing_assistant_software_licensing_rebuilt_product_settings', 10, 2 );
