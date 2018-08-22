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
            current_view: 'get_started', //get_started, define_scenarios
        };

        this.get_current_view_class = this.get_current_view_class.bind( this );
        this.set_current_view = this.set_current_view.bind( this );
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

            mapper.push( <DynamicReactComponent key={ key } view_slug={ key } view_info={ views[key] } current_view={ this.state.current_view } current_view_class={ this.get_current_view_class( key ) } /> )
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

// This component is the portion that accepts a JSON file, which defines the settings which will be combined to create scenarios.
window.EDD_Testing_Plugin_Define_Test_View = class EDD_Testing_Plugin_Define_Test_View extends React.Component {

    constructor( props ){
        super(props);
    }

    render() {

        return (
            <div className={ 'edd-testing-plugin-admin-define-tests-view' + this.props.current_view_class }>
                <div className="edd-testing-plugin-admin-view-title">
                    <h2>{ this.props.view_info.visual_name }</h2>
                </div>
                <div className={ 'edd-testing-plugin-admin-view-description' }>
                    Coming soon
                </div>
            </div>
        )
    }

}

// This component outputs the "Helper JSON" view, which gives you a starting point to define your tests.
window.EDD_Testing_Plugin_Helper_JSON_View = class EDD_Testing_Plugin_Helper_JSON_View extends React.Component {

    constructor( props ){
        super(props);

        this.state = {
            component_has_mounted: false,
            options_to_test: {},
            total_scenarios: 0,
            all_scenarios: {}
        }

    }

    update_state( state_key, state_value ){

        this.setState( {
            [state_key]: state_value
        }, function() {

            // Update the number of scenarios in json as well to match the new state
            this.update_total_scenarios( this.state.options_to_test );

        } );

    }

    variation_drill_down( settings_and_variations, options_to_test, mode, parent_key = false ) {

        // Loop through each setting variation and count it
        for( var level_key in options_to_test ) {

            if ( options_to_test['testing_values'] ) {

                settings_and_variations[parent_key] = options_to_test['testing_values'];

                // This is here because the variant holder has 2 levels,
                break;

            } else {

                // If this is not an actual setting, but simply a container, like the top level tabs, drill down to the settings
                settings_and_variations = this.variation_drill_down( settings_and_variations, options_to_test[level_key], mode, level_key );

            }
        }

        return settings_and_variations;
    }

    scenario_looper( data, settings_and_variations, current_loop_depth_key, doing_sub = false, scenario_in_question = 11 ) {

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
            for ( var i = 0; i < settings_and_variations[setting_key].length; i++ ) {

                // Add this variation to the current scenario array
                data['current_scenario'][setting_key] = settings_and_variations[setting_key][i];

                // Attempt to keep looping, if there are still other options
                data = this.scenario_looper( data, settings_and_variations, setting_key, true );

            }

            // Loop through 1 setting, then done
            //if ( ! doing_sub ) {
                break;
            //}
        }

        // If we are at the end of the deepest loop possible, we've looped through/included all options, and thus a scenario is born!

        // If the setting key is the last one in the array, we've looped through/included all options, and thus a scenario is born!
        if ( setting_key == data['last_setting_key'] ) {

            //if ( scenario_in_question == data['scenario_counter'] ) {

                // If the previous scenario is exactly the same as this one, don't add a new scenario
                if ( JSON.stringify( data['all_scenarios'][data['scenario_counter']] ) === JSON.stringify( data['current_scenario'] ) ) {

                    return data;

                } else {

                    // Increment the scenario counter, since we are adding a new scenario now
                    data['scenario_counter'] = data['scenario_counter'] + 1;

                    // Declare a new scenario within the array of all scenarios
                    data['all_scenarios'][data['scenario_counter']] = {};

                    // Fill that new scenario with all of the settings>values which are unique to this scenario, by pulling them from the current_scenario
                    for( var the_setting_key in data['current_scenario'] ) {
                        data['all_scenarios'][data['scenario_counter']][the_setting_key] = data['current_scenario'][the_setting_key];
                    }
                }
            //}

        }

        // If the loop depth was never reached, we have reached the end of the array of settings and variations
        return data;

    }

    update_total_scenarios( options_to_test ) {

        var settings_and_variations = this.variation_drill_down( {}, options_to_test, 'count_all_variations' );

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

        data = this.scenario_looper( data, settings_and_variations, false, false );

        this.setState( {
            total_scenarios: data['scenario_counter'],
            all_scenarios: data['all_scenarios'],
        } );

        console.log( data );
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
                    <div>{ <DynamicReactComponent key={ key } option_info={ option } update_parent_state={ this.update_state.bind( this ) }/> }</div>
                </div>
            )
        }
    }

    render() {

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

                    <div className="edd-testing-plugin-generate-testing-json-area">
                        <a className="button" href={ 'data:text/json;charset=utf-8,' + encodeURIComponent( JSON.stringify( this.state.options_to_test, null, 2) ) } download={ 'test.json' }>{ 'Download helper JSON (' + this.state.total_scenarios + ' scenarios to test)' }</a>
                    </div>

                </div>
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

window.edd_testing_plugin_get_next_key = function edd_testing_plugin_get_next_key( settings_and_variations, setting_key ) {

    var keys = Object.keys( settings_and_variations );
    var should_break = false;
    var next_key = '';

    for ( var j = 0; j < keys.length; j++ ) {

        console.log( keys[j] );

        if ( should_break ) {
            next_key = keys[j];
            break;
        }

        if ( keys[j] == setting_key ) {
            should_break = true;
        }
    }

    return next_key;
}

// This function takes a string and turns it into the corresponding react object
window.edd_testing_plugin_string_to_component = function edd_testing_plugin_string_to_component( component_name ) {

    switch( component_name ) {
        case 'define_tests_view':
            return EDD_Testing_Plugin_Define_Test_View;
            break;
        case 'helper_json_view':
            return EDD_Testing_Plugin_Helper_JSON_View;
            break;
        case 'radio_boolean':
            return EDD_Testing_Plugin_Radio_Boolean;
        case 'multiple_checkboxes':
            return EDD_Testing_Plugin_Multiple_Checkboxes;
        case 'currency_field':
            return EDD_Testing_Plugin_Admin_Currency_Field;
            break;
        case 'tip_history_view':
            return EDD_Testing_Plugin_Tip_History_View;
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

            ReactDOM.render( <EDD_Testing_Plugin_Admin key={ 'edd-testing-plugin-admin' } views={ edd_testing_plugin_admin_js_vars.settings_and_views } />, edd_testing_plugin_admin );
        });

    }
}

edd_testing_plugin_refresh_all_admins();
