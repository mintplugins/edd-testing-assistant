/*
 * EDD Testing Assistant Admin
 * https://www.easydigitaldownloads.com
 *
 * Licensed under the GPL license.
 *
 * Author: Phil Johnston
 * Version: 1.0
 * Date: August 1, 2018
 */

window.EDD_Testing_Assistant_Admin = class EDD_Testing_Assistant_Admin extends React.Component {

    constructor( props ){
        super(props);

        this.state = {
            views: null,
            current_view: 'build_scenarios_view',
            number_of_products_in_cart: 0,
            options_to_test: {},
            all_scenarios: {},
            total_scenarios: 1,
            scenarios_are_fresh: false
        };

        this.get_current_view_class = this.get_current_view_class.bind( this );
        this.set_current_view = this.set_current_view.bind( this );
    }

    componentDidMount() {

        this.fetch_settings_and_views();
    }

    fetch_settings_and_views() {

        // Now we will save the settings in EDD so they actually are ready to be tested
        var postData = JSON.stringify({
            nonce: this.props.vars.ajax_nonce_value
        });

        var this_component = this;

        fetch( this.props.vars.admin_url + '?edd-testing-assistant-get-settings-and-views', {
            method: "POST",
            mode: "same-origin",
            credentials: "same-origin",
            headers: {
              "Content-Type": "application/json"
            },
            body: postData
        } ).then(
            function( response ) {
                if ( response.status !== 200 ) {
                    console.log('Looks like there was a problem. Status Code: ' +
                    response.status);
                    return;
                }

                // Examine the text in the response
                response.json().then(
                    function( data ) {
                        if ( data.success ) {

                            this_component.setState( {
                                views: data.settings_and_views
                            } );

                        } else {

                            console.log( 'Unable to fetch settings and views' );
                            console.log( data );


                        }
                    }
                );
            }
        ).catch(
            function( err ) {
                console.log('Fetch Error :-S', err);
            }
        );

    }

    update_state( state_key, state_value ){

        this.setState( {
            [state_key]: state_value
        }, function() {

            // Update the number of scenarios in json as well to match the new state
            var data = update_total_scenarios( this.state.options_to_test, this.state.all_scenarios );

            this.setState( {
                total_scenarios: data['scenario_counter'],
                all_scenarios: data['all_scenarios'],
                scenarios_are_fresh: true,
            } );

        } );

    }

    componentDidUpdate() {

        // If the fresh scenarios have been passed-down to the child components
        if ( this.state.scenarios_are_fresh ) {
            this.setState( {
                scenarios_are_fresh: false
            } );
        }

    }

    get_current_view_class( view_in_question ) {

        var currently_in_view_class_name = 'edd-testing-assistant-current-view';
        var hidden_class_name = 'edd-testing-assistant-hidden-view';

        // If the current visual state matches the view we are getting the class for
        if( this.state.current_view == view_in_question ) {

            return ' ' + currently_in_view_class_name;

        } else {

            return ' ' + hidden_class_name;

        }

    }

    get_current_button_class( view_in_question ) {

        var current_button_class_name = 'edd-testing-assistant-current-tab';

        // If the current visual state matches the view we are getting the class for
        if( this.state.current_view == view_in_question ) {

            return ' ' + current_button_class_name;

        } else {

            return '';

        }

    }

    set_current_view( new_state ) {

        var this_component = this;

        this_component.setState( {
            current_view: new_state,
        } );

    }

    render_left_side_navigation_buttons() {

        var views = this.state.views;

        var mapper = [];

        // This lets us loop through the object
        for (var key in views) {

            mapper.push( <EDD_Testing_Assistant_View_Button key={key} view_slug={key} view_info={ views[key] } current_view={ this.state.current_view } set_current_view={ this.set_current_view.bind( this ) } get_current_button_class={ this.get_current_button_class.bind( this ) } /> )

        }

        // This lets us output the buttons one by one
        return mapper.map((view, index) => {
          return view;
        })
    }

    render_actual_views( views ) {

        var mapper = [];

        // This lets us loop through the object
        for (var key in views ) {

            var DynamicReactComponent = edd_testing_assistant_string_to_component( views[key]['react_component'] );

            mapper.push( <DynamicReactComponent
                key={ key }
                view_slug={ key }
                view_info={ views[key] }
                current_view={ this.state.current_view }
                current_view_class={ this.get_current_view_class( key ) }
                update_parent_state={ this.update_state.bind( this ) }
                all_scenarios={ this.state.all_scenarios }
                frontend_url={ this.props.vars.frontend_url }
                ajaxurl={ this.props.vars.admin_url }
                ajax_nonce={ this.props.vars.ajax_nonce_value }
                scenarios_are_fresh={ this.state.scenarios_are_fresh }
                options_to_test={ this.state.options_to_test }
                number_of_products_in_cart={ this.state.number_of_products_in_cart }
            /> )
        }

        // This lets us output the buttons one by one
        return mapper.map((view, index) => {
          return view;
        })

    }

    render() {

        return (
            <div className={ 'edd-testing-assistant-admin-container edd-testing-assistant-current-view-is-' + this.state.current_view }>
                <div className="edd-testing-assistant-admin-left-side-navigation">
                    <ul>
                        { this.render_left_side_navigation_buttons() }
                    </ul>
                </div>

                <div className='edd-testing-assistant-admin-current-view-container'>
                    { this.render_actual_views( this.state.views ) }
                </div>

            </div>
        );
    }
}

// This component outputs all of the left-size navigation
window.EDD_Testing_Assistant_View_Button = class EDD_Testing_Assistant_View_Button extends React.Component {

    constructor( props ){
        super(props);
    }

    render_submenu() {

        var sub_menus = this.props.view_info.sub_tabs;

        if ( ! sub_menus ) {
            return false;
        }

        var mapper = [];

        // This lets us loop through the object
        for (var key in sub_menus) {

            var view_info = sub_menus[key] ? sub_menus[key] : false;

            mapper.push(
                <EDD_Testing_Assistant_View_Button key={ key } view_slug={ key } view_info={ view_info } current_view={ this.props.current_view } set_current_view={ this.props.set_current_view }  get_current_button_class={ this.props.get_current_button_class } />
            )

        }

        // This lets us output the buttons one by one
        return mapper.map((view, index) => {
          return view;
        })

    }

    render() {

        return (
            <li className={ "edd-testing-assistant-admin-left-tab-button" + this.props.get_current_button_class( this.props.view_slug )  }>
                <button onClick={ this.props.set_current_view.bind( null, this.props.view_slug ) }>
                    <span className="edd-testing-assistant-admin-left-tab-text" aria-hidden="true">{ this.props.view_info.visual_name }</span>
                </button>
                <ul>
                    { this.render_submenu() }
                </ul>
            </li>
        );

    }
}

window.edd_testing_assistant_refresh_all = function edd_testing_assistant_refresh_all(){
    var edd_testing_assistant_admin_exists = document.querySelector( '.edd-testing-assistant-admin-settings' );
    if ( edd_testing_assistant_admin_exists ) {

        var edd_testing_assistant_admins = document.querySelectorAll( '.edd-testing-assistant-admin-settings' );

        edd_testing_assistant_admins.forEach(function( edd_testing_assistant_admin ) {

            ReactDOM.render( <EDD_Testing_Assistant_Admin key={ 'edd-testing-assistant-admin' } vars={ edd_testing_assistant_main_js_vars } />, edd_testing_assistant_admin );
        });

    }
}

edd_testing_assistant_refresh_all();
