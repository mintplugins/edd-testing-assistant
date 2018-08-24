/*
 * EDD Testing Plugin Admin
 * https://www.easydigitaldownloads.com
 *
 * Licensed under the GPL license.
 *
 * Author: Phil Johnston
 * Version: 1.0
 * Date: August 1, 2018
 */


window.edd_testing_plugin_admin_lightbox_vars = {
    title: null,
    description: null,
};

window.EDD_Testing_Plugin_Admin = class EDD_Testing_Plugin_Admin extends React.Component {

    constructor( props ){
        super(props);

        this.views = this.props.views;

        this.state = {
            current_view: 'define_scenarios', //get_started, define_scenarios
            options_to_test: {},
            total_scenarios: 1,
            all_scenarios: {}
        };

        this.get_current_view_class = this.get_current_view_class.bind( this );
        this.set_current_view = this.set_current_view.bind( this );
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
            } );

        } );

    }

    get_current_view_class( view_in_question ) {

        var currently_in_view_class_name = 'edd-testing-plugin-current-view';
        var hidden_class_name = 'edd-testing-plugin-hidden-view';

        // If the current visual state matches the view we are getting the class for
        if( this.state.current_view == view_in_question ) {

            return ' ' + currently_in_view_class_name;

        } else {

            return ' ' + hidden_class_name;

        }

    }

    get_current_button_class( view_in_question ) {

        var current_button_class_name = 'edd-testing-plugin-current-tab';

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

        var views = this.views;

        var mapper = [];

        // This lets us loop through the object
        for (var key in views) {

            mapper.push( <EDD_Testing_Plugin_View_Button key={key} view_slug={key} view_info={ views[key] } current_view={ this.state.current_view } set_current_view={ this.set_current_view.bind( this ) } get_current_button_class={ this.get_current_button_class.bind( this ) } /> )

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

            var DynamicReactComponent = edd_testing_plugin_string_to_component( views[key]['react_component'] );

            mapper.push( <DynamicReactComponent key={ key } view_slug={ key } view_info={ views[key] } current_view={ this.state.current_view } current_view_class={ this.get_current_view_class( key ) } update_parent_state={ this.update_state.bind( this ) } all_scenarios={ this.state.all_scenarios } ajaxurl={ this.props.ajaxurl } ajax_nonce={ this.props.ajax_nonce } /> )
        }

        // This lets us output the buttons one by one
        return mapper.map((view, index) => {
          return view;
        })

    }

    render() {

        return (
            <div className={ 'edd-testing-plugin-admin-container edd-testing-plugin-current-view-is-' + this.state.current_view }>
                <div className="edd-testing-plugin-admin-left-side-navigation">
                    <ul>
                        { this.render_left_side_navigation_buttons() }
                    </ul>
                </div>

                <div className='edd-testing-plugin-admin-current-view-container'>
                    { this.render_actual_views( this.views ) }
                </div>

                <EDD_Testing_Plugin_Admin_Lightbox />

            </div>
        );
    }
}

// This component outputs all of the left-size navigation
window.EDD_Testing_Plugin_View_Button = class EDD_Testing_Plugin_View_Button extends React.Component {

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
                <EDD_Testing_Plugin_View_Button key={ key } view_slug={ key } view_info={ view_info } current_view={ this.props.current_view } set_current_view={ this.props.set_current_view }  get_current_button_class={ this.props.get_current_button_class } />
            )

        }

        // This lets us output the buttons one by one
        return mapper.map((view, index) => {
          return view;
        })

    }

    render() {

        return (
            <li className={ "edd-testing-plugin-admin-left-tab-button" + this.props.get_current_button_class( this.props.view_slug )  }>
                <button onClick={ this.props.set_current_view.bind( null, this.props.view_slug ) }>
                    <span className="edd-testing-plugin-admin-left-tab-text" aria-hidden="true">{ this.props.view_info.visual_name }</span>
                </button>
                <ul>
                    { this.render_submenu() }
                </ul>
            </li>
        );

    }
}

// This component outputs the "Helper JSON" view, which gives you a starting point to define your tests.
window.EDD_Testing_Plugin_Helper_JSON_View = class EDD_Testing_Plugin_Helper_JSON_View extends React.Component {

    constructor( props ){
        super(props);

        this.state = {
            component_has_mounted: false,
            options_to_test: {},
            total_scenarios: 1,
            all_scenarios: {}
        }

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
            } );

        } );

    }

    render_options( options ) {

        var mapper = [];

        // This lets us loop through the object
        for (var key in options) {
            mapper.push( <div key={key} className={ 'edd-testing-plugin-helper-json-option'}>
                { this.render_option( options[key], key ) }
            </div> )
        }

        // This lets us output the buttons one by one
        return mapper.map((option, index) => {
          return option;
        })

    }

    render_option( option, key ){

        var DynamicReactComponent = edd_testing_plugin_string_to_component( option['react_component'] );

        if ( DynamicReactComponent ) {

            return (
                <div className="edd-testing-plugin-helper-json-option">
                    <div><strong>{ option.visual_title }</strong></div>
                    <p>{ option.visual_description }</p>
                    <div>{ <DynamicReactComponent key={ key } option_info={ option } update_parent_state={ this.update_state.bind( this ) } all_scenarios={ this.state.all_scenarios } /> }</div>
                </div>
            )
        }
    }

    scenarios_to_test_text( total_scenarios ) {

        var button_text;

        if ( this.state.total_scenarios == 1 ) {
            button_text = total_scenarios + ' scenario to test';
        } else {
            button_text = total_scenarios + ' scenarios to test';
        }

        return button_text;
    }

    render() {

        var json_stringified = JSON.stringify( {
            options_to_test: this.state.options_to_test,
            all_scenarios: this.state.all_scenarios
        }, null, 2 );

        return (
            <div className={ 'edd-testing-plugin-admin-helper-json-view' + this.props.current_view_class }>
                <div className="edd-testing-plugin-admin-view-title">
                    <h2>{ this.props.view_info.visual_name }</h2>
                </div>
                <div className={ 'edd-testing-plugin-admin-view-description' }>
                    <p>{ this.props.view_info.description }</p>
                </div>
                <div className={ 'edd-testing-plugin-helper-json' }>

                    <div className="edd-testing-plugin-helper-json-form">

                        <div className="edd-testing-plugin-helper-json-options">
                            { this.render_options( this.props.view_info.scenario_generation_options ) }
                        </div>

                    </div>

                    <EDD_Testing_Plugin_Build_Scenarios total_scenarios={ this.state.total_scenarios }  all_scenarios={ this.state.all_scenarios } update_parent_state={ this.update_state.bind( this ) } />

                    <div className="edd-testing-plugin-generate-testing-json-area">
                        <h2>{ 'Generate Testing JSON' } </h2>
                        <p>{ 'Based on the above selection, ' + this.state.total_scenarios + ' scenario(s) need to be tested. Copy the helper JSON and move on to the next step called "Define Scenarios". It is recommended that the helper JSON been pasted into the relating GitHub issue so that others can easily run the same series of tests.' }</p>
                        <a className="edd-testing-plugin-copy-json-button button" onClick={ edd_testing_plugin_copy_text_to_clipboard.bind( null, json_stringified ) }>{ 'Copy helper JSON' }</a> <a className="button" href={ 'data:text/json;charset=utf-8,' + encodeURIComponent( json_stringified ) } download={ 'test.json' }>{ 'Download helper JSON file' }</a>
                    </div>

                </div>
            </div>
        )
    }

}

// This component is the portion that accepts a JSON file, which defines the settings which will be combined to create scenarios.
window.EDD_Testing_Plugin_Define_Scenarios_View = class EDD_Testing_Plugin_Define_Scenarios_View extends React.Component {

    constructor( props ){
        super(props);

        this.state = {
            helper_json: '',
            helper_json_valid: 'unknown',
        };

        this.handle_helper_json_change = this.handle_helper_json_change.bind( this );
    }

    handle_helper_json_change( event ) {

        this.setState( {
            helper_json: event.target.value
        } );

        if ( ! event.target.value ) {
            this.setState( {
                helper_json_valid: 'unknown'
            } );

            return;
        }

        // Check if what was entered is valid JSON
        var is_valid = true;

        try {
            var helper_object = JSON.parse( event.target.value );
        } catch(e) {
            // If the JSOn entered is not valid
            is_valid = false;
        }

        this.setState( {
            helper_json_valid: is_valid
        } );

        // If what was entered is valid json, pass it up to the parent so it can be broken-out into scenarios
        if ( is_valid ) {

            // Update the options to test in the parent, which will trigger a calculation of the scenarios
            this.props.update_parent_state( 'options_to_test', helper_object['options_to_test'] );
            this.props.update_parent_state( 'all_scenarios', helper_object['all_scenarios'] );

            // Set the view to be the "Run Scenarios" step
            this.props.update_parent_state( 'current_view', 'run_scenarios' );

        }


    }

    helper_json_valid_class_name( helper_json_valid ) {

        if ( 'unknown' == helper_json_valid ) {
            return '';
        }

        if ( helper_json_valid ) {
            return ' ' + 'edd-testing-plugin-json-helper-valid';
        } else {
            return ' ' + 'edd-testing-plugin-json-helper-invalid';
        }
    }

    render() {

        return (
            <div className={ 'edd-testing-plugin-admin-define-tests-view' + this.props.current_view_class }>
                <div className="edd-testing-plugin-admin-view-title">
                    <h2>{ this.props.view_info.visual_name }</h2>
                </div>
                <div className={ 'edd-testing-plugin-admin-view-description' }>
                    { this.props.view_info.description }
                </div>
                <div className={ 'edd-testing-plugin-helper-json-paste-area' + this.helper_json_valid_class_name( this.state.helper_json_valid ) }>
                    <textarea value={ this.state.helper_json } onChange={ this.handle_helper_json_change.bind( null ) }></textarea>
                </div>
            </div>
        )
    }

}

// This component is where you enter the instructions and expected results for each scenario
window.EDD_Testing_Plugin_Build_Scenarios = class EDD_Testing_Plugin_Build_Scenarios extends React.Component {

    constructor( props ){
        super(props);

        this.state = {
            current_scenario: 1,
        };

        this.input_delay = null;
        this.input_delay = null;
        this.set_current_scenario = this.set_current_scenario.bind( this );
        this.handle_instruction_change = this.handle_instruction_change.bind( this );
    }

    handle_instruction_change( state_prefix, event ) {

        // Save the value to the state
        this.setState( {
            [state_prefix + '_' + this.state.current_scenario]: event.target.value
        } );

        // Set up a delay which waits to save the tip until .5 seconds after they stop typing.
        if( this.input_delay ) {
            // Clear the keypress delay if the user just typed
            clearTimeout( this.input_delay );
            this.input_delay = null;
        }

        var this_component = this;
        var new_value = event.target.value;

        // (Re)-Set up the save to fire in 500ms
        this.input_delay = setTimeout( function() {

            clearTimeout( this_component.input_delay );

            var all_scenarios = this_component.props.all_scenarios;

            // Update the instruction for the current scenario
            all_scenarios[this_component.state.current_scenario]['info'][state_prefix] = new_value;

            // Save the instruction to the current scenario
            this_component.props.update_parent_state( 'all_scenarios', all_scenarios );

        }, 500);

    }

    set_current_scenario( key ) {

        this.setState( {
            current_scenario: key
        } );

        // If an instruction key has not yet been set up for this scenario
        if ( ! this.state['instructions_' + key] ) {
            this.setState( {
                ['instructions_' + key]: ''
            } );
        }

        if ( ! this.state['instructions_' + key] ) {
            this.setState( {
                ['expected_results_' + key]: ''
            } );
        }
    }

    get_current_scenario_button_class( scenario_in_question ) {

        if ( this.state.current_scenario == scenario_in_question ) {
            return ' active';
        } else {
            return '';
        }
    }

    render_scenario_links( all_scenarios, current_scenario ) {

        var mapper = [];

        // Loop through each scenario and output a link to it
        for( var scenario in all_scenarios ) {

            mapper.push( <button key={ scenario } className={ 'edd-testing-plugin-scenario-link button' + this.get_current_scenario_button_class( scenario )  } onClick={ this.set_current_scenario.bind( null, scenario ) }>
                { scenario }
            </button> );
        }

        // This lets us output the buttons one by one
        return mapper.map((scenario_link, index) => {
          return scenario_link;
        })
    }

    render_current_scenario( current_scenario, all_scenarios ) {

        var mapper = [];

        // Loop through all of the settings in the current scenario
        for( var setting in all_scenarios[current_scenario]['values'] ) {
            mapper.push( <div key={ setting } className={ 'edd-testing-plugin-scenario-setting' }>
                <span className={ 'edd-testing-plugin-scenario-setting-name' }><strong>{ setting }</strong>: </span>
                <span className={ 'edd-testing-plugin-scenario-setting-value' }>{ all_scenarios[current_scenario]['values'][setting]['value'] }</span>
            </div> );
        }

        // This lets us output the settings one by one
        return mapper.map((setting, index) => {
          return setting;
        })
    }

    render() {

        if ( this.props.all_scenarios[this.state.current_scenario] ) {

            return (
                <div className="edd-testing-plugin-scenario-instructions-and-results-area">
                    <h2>Enter scenario instructions and expected results</h2>
                    <p>{ 'Based on the above selection, ' + this.props.total_scenarios + ' scenario(s) need to be tested. Enter the testing instructions for each scenario, as well as the expected results of each scenario. These instructions will be passed along to all other testers when you give them the Testing JSON.' }</p>

                    <div className={ 'edd-testing-plugin-scenario-chooser-area' }>
                        { this.render_scenario_links( this.props.all_scenarios, this.state.current_scenario ) }
                    </div>

                    <div className={ 'edd-testing-plugin-scenario-instructions' }>
                        <div className={ 'edd-testing-plugin-build-instructions-title' }>
                            <strong>{ 'Enter the instructions for testing scenario ' + this.state.current_scenario }</strong>
                            <textarea
                                onChange={ this.handle_instruction_change.bind( null, 'instructions' ) }
                                className={ 'edd-testing-plugin-instructions' }
                                value={ this.state['instructions_' + this.state.current_scenario] }
                                placeholder={ 'Enter the testing instructions for scenario ' + this.state.current_scenario }
                            />
                        </div>
                    </div>

                    <div className={ 'edd-testing-plugin-scenario-expected-results' }>
                        <div className={ 'edd-testing-plugin-build-instructions-title' }>
                            <strong>{ 'Enter the results you expect to get when this scenario ' + this.state.current_scenario + ' has been tested' }</strong>
                            <textarea
                                onChange={ this.handle_instruction_change.bind( null, 'expected_results' ) }
                                className={ 'edd-testing-plugin-instructions' }
                                value={ this.state['expected_results_' + this.state.current_scenario] }
                                placeholder={ 'Enter the expected results for scenario ' + this.state.current_scenario }
                            />
                        </div>
                    </div>

                    <div className={ 'edd-testing-plugin-current-scenario-area' }>
                        <p><strong>{ 'The settings for scenario ' + this.state.current_scenario + ' are: ' }</strong></p>
                        <div className={ 'edd-testing-plugin-settings-values-table' }>
                            { this.render_current_scenario( this.state.current_scenario, this.props.all_scenarios ) }
                        </div>
                    </div>
                </div>
            )
        } else {
            return( '' );
        }
    }

}


// This component is the one that displays, and assist with all scenarios that need to be tested
window.EDD_Testing_Plugin_Run_Scenarios = class EDD_Testing_Plugin_Run_Scenarios extends React.Component {

    constructor( props ){
        super(props);

        this.state = {
            current_scenario: 1,
            current_browser_tab: 1,
            has_been_in_view: false,
            scenario_data_set: false,
            browser_tab_1_url: this.props.ajaxurl,
            browser_tab_2_url: this.props.ajaxurl + '/wp-admin/',
            browser_tab_3_url: this.props.ajaxurl + '/wp-admin/',
            browser_tab_4_url: this.props.ajaxurl + '/wp-admin/',
            browser_tab_5_url: this.props.ajaxurl + '/wp-admin/',
        };

        this.set_current_scenario = this.set_current_scenario.bind( this );
        this.switch_browser_tab = this.switch_browser_tab.bind( this );
        this.handle_iframe_loaded = this.handle_iframe_loaded.bind( this );
        this.render_browser = this.render_browser.bind( this );
        this.set_scenario_on_server = this.set_scenario_on_server.bind( this );

    }

    componentDidUpdate() {

        if ( 'run_scenarios' == this.props.current_view && ! this.state.has_been_in_view ) {
            this.setState( {
                has_been_in_view: true
            } );
        }

        if ( ! this.state.has_been_in_view ) {
            this.set_scenario_on_server();
        }
    }

    set_scenario_on_server() {

        this.setState( {
            scenario_data_set: 'attempting_to_set'
        } );

        // Now we will save the settings in EDD so they actually are ready to be tested
        var postData = JSON.stringify({
            action: 'edd_testing_plugin_set_scenario',
            current_scenario: this.state.current_scenario,
            all_scenarios: this.props.all_scenarios,
            nonce: this.props.ajax_nonce
        });

        var this_component = this;

        fetch( this.props.ajaxurl + '?edd-testing-plugin-set-scenario', {
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
                                scenario_data_set: true
                            } );

                        } else {

                            console.log( 'Scenario not set' );
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

    set_current_scenario( key ) {

        this.setState( {
            current_scenario: key
        } );

        this.set_scenario_on_server();
    }

    get_current_scenario_button_class( scenario_in_question ) {

        if ( this.state.current_scenario == scenario_in_question ) {
            return ' active';
        } else {
            return '';
        }
    }

    render_scenario_links( all_scenarios, current_scenario ) {

        var mapper = [];

        // Loop through each scenario and output a link to it
        for( var scenario in all_scenarios ) {

            mapper.push( <button key={ scenario } className={ 'edd-testing-plugin-scenario-link button' + this.get_current_scenario_button_class( scenario )  } onClick={ this.set_current_scenario.bind( null, scenario ) }>
                { scenario }
            </button> );
        }

        // This lets us output the buttons one by one
        return mapper.map((scenario_link, index) => {
          return scenario_link;
        })
    }

    render_current_scenario( current_scenario, all_scenarios ) {

        var mapper = [];

        if ( ! all_scenarios[current_scenario] ) {
            return '';
        }

        // Loop through all of the settings in the current scenario
        for( var setting in all_scenarios[current_scenario]['values'] ) {

            mapper.push( <div key={ setting } className={ 'edd-testing-plugin-scenario-setting' }>
                <div className={ 'edd-testing-plugin-scenario-setting-name' }><strong>{ setting }</strong>: </div>
                <div className={ 'edd-testing-plugin-scenario-setting-value' }>{ all_scenarios[current_scenario]['values'][setting]['value'] }</div>
            </div> );
        }

        // This lets us output the settings one by one
        return mapper.map((setting, index) => {
          return setting;
        })
    }

    browser_tab_hidden_attribute( browser_tab_id, current_browser_tab ) {

        if ( current_browser_tab != browser_tab_id ) {
            return 'hidden';
        }

    }

    switch_browser_tab( browser_tab_id, event ) {
        this.setState( {
            current_browser_tab: browser_tab_id
        } );
    }

    handle_iframe_loaded( browser_tab_id, event ) {

        var iframe = document.getElementById( "edd-testing-plugin-browser-tab-" + browser_tab_id );

        if ( iframe ) {
            title = document.getElementById( "edd-testing-plugin-browser-tab-" + browser_tab_id ).contentDocument.title;

            if ( title ) {

                this.setState( {
                    browser_tab_1_title: title
                } );

            }
        }
    }

    render_browser() {

        return '';

        if ( this.state.has_been_in_view ) {
            return(
                <div className={ 'edd-testing-plugin-testing-area' }>
                    <div className='edd-testing-plugin-current-scenario-title'><strong>{ 'Testing Window:' }</strong></div>
                    <p>{ 'Feel free to use the window below to run your test for this scenario:' }</p>
                    <div className={ 'edd-testing-plugin-browser' }>
                        <div className={ 'edd-testing-plugin-browser-address-bar' }>
                            { this.state['browser_tab_' + this.state.current_browser_tab + '_url'] }
                        </div>
                        <div className={ 'edd-testing-plugin-browser-tabs' }>
                            <button onClick={ this.switch_browser_tab.bind( null, 1 ) }>Tab 1</button>
                            <button onClick={ this.switch_browser_tab.bind( null, 2 ) }>Tab 2</button>
                            <button onClick={ this.switch_browser_tab.bind( null, 3 ) }>Tab 3</button>
                            <button onClick={ this.switch_browser_tab.bind( null, 4 ) }>Tab 4</button>
                            <button onClick={ this.switch_browser_tab.bind( null, 5 ) }>Tab 5</button>
                        </div>
                        <iframe onChange={ this.handle_iframe_loaded.bind( null, 1 ) } id="edd-testing-plugin-browser-tab-1" hidden={ this.browser_tab_hidden_attribute( 1, this.state.current_browser_tab ) } src={ this.state.browser_tab_1_url }></iframe>
                        <iframe hidden={ this.browser_tab_hidden_attribute( 2, this.state.current_browser_tab ) } src={ this.state.browser_tab_2_url }></iframe>
                        <iframe hidden={ this.browser_tab_hidden_attribute( 3, this.state.current_browser_tab ) } src={ this.state.browser_tab_3_url }></iframe>
                        <iframe hidden={ this.browser_tab_hidden_attribute( 4, this.state.current_browser_tab ) } src={ this.state.browser_tab_4_url }></iframe>
                        <iframe hidden={ this.browser_tab_hidden_attribute( 5, this.state.current_browser_tab ) } src={ this.state.browser_tab_5_url }></iframe>
                    </div>
                </div>
            )
        }
    }

    get_testing_instructions( possibly_empty_instructions ) {
        if ( possibly_empty_instructions ) {
            return possibly_empty_instructions;
        } else {
            return 'None';
        }
    }

    render_scenario_has_been_set_text() {
        if ( 'attempting_to_set' == this.state.scenario_data_set ) {
            return (
                <div className={ 'edd-testing-plugin-setting-scenario-data' }>Setting scenario data...</div>
            )
        }
        if ( this.state.scenario_data_set ) {
            return (
                <div className={ 'edd-testing-plugin-scenario-data-set' }>Scenario data has been saved and set! You are ready to test.</div>
            )
        }

        return (
            <div className={ 'edd-testing-plugin-scenario-data-not-set' }>Unable to set scenario data! The nonce has likely timed out and you have to refresh.</div>
        )

    }

    render() {

        if ( ! this.props.all_scenarios[this.state.current_scenario] ) {
            return '';
        }

        return (
            <div className={ 'edd-testing-plugin-admin-run-scenarios-view' + this.props.current_view_class }>
                <div className="edd-testing-plugin-admin-view-title">
                    <h2>{ this.props.view_info.visual_name }</h2>
                </div>
                <div className={ 'edd-testing-plugin-admin-view-description' }>
                    { this.props.view_info.description }
                </div>
                <div className={ 'edd-testing-plugin-scenario-chooser-area' }>
                    { this.render_scenario_links( this.props.all_scenarios, this.state.current_scenario ) }
                    <div>{ this.render_scenario_has_been_set_text() }</div>
                </div>
                <div className={ 'edd-testing-plugin-current-scenario-area' }>
                    <div className='edd-testing-plugin-current-scenario-title'><strong>{ 'Current Scenario: ' + this.state.current_scenario }</strong></div>
                    <div className='edd-testing-plugin-instruction-area'>
                        <div className="edd-testing-plugin-testing-instructions">
                            <strong>Testing Instructions:</strong> { this.get_testing_instructions( this.props.all_scenarios[this.state.current_scenario]['info']['instructions'] ) }
                        </div>
                        <div className="edd-testing-plugin-testing-expected-results">
                            <strong>Expected Results:</strong> { this.get_testing_instructions( this.props.all_scenarios[this.state.current_scenario]['info']['expected_results'] ) }
                        </div>
                    </div>
                    <p>{ 'The settings for scenario ' + this.state.current_scenario + ' are: ' }</p>
                    <div className={ 'edd-testing-plugin-settings-values-table' }>
                        { this.render_current_scenario( this.state.current_scenario, this.props.all_scenarios ) }
                    </div>
                </div>
                { this.render_browser() }
            </div>
        )
    }

}

window.EDD_Testing_Plugin_Radio_Boolean = class EDD_Testing_Plugin_Radio_Boolean extends React.Component {

    constructor( props ){
        super(props);

        this.handle_yes_no_radio_change = this.handle_yes_no_radio_change.bind( this );
        this.get_yes_no_radio_checked_value = this.get_yes_no_radio_checked_value.bind( this );
    }

    handle_yes_no_radio_change( event ) {

        var state_variable_key = event.target.name;

        this.setState( {
            [state_variable_key]: event.target.value
        } );

        var this_component = this;

        // Wait for the state to update
        setTimeout( function() {
            this_component.update_scenario_json();
        }, 500);
    }

    get_yes_no_radio_checked_value( radio_button, state_variable_key ) {

        if ( radio_button == 'yes' ) {
            if ( 'yes' == this.state[state_variable_key] ) {
                return true;
            } else {
                return false;
            }
        }

        if ( radio_button == 'no' ) {
            if ( 'no' == this.state[state_variable_key] ) {
                return true;
            } else {
                return false;
            }
        }
    }

    render() {
        return (
            <div className={ 'edd-testing-plugin-radio-boolean-option' }>
            Radio Boolan
            </div>
        );
    }

}

window.EDD_Testing_Plugin_Multiple_Checkboxes = class EDD_Testing_Plugin_Multiple_Checkboxes extends React.Component {

    constructor( props ){
        super(props);

        this.state = {
            options: this.props.option_info.options
        };

        this.set_default_state_of_children_checkboxes = this.set_default_state_of_children_checkboxes.bind( this );
        this.handle_checkbox_change = this.handle_checkbox_change.bind( this );
        this.add_another_variant = this.add_another_variant.bind( this );
        this.delete_a_variant = this.delete_a_variant.bind( this );
        this.save_variant = this.save_variant.bind( this );
        this.handle_variant_key_press = this.handle_variant_key_press.bind( this );

        // Set up refs for each child field
        this.references_to_fields = {};
    }

    set_default_state_of_children_checkboxes( children_to_set, state_prefix, state_holder ) {

        for ( var child_key in children_to_set ) {

            if ( isNaN( child_key ) ) {

                // Create the new key
                var new_key = state_prefix ? state_prefix + '||' + child_key : child_key;

                // Set the state to be empty, or unchecked
                state_holder[new_key] = '';

                // Loop through each group of children within this child and set the state for those as well
                state_holder = this.set_default_state_of_children_checkboxes( children_to_set[child_key]['contents'], new_key, state_holder );
            }

        }

        return state_holder;

    }

    componentDidMount() {

        // Set the default state of all the checkboxes to be unchecked
        var nested_checkboxes = this.state.options;
        var state_holder = this.state;

        state_holder = this.set_default_state_of_children_checkboxes( nested_checkboxes, null, state_holder );

        this.setState( state_holder, function() {

            this.setState( {
                component_has_mounted: true
            } );

        } );

    }

    add_child_checkbox_to_options_to_test( children_to_set, state_prefix, this_group, options_to_test, doing_sub_level = false ) {


        for ( var child_key in children_to_set ) {

            if ( isNaN( child_key ) ) {

                // Create the new key
                var new_key = state_prefix ? state_prefix + '||' + child_key : child_key;

                // If this checkbox is checked
                if ( this.state[new_key] ) {

                    if ( ! doing_sub_level ) {

                        var this_group = {};

                        // Loop through each group of children within this child, and store each sublevel undert this top-level parent
                        options_to_test[child_key] = this.add_child_checkbox_to_options_to_test( children_to_set[child_key]['contents'], new_key, this_group, options_to_test, true );

                    } else {

                        // Keep digging until we get to the last level of settings
                        if ( children_to_set[child_key]['contents'] ) {
                            // Loop through each group of children within this child, and store it in the group parent
                            this_group[child_key] = this.add_child_checkbox_to_options_to_test( children_to_set[child_key]['contents'], new_key, {}, options_to_test, true );
                        } else {
                            this_group[child_key] = children_to_set[child_key];
                        }
                    }
                }
            }
        }

        if ( doing_sub_level ) {
            return this_group;
        } else {
            return options_to_test;
        }

    }

    generate_array_of_options_to_test() {

        var nested_checkboxes = this.state.options;
        var options_to_test = {};

        // Set all of the checkbox state values
        options_to_test = this.add_child_checkbox_to_options_to_test( nested_checkboxes, null, {}, options_to_test, false );

        // Set the parent state
        this.props.update_parent_state( 'options_to_test', options_to_test );

    }

    handle_variant_key_press( testing_values_key, path_to_child_group, parent_key, event ) {
        // If a key was just pressed
        if ( event.key ) {

            // If that key was the enter key
            if ( 'Enter' == event.key ) {

                // Add a new variant field
                this.add_another_variant( testing_values_key, path_to_child_group, parent_key, event );
            }

            // If backspace key was the enter key
            if ( 'Backspace' == event.key ) {

                if ( ! event.target.value ) {
                    // If the value of the field is blank, remove the field altogether
                    this.delete_a_variant( testing_values_key, path_to_child_group, parent_key, event );
                }
            }
        }
    }

    add_another_variant( testing_values_key, path_to_child_group, parent_key, event ) {

        var options = this.state.options;

        // This could be made to be more dynamic, but for now, we'll assume all testing values are at the 2 level (0, 1, 2)
        var testing_values = options[path_to_child_group[0]]['contents'][path_to_child_group[1]]['contents'][path_to_child_group[2]]['testing_values'];

        testing_values_key = parseInt( testing_values_key );

        // Add the new, blank testing value
        testing_values.splice( testing_values_key + 1, 0, '' );

        options[path_to_child_group[0]]['contents'][path_to_child_group[1]]['contents'][path_to_child_group[2]]['testing_values'] = testing_values;

        // Set the state here too
        this.setState( {
            options: options
        }, function() {

            // Once the state has updated, re-generate the array of options to test
            this.generate_array_of_options_to_test();

            // Set the keyboard focus on the newly created field
            this.references_to_fields[parent_key + '-' + ( testing_values_key + 1 )].current.focus();

        } );

    }

    delete_a_variant( testing_values_key, path_to_child_group, parent_key, event ) {

        event.preventDefault();

        // If this is the last field here, don't delete it
        if ( 0 == testing_values_key ) {
            return;
        }

        var options = this.state.options;

        // This could be made to be more dynamic, but for now, we'll assume all testing values are at the 2 level (0, 1, 2)
        var testing_values = options[path_to_child_group[0]]['contents'][path_to_child_group[1]]['contents'][path_to_child_group[2]]['testing_values'];

        testing_values_key = parseInt( testing_values_key );

        // Delete the field in question
        testing_values.splice( testing_values_key, 1 );

        options[path_to_child_group[0]]['contents'][path_to_child_group[1]]['contents'][path_to_child_group[2]]['testing_values'] = testing_values;

        // Set the state here too
        this.setState( {
            options: options
        }, function() {

            // Once the state has updated, re-generate the array of options to test
            this.generate_array_of_options_to_test();

            // Set the keyboard focus on the previous field
            this.references_to_fields[parent_key + '-' + ( testing_values_key -1 )].current.focus();

        } );

    }

    save_variant( testing_values_key, path_to_child_group, event ) {

        var options = this.state.options;

        // This could be made to be more dynamic, but for now, we'll assume all testing values are at the 2 level (0, 1, 2)
        var testing_values = options[path_to_child_group[0]]['contents'][path_to_child_group[1]]['contents'][path_to_child_group[2]]['testing_values'];

        // Update the variant value to the one just typed
        testing_values[testing_values_key] = event.target.value;

        options[path_to_child_group[0]]['contents'][path_to_child_group[1]]['contents'][path_to_child_group[2]]['testing_values'] = testing_values;

        // Set the state here too
        this.setState( {
            options: options
        }, function() {

            // Once the state has updated, re-generate the array of options to test
            this.generate_array_of_options_to_test();

        } );

    }

    handle_checkbox_change( event ) {

        var all_checkboxes = this.state.options;
        var name = event.target.name;
        var path_to_child_group = name.split( '||' );
        var second_level_children_to_set = null;
        var third_level_children_to_set = null;

        if ( this.state[name] ) {
            var checked_value = '';
        } else {
            var checked_value = 'checked';
        }

        var children_to_check = all_checkboxes;

        // Check/uncheck all child settings accordingly
        if ( path_to_child_group ) {
            for ( var key in path_to_child_group ) {
                var section_key = path_to_child_group[key];

                // Narrow the array down
                children_to_check = children_to_check[section_key]['contents'];

            }
        }

        this.setState( {
            [name] : checked_value
        }, function() {

            // Once the state has updated, re-generate the array of options to test
            this.generate_array_of_options_to_test();

        } );

    }

    render_variants( possibly_testing_values, parent_is_checked = false, parent_key ) {

        if ( ! possibly_testing_values['testing_values'] ) {
            return;
        }

        var mapper = [];
        var testing_values = possibly_testing_values['testing_values'];

        // Set up the "hidden" paramater
        if ( ! parent_is_checked) {
            var hidden_style = {
                display:'none'
            };
        } else {
            var hidden_style = {};
        }

        var path_to_child_group = parent_key.split( '||' );

        // This lets us loop through the object
        for ( var key in testing_values ) {

            // Create a node reference for this field
            this.references_to_fields[parent_key + '-' + key] = React.createRef();

            mapper.push( <div key={key} style={ hidden_style } className={ 'edd-testing-plugin-testing-values'}>
                <input
                    type="text"
                    name={ parent_key }
                    className={ parent_key }
                    testing_key={ key }
                    value={ testing_values[key] }
                    placeholder={ 'Replace me with your desired testing value' }
                    onChange={ this.save_variant.bind( null, key, path_to_child_group ) }
                    onKeyDown={ this.handle_variant_key_press.bind( null, key, path_to_child_group, parent_key ) }
                    ref={ this.references_to_fields[parent_key + '-' + key] }
                />
            </div> );

        }

        mapper.push( <button key={ 'add_another_variant' } style={ hidden_style } className={ 'button edd-testing-plugin-add-variant-button' } onClick={ this.add_another_variant.bind( null, key, path_to_child_group, parent_key ) }>
            <span>Add another variant</span>
        </button> );

        // This lets us output the buttons one by one
        return mapper.map((setting, index) => {
          return setting;
        })

    }

    render_checkboxes( checkboxes, name = '', doing_sub_level = false, parent_name = '', parent_is_checked = false) {

        var mapper = [];

        // This lets us loop through the object
        for (var key in checkboxes) {

            if ( ! checkboxes[key]['info'] ) {
                continue;
            }

            if ( key == 'testing_values' ) {
                continue;
            }

            // Set up the "hidden" paramater
            if ( doing_sub_level && ! parent_is_checked) {
                var hidden = 'hidden';
            } else {
                var hidden = '';
            }

            // Set up the name paramater
            if ( doing_sub_level ) {
                parent_name = name;
                var name = name + '||' + key;
            } else {
                var name = key;
            }

            mapper.push( <div key={key} hidden={ hidden } className={ 'edd-testing-plugin-multiple-checkboxes-option'}>
                <label>
                    <input type="checkbox" name={ name } onChange={ this.handle_checkbox_change.bind( null ) } checked={ this.state[name] } />{ checkboxes[key]['info']['visual_name'] }
                </label>
                <div className={ 'edd-testing-plugin-multiple-checkboxes-level'}>
                    { this.render_checkboxes( checkboxes[key]['contents'], name, true, parent_name, this.state[name] ) }
                    { this.render_variants( checkboxes[key], this.state[name], name ) }
                </div>
            </div> );

            // Remove the most recent key from the name since it's now been dealt with
            if ( doing_sub_level ) {
                var name = parent_name;
            }
        }

        // This lets us output the buttons one by one
        return mapper.map((setting, index) => {
          return setting;
        })

    }

    render() {

        if ( ! this.state.component_has_mounted ) {
            return false
        }

        return (
            <div className={ 'edd-testing-plugin-multiple-checkboxes-option' }>
                { this.render_checkboxes( this.state.options ) }
            </div>
        );
    }

}

window.EDD_Testing_Plugin_Admin_Lightbox = class EDD_Testing_Plugin_Admin_Lightbox extends React.Component {

    constructor( props ){
        super(props);

        this.handle_key_press = this.handle_key_press.bind( this );
        this.toggle_lightbox = this.toggle_lightbox.bind( this );
    }

    componentDidUpdate() {

        if ( ! this.props.lightbox_open ) {
            // Remove a listener for the ESC key when the lightbox is closed
            document.removeEventListener("keydown", this.handle_key_press, false);
        } else {
            // Add a listener for the ESC key when the lightbox is open
            document.addEventListener("keydown", this.handle_key_press, false);
        }
    }

    get_lightbox_visible_class() {
        if ( this.props.lightbox_open ) {
            return ' edd-testing-plugin-lightbox-open';
        } else {
            return ' edd-testing-plugin-lightbox-closed';
        }
    }

    toggle_lightbox( props ) {

        if ( props.lightbox_open ) {
            props.set_state( 'lightbox_open', false );
        } else {
            props.set_state( 'lightbox_open', true );
        }

    }

    handle_key_press( event ) {

        if( event.keyCode === 27 ) {
            this.toggle_lightbox( this.props );
        }

    }

    render_title() {

        if ( this.props.title ) {
            return this.props.title;
        } else {
            return '';
        }
    };

    render_body_html() {

        // Only show/render output if its visible, otherwise it's a waste of potentially loading embedded images
        if ( this.props.lightbox_open ) {

            return {
                __html: edd_testing_plugin_markdown_converter.makeHtml( this.props.body )
            };

        } else {

            return {
                __html: ''
            };

        }
    };

    render() {
        return (
            <div className={ 'edd-testing-plugin-admin-lightbox' + this.get_lightbox_visible_class() }>
                <div className={ 'edd-testing-plugin-admin-lightbox-background' } onClick={ this.toggle_lightbox.bind( null, this.props ) }></div>
                <div className={ 'edd-testing-plugin-admin-lightbox-relative' }>
                    <div className={ 'edd-testing-plugin-admin-lightbox-absolute' }>
                        <div className={ 'edd-testing-plugin-admin-lightbox-inner' }>
                            <h2 className={ 'edd-testing-plugin-admin-lightbox-input-title' }>{ this.render_title() }</h2>
                            <div className={ 'edd-testing-plugin-admin-lightbox-input-description' } dangerouslySetInnerHTML={ this.render_body_html() } />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

// This function takes a setting, and returns values that should be tested.
window.edd_testing_plugin_get_values_for_testing = function edd_testing_plugin_get_values_for_testing( setting, already_saved_values, remove_api_keys = true, include_blank_scenarios ) {

	// Right out of the gate, let's add a blank option, as it's possible for this option to be blank.
	var values_for_testing = [];

    if ( ! already_saved_values[setting['id']] ) {
        var saved_value = null;
    } else {
        var saved_value = already_saved_values[setting['id']];
    }

    if ( ! setting['std'] ) {
        var saved_value = null;
    } else {
        var std_value = setting['std'];
    }

	// If we should strip out the API keys, do so now
	if ( remove_api_keys ) {

		if (
			//Paypal keys:
			setting['id'] == 'paypal_live_api_username' ||
			setting['id'] == 'paypal_live_api_password' ||
			setting['id'] == 'paypal_live_api_signature' ||
			setting['id'] == 'paypal_test_api_username' ||
			setting['id'] == 'paypal_test_api_signature' ||
			//Stripe keys:
			setting['id'] == 'test_secret_key' ||
			setting['id'] == 'test_publishable_key' ||
			setting['id'] == 'live_secret_key' ||
			setting['id'] == 'live_publishable_key' ||
            // AmazonS3 keys
            setting['id'] == 'edd_amazon_s3_id' ||
            setting['id'] == 'edd_amazon_s3_key'
		) {
			return null;
		}
	}

    // If we should add a blank value as an option
    if ( include_blank_scenarios ) {
        values_for_testing.push( '' );
    }

	if ( ! saved_value && ! std_value ) {

		// If there is no saved value, and no default value
		values_for_testing.push( 'Replace me with your desired testing value' );

	} else if ( ! saved_value && std_value ) {

		// If there is no saved value, but there is a default value
		values_for_testing.push( std_value );

	} else if ( saved_value && ! std_value ) {

		// If there is a saved value, but there is not a default value
		values_for_testing.push( saved_value );

	} else if ( saved_value && ! std_value ) {

		// If there is a saved value, AND a default value, check if they are the same
		if ( saved_value == std_value ) {
			values_for_testing.push( saved_value );
		} else {
			values_for_testing.push( saved_value );
			values_for_testing.push( std_value );
		}
	}

	return values_for_testing;
}

window.variation_drill_down = function variation_drill_down( settings_and_variations, options_to_test, mode, parent_key = false ) {

    // Loop through each setting variation and count it
    for( var level_key in options_to_test ) {

        if ( options_to_test['testing_values'] ) {

            settings_and_variations[parent_key] = {
                context: options_to_test['info']['context'],
                testing_values: options_to_test['testing_values']
            };

            // This is here because the variant holder has 2 levels,
            break;

        } else {

            // If this is not an actual setting, but simply a container, like the top level tabs, drill down to the settings
            settings_and_variations = variation_drill_down( settings_and_variations, options_to_test[level_key], mode, level_key );

        }
    }

    return settings_and_variations;
}

window.scenario_looper = function scenario_looper( data, settings_and_variations, current_loop_depth_key, doing_sub = false, previous_all_scenarios ) {

    var loop_depth_reached = false;

    // Loop through each setting
    for( var setting_key in settings_and_variations ) {

        if ( ! current_loop_depth_key ) {
            current_loop_depth_key = setting_key;
            loop_depth_reached = true;
        }

        // Start looping from where we left off previously
        if ( ! loop_depth_reached ) {
            if ( setting_key == current_loop_depth_key ){
                loop_depth_reached = true;
                continue;
            } else {
                continue;
            }
        }

        // Loop through each variation of the setting
        for ( var i = 0; i < settings_and_variations[setting_key]['testing_values'].length; i++ ) {

            // Add this variation to the current scenario array
            data['current_scenario'][setting_key] = {
                context: 'edd_admin_setting',
                value: settings_and_variations[setting_key]['testing_values'][i]
            };

            // Attempt to keep looping, if there are still other options
            data = scenario_looper( data, settings_and_variations, setting_key, true, previous_all_scenarios );

        }

        // Loop through 1 setting, then done
        //if ( ! doing_sub ) {
            break;
        //}
    }

    // If we are at the end of the deepest loop possible, we've looped through/included all options, and thus a scenario is born!

    // If the setting key is the last one in the array, we've looped through/included all options, and thus a scenario is born!
    if ( setting_key == data['last_setting_key'] ) {

        // If the previous scenario is exactly the same as this one, don't add a new scenario
        if ( data['all_scenarios'][data['scenario_counter']] ) {

            if ( JSON.stringify( data['all_scenarios'][data['scenario_counter']]['values'] ) === JSON.stringify( data['current_scenario'] ) ) {

                return data;

            }

        }

        // Increment the scenario counter, since we are adding a new scenario now
        data['scenario_counter'] = data['scenario_counter'] + 1;

        // Declare a new scenario within the array of all scenarios
        data['all_scenarios'][data['scenario_counter']] = {};
        data['all_scenarios'][data['scenario_counter']]['info'] = {};
        data['all_scenarios'][data['scenario_counter']]['values'] = {};

        // Fill that new scenario with all of the settings>values which are unique to this scenario, by pulling them from the current_scenario
        for( var the_setting_key in data['current_scenario'] ) {
            data['all_scenarios'][data['scenario_counter']]['values'][the_setting_key] = data['current_scenario'][the_setting_key];
        }

        // Add a space for the information about this scenario, like instructions and expected results
        if ( previous_all_scenarios[data['scenario_counter']] ) {
            var instructions = previous_all_scenarios[data['scenario_counter']]['info']['instructions'];
            var expected_results = previous_all_scenarios[data['scenario_counter']]['info']['expected_results'];
        } else {
            var instructions = '';
            var expected_results = '';
        }

        data['all_scenarios'][data['scenario_counter']]['info'] = {
            instructions: instructions,
            expected_results: expected_results,
        };

    }

    // If the loop depth was never reached, we have reached the end of the array of settings and variations
    return data;

}

window.update_total_scenarios = function update_total_scenarios( options_to_test, previous_all_scenarios ) {

    var settings_and_variations = variation_drill_down( {}, options_to_test, 'count_all_variations' );

    // Loop through all settings, so we can retrieve which one is the last one
    for( var setting_key in settings_and_variations ) {
        // Nothing needs to be done here, as we are simply getting the last setting_key
    }

    var data = {
        all_scenarios: {},
        current_scenario: {},
        scenario_counter: 0,
        last_setting_key: setting_key
    };

    data = scenario_looper( data, settings_and_variations, false, false, previous_all_scenarios );

    return data;
}

window.edd_testing_plugin_copy_text_to_clipboard = function edd_testing_plugin_copy_text_to_clipboard( text, event ) {

    event.preventDefault();

    var dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}

// This function takes a string and turns it into the corresponding react object
window.edd_testing_plugin_string_to_component = function edd_testing_plugin_string_to_component( component_name ) {

    switch( component_name ) {
        case 'define_scenarios':
            return EDD_Testing_Plugin_Define_Scenarios_View;
            break;
        case 'helper_json_view':
            return EDD_Testing_Plugin_Helper_JSON_View;
            break;
        case 'radio_boolean':
            return EDD_Testing_Plugin_Radio_Boolean;
        case 'multiple_checkboxes':
            return EDD_Testing_Plugin_Multiple_Checkboxes;
        case 'run_scenarios':
            return EDD_Testing_Plugin_Run_Scenarios;
            break;
        case 'build_scenarios':
            return EDD_Testing_Plugin_Build_Scenarios;
            break;
        default:
            return null;
    }
}

window.edd_testing_plugin_refresh_all_admins = function edd_testing_plugin_refresh_all_admins(){
    var edd_testing_plugin_admin_exists = document.querySelector( '.edd-testing-plugin-admin-settings' );
    if ( edd_testing_plugin_admin_exists ) {

        var edd_testing_plugin_admins = document.querySelectorAll( '.edd-testing-plugin-admin-settings' );

        edd_testing_plugin_admins.forEach(function( edd_testing_plugin_admin ) {

            ReactDOM.render( <EDD_Testing_Plugin_Admin key={ 'edd-testing-plugin-admin' } views={ edd_testing_plugin_admin_js_vars.settings_and_views } ajaxurl={ edd_testing_plugin_admin_js_vars.ajaxurl } ajax_nonce={ edd_testing_plugin_admin_js_vars.ajax_nonce_value } />, edd_testing_plugin_admin );
        });

    }
}

edd_testing_plugin_refresh_all_admins();
