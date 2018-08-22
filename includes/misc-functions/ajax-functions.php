<?php

/**
 * Custom endpoint function which fetches the user roles
 *
 * @access   public
 * @since    1.0.0
 * @return   void
 */
function edd_testing_plugin_fetch_user_roles(){

	if ( ! isset( $_GET['pjct_fetch_user_roles'] ) ) {
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
	if ( ! wp_verify_nonce( $decoded['nonce'], 'fetch_user_roles' ) ) {
		echo json_encode( array(
			'success' => false,
			'details' => 'Nonce failed.'
		) );
		die();
	}

	// Fetch the available user roles
	$all_roles = wp_roles()->roles;

	if ( is_array( $all_roles ) ) {

		echo json_encode( array(
			'success' => true,
			'user_roles' => $all_roles
		) );

	} else {

		echo json_encode( array(
			'success' => false,
			'details' => 'No User Roles found.'
		) );

	}

	die();

}
add_action('init', 'edd_testing_plugin_fetch_user_roles');


/**
 * Custom endpoint function which fetches users based on their role
 *
 * @access   public
 * @since    1.0.0
 * @return   void
 */
function edd_testing_plugin_fetch_users(){

	if ( ! isset( $_GET['pjct_fetch_users_by_role'] ) ) {
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
	if ( ! wp_verify_nonce( $decoded['nonce'], 'fetch_users_by_role' ) ) {
		echo json_encode( array(
			'success' => false,
			'details' => 'Nonce failed.'
		) );
		die();
	}

	// Make sure the current user is an admin-level
	if ( ! current_user_can( 'update_plugins' ) ) {
		echo json_encode( array(
			'success' => false,
			'details' => 'Permissions not high enough.'
		) );
		die();
	}

	// Make sure a user role was passed in
	if ( ! $decoded['user_role'] || 'all' == $decoded['user_role'] ) {
		$user_role = 'administrator';
	} else {
		$user_role = sanitize_text_field( $decoded['user_role'] );
	}

	// Make sure an order was passed in
	if ( ! $decoded['order_by'] ) {
		$order_by = 'username';
	} else {
		$order_by = sanitize_text_field( $decoded['order_by'] );
	}

	// Make sure a page number was passed in
	if ( ! $decoded['current_page'] ) {
		$current_page = 1;
	} else {
		$current_page = $decoded['current_page'];
	}

	// Make sure a users per page
	if ( ! $decoded['users_per_page'] ) {
		$users_per_page = 20;
	} else {
		$users_per_page = $decoded['users_per_page'];
	}

	$user_args = array(
		'orderby' => $order_by,
		'role' => $user_role,
		'paged' => $current_page,
		'number' => $users_per_page
	);

	$user_query = new WP_User_Query( $user_args );

	$total_users = $user_query->get_total(); // How many users we have in total (beyond the current page)
	$num_pages = ceil($total_users / $users_per_page); // How many pages of users we will need

	if ( ! empty( $user_query->get_results() ) ) {
		foreach( $user_query->get_results() as $queried_user ) {

			// Strip out the user password
			unset( $queried_user->data->user_pass );
			$users[] = $queried_user;
		}
	} else {
		$users = array();
	}

	if ( is_array( $users ) ) {

		echo json_encode( array(
			'success' => true,
			'total_pages' => $num_pages,
			'users' => $users,
			'current_page' => 0 == $num_pages ? 0 : $current_page,
		) );

	} else {

		echo json_encode( array(
			'success' => false,
			'details' => 'No Users with that role were found.'
		) );

	}

	die();

}
add_action('init', 'edd_testing_plugin_fetch_users');
