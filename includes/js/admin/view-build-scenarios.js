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

// This component outputs the "Helper JSON" view, which gives you a starting point to define your tests.
window.EDD_Testing_Assistant_Build_Scenarios_View = class EDD_Testing_Assistant_Build_Scenarios_View extends React.Component {

    constructor( props ){
        super(props);

        this.state = {
            component_has_mounted: false,
            options_to_test: {},
            total_scenarios: 1,
            all_scenarios: {},
            name_of_file: '',
            version_of_file: '',
            number_of_products_in_cart: 1
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

            this.props.update_parent_state( state_key, state_value );

        } );

    }

    render_options( options ) {

        var mapper = [];

        // This lets us loop through the object
        for (var key in options) {
            mapper.push( <div key={key} className={ 'edd-testing-assistant-build-scenarios-container'}>
                { this.render_option( options[key], key ) }
            </div> )
        }

        // This lets us output the buttons one by one
        return mapper.map((option, index) => {
          return option;
        })

    }

    render_option( option, key ){

        var DynamicReactComponent = edd_testing_assistant_string_to_component( option['react_component'] );

        if ( DynamicReactComponent ) {

            return (
                <div className="edd-testing-assistant-build-scenarios">
                    <div><h2>{ option.visual_title }</h2></div>
                    <p>{ option.visual_description }</p>
                    <div>{
                        <DynamicReactComponent
                            key={ key }
                            option_info={ option }
                            update_parent_state={ this.update_state.bind( this ) }
                            all_scenarios={ this.state.all_scenarios }
                            options_to_test={ this.props.options_to_test }
                            scenarios_are_fresh={ this.props.scenarios_are_fresh }
                            number_of_products_in_cart={ this.state.number_of_products_in_cart }
                        />
                    }</div>
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
            <div className={ 'edd-testing-assistant-admin-build-scenarios-view' + this.props.current_view_class }>
                <div className="edd-testing-assistant-admin-view-title">
                    <h2>{ this.props.view_info.visual_name }</h2>
                </div>
                <div className={ 'edd-testing-assistant-admin-view-description' }>
                    <p>{ this.props.view_info.description }</p>
                </div>
                <div className={ 'edd-testing-assistant-build-scenarios' }>

                    <div className="edd-testing-assistant-build-scenarios-form">

                        <div className="edd-testing-assistant-build-scenarios">
                            { this.render_options( this.props.view_info.scenario_generation_options ) }
                        </div>

                    </div>

                    <EDD_Testing_Assistant_Add_Instructions_For_Scenarios total_scenarios={ this.state.total_scenarios }  all_scenarios={ this.state.all_scenarios } update_parent_state={ this.update_state.bind( this ) } />

                    <div className="edd-testing-assistant-generate-testing-json-area">
                        <h2>{ 'Generate Testing JSON' } </h2>
                        <p>{ 'Based on the above selection, ' + this.state.total_scenarios + ' scenario(s) need to be tested. Copy the helper JSON and move on to the next step called "Define Scenarios". It is recommended that the helper JSON been pasted into the relating GitHub issue so that others can easily run the same series of tests.' }</p>
                        <a className="edd-testing-assistant-copy-json-button button" onClick={ edd_testing_assistant_copy_text_to_clipboard.bind( null, json_stringified ) }>{ 'Copy helper JSON' }</a> <a className="button" href={ 'data:text/json;charset=utf-8,' + encodeURIComponent( json_stringified ) } download={ 'ETA -' + this.state.name_of_file + ' - v' + this.state.version_of_file + '.json' }>{ 'Download helper JSON file' }</a>
                    </div>

                </div>
            </div>
        )
    }

}

window.EDD_Testing_Assistant_Multiple_Checkboxes = class EDD_Testing_Assistant_Multiple_Checkboxes extends React.Component {

    constructor( props ){
        super(props);

        this.state = {
            options: this.props.option_info.options,
            number_of_products_in_cart: 1,
        };

        this.variant_input_delay = null;
        this.options_to_test_input_delay = null;

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

                var path_to_child_group = new_key.split( '||' );

                // This series of if statements determines whether the checkbox should be checked by defult at each of the 3 levels
                if ( 3 == path_to_child_group.length ) {

                    // Check if this should be checked by default or not
                    if (
                        this.props.options_to_test[path_to_child_group[0]] &&
                        this.props.options_to_test[path_to_child_group[0]][path_to_child_group[1]] &&
                        this.props.options_to_test[path_to_child_group[0]][path_to_child_group[1]][path_to_child_group[2]]
                    ) {

                        // Set the state to be checked
                        state_holder[new_key] = 'checked';

                    } else {

                        // Set the state to be empty, or unchecked
                        state_holder[new_key] = '';

                    }

                }

                if ( 2 == path_to_child_group.length ) {

                    if(
                        this.props.options_to_test[path_to_child_group[0]] &&
                        this.props.options_to_test[path_to_child_group[0]][path_to_child_group[1]]
                    ) {

                        // Set the state to be checked
                        state_holder[new_key] = 'checked';

                    } else {

                        // Set the state to be empty, or unchecked
                        state_holder[new_key] = '';

                    }

                }

                if ( 1 == path_to_child_group.length ) {

                    if( this.props.options_to_test[path_to_child_group[0]] ) {

                        // Set the state to be checked
                        state_holder[new_key] = 'checked';

                    } else {

                        // Set the state to be empty, or unchecked
                        state_holder[new_key] = '';

                    }
                }

                // Loop through each group of children within this child and set the state for those as well
                state_holder = this.set_default_state_of_children_checkboxes( children_to_set[child_key]['contents'], new_key, state_holder );
            }

        }

        return state_holder;

    }

    add_remove_products_to_available_options() {

        // If there's been no change in the number of products
        if ( this.state.number_of_products_in_cart == this.props.number_of_products_in_cart ) {
            return this.state.options;
        }

        var state_options_holder = JSON.parse( JSON.stringify( this.state.options ) );
        var temp_product_settings = JSON.parse( JSON.stringify( this.props.option_info.base_product_settings ) );

        // If we are adding new products
        if ( this.props.number_of_products_in_cart > this.state.number_of_products_in_cart ) {

            // Loop the number of products in the cart we want to have options for
            for ( var i = 1; i <= this.props.number_of_products_in_cart; i++ ) {

                // Add available options to the array for each product
                state_options_holder['product_settings' + i ] = edd_testing_assistant_get_product_settings( i, temp_product_settings );

            }

        } else {

            // If we are removing products
            for ( var j = 1; j <= this.state.number_of_products_in_cart; j++ ) {

                if ( j > this.props.number_of_products_in_cart ) {
                    // Add available options to the array for each product
                    delete state_options_holder['product_settings' + j ];
                }

            }
        }

        return state_options_holder;

    }

    componentDidUpdate() {

        if ( this.props.scenarios_are_fresh ) {

            var nested_checkboxes = this.add_remove_products_to_available_options();
            var state_holder = this.state;

            state_holder = this.set_default_state_of_children_checkboxes( nested_checkboxes, null, state_holder );

            // Replace the entire state with the checkbox default values included
            this.setState( state_holder, function() {

                this.setState( {
                    options: nested_checkboxes,
                    number_of_products_in_cart: this.props.number_of_products_in_cart
                } );

            } );
        }

    }

    componentDidMount() {

        // Set the default state of all the checkboxes to be unchecked
        var nested_checkboxes = this.state.options;
        var state_holder = this.state;

        state_holder = this.set_default_state_of_children_checkboxes( nested_checkboxes, null, state_holder );

        // Replace the entire state with the checkbox default values included
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

        // Set up a delay which waits to save the tip until .5 seconds after they stop typing.
        if( this.options_to_test_input_delay ) {
            // Clear the keypress delay if the user just typed
            clearTimeout( this.options_to_test_input_delay );
            this.options_to_test_input_delay = null;
        }

        var this_component = this;

        // (Re)-Set up the save to fire in 2500ms
        this.options_to_test_input_delay = setTimeout( function() {

            console.log( 'generate_array_of_options_to_test' );

            clearTimeout( this_component.options_to_test_input_delay );

            var nested_checkboxes = this_component.state.options;
            var options_to_test = {};

            // Set all of the checkbox state values
            options_to_test = this_component.add_child_checkbox_to_options_to_test( nested_checkboxes, null, {}, options_to_test, false );

            // Set the parent state
            this_component.props.update_parent_state( 'options_to_test', options_to_test );

        }, 1000);

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

        // Check if there are variants (aka testing values) that exist in the options_to_test array. If so, use those.
        if (
            this.props.options_to_test[path_to_child_group[0]] &&
            this.props.options_to_test[path_to_child_group[0]][path_to_child_group[1]] &&
            this.props.options_to_test[path_to_child_group[0]][path_to_child_group[1]][path_to_child_group[2]]
        ) {
            var testing_values = this.props.options_to_test[path_to_child_group[0]][path_to_child_group[1]][path_to_child_group[2]]['testing_values'];
        } else {
            var testing_values = options[path_to_child_group[0]]['contents'][path_to_child_group[1]]['contents'][path_to_child_group[2]]['testing_values'];
        }

        testing_values_key = parseInt( testing_values_key );

        // Add the new, blank testing value
        testing_values.splice( testing_values_key + 1, 0, '' );

        options[path_to_child_group[0]]['contents'][path_to_child_group[1]]['contents'][path_to_child_group[2]]['testing_values'] = testing_values;

        // Set the state here too
        this.setState( {
            [parent_key + '||' + ( testing_values_key + 1 ) ]: ''
        }, function() {

            this.setState( {
                options: options
            }, function() {

                // Once the state has updated, re-generate the array of options to test
                this.generate_array_of_options_to_test();

                // Set the keyboard focus on the newly created field
                this.references_to_fields[parent_key + '-' + ( testing_values_key + 1 )].current.focus();

            } );

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

    save_variant( testing_values_key, path_to_child_group, parent_key, event ) {

        var options = this.state.options;
        var this_component = this;
        var new_value = event.target.value;

        // This could be made to be more dynamic, but for now, we'll assume all testing values are at the 2 level (0, 1, 2)
        var testing_values = options[path_to_child_group[0]]['contents'][path_to_child_group[1]]['contents'][path_to_child_group[2]]['testing_values'];

        // Update the variant value to the one just typed
        testing_values[testing_values_key] = new_value;

        options[path_to_child_group[0]]['contents'][path_to_child_group[1]]['contents'][path_to_child_group[2]]['testing_values'] = testing_values;

        // Set the state here too
        this_component.setState( {
            options: options
        }, function() {

            // Once the state has updated, re-generate the array of options to test
            this_component.generate_array_of_options_to_test();

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

            var this_component = this;

            // Once the state has updated, re-generate the array of options to test
            setTimeout( function() {

                this_component.generate_array_of_options_to_test();

            }, 500);

        } );

    }

    render_variants( possible_testing_values, parent_is_checked = false, parent_key ) {

        if ( ! possible_testing_values['testing_values'] ) {
            return;
        }

        var mapper = [];

        var path_to_child_group = parent_key.split( '||' );

        // Check if there are variants (aka testing values) that exist in the options_to_test array. If so, use those.
        if (
            this.props.options_to_test[path_to_child_group[0]] &&
            this.props.options_to_test[path_to_child_group[0]][path_to_child_group[1]] &&
            this.props.options_to_test[path_to_child_group[0]][path_to_child_group[1]][path_to_child_group[2]]
        ) {
            var testing_values = this.props.options_to_test[path_to_child_group[0]][path_to_child_group[1]][path_to_child_group[2]]['testing_values'];
        } else {
            var testing_values = possible_testing_values['testing_values'];
        }

        // Set up the "hidden" paramater
        if ( ! parent_is_checked) {
            var hidden_style = {
                display:'none'
            };
        } else {
            var hidden_style = {};
        }

        // This lets us loop through the object
        for ( var key in testing_values ) {

            // Create a node reference for this field
            this.references_to_fields[parent_key + '-' + key] = React.createRef();

            mapper.push( <div key={key} style={ hidden_style } className={ 'edd-testing-assistant-testing-values'}>
                <input
                    type="text"
                    name={ parent_key }
                    className={ parent_key }
                    testing_key={ key }
                    value={ testing_values[key] }
                    placeholder={ 'Replace me with your desired testing value' }
                    onChange={ this.save_variant.bind( null, key, path_to_child_group, parent_key ) }
                    onKeyDown={ this.handle_variant_key_press.bind( null, key, path_to_child_group, parent_key ) }
                    ref={ this.references_to_fields[parent_key + '-' + key] }
                />
            </div> );

        }

        mapper.push( <button key={ 'add_another_variant' } style={ hidden_style } className={ 'button edd-testing-assistant-add-variant-button' } onClick={ this.add_another_variant.bind( null, key, path_to_child_group, parent_key ) }>
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

            mapper.push( <div key={key} hidden={ hidden } className={ 'edd-testing-assistant-multiple-checkboxes-option'}>
                <label>
                    <input type="checkbox" name={ name } onChange={ this.handle_checkbox_change.bind( null ) } checked={ this.state[name] } />{ checkboxes[key]['info']['visual_name'] }
                </label>
                <div className={ 'edd-testing-assistant-multiple-checkboxes-level'}>
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
            <div className={ 'edd-testing-assistant-multiple-checkboxes-option' }>
                { this.render_checkboxes( this.state.options ) }
            </div>
        );
    }

}


// This component is where you enter the instructions and expected results for each scenario
window.EDD_Testing_Assistant_Add_Instructions_For_Scenarios = class EDD_Testing_Assistant_Add_Instructions_For_Scenarios extends React.Component {

    constructor( props ){
        super(props);

        this.state = {
            current_scenario: 1,
        };

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

            mapper.push( <button key={ scenario } className={ 'edd-testing-assistant-scenario-link button' + this.get_current_scenario_button_class( scenario )  } onClick={ this.set_current_scenario.bind( null, scenario ) }>
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
            mapper.push( <div key={ setting } className={ 'edd-testing-assistant-scenario-setting' }>
                <span className={ 'edd-testing-assistant-scenario-setting-name' }><strong>{ setting }</strong>: </span>
                <span className={ 'edd-testing-assistant-scenario-setting-value' }>{ all_scenarios[current_scenario]['values'][setting]['value'] }</span>
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
                <div className="edd-testing-assistant-scenario-instructions-and-results-area">
                    <h2>Enter scenario instructions and expected results</h2>
                    <p>{ 'Based on the above selection, ' + this.props.total_scenarios + ' scenario(s) need to be tested. Enter the testing instructions for each scenario, as well as the expected results of each scenario. These instructions will be passed along to all other testers when you give them the Testing JSON.' }</p>

                    <div className={ 'edd-testing-assistant-scenario-chooser-area' }>
                        { this.render_scenario_links( this.props.all_scenarios, this.state.current_scenario ) }
                    </div>

                    <div className={ 'edd-testing-assistant-scenario-instructions' }>
                        <div className={ 'edd-testing-assistant-build-instructions-title' }>
                            <strong>{ 'Enter the instructions for testing scenario ' + this.state.current_scenario }</strong>
                            <textarea
                                onChange={ this.handle_instruction_change.bind( null, 'instructions' ) }
                                className={ 'edd-testing-assistant-instructions' }
                                value={ this.state['instructions_' + this.state.current_scenario] }
                                placeholder={ 'Enter the testing instructions for scenario ' + this.state.current_scenario }
                            />
                        </div>
                    </div>

                    <div className={ 'edd-testing-assistant-scenario-expected-results' }>
                        <div className={ 'edd-testing-assistant-build-instructions-title' }>
                            <strong>{ 'Enter the results you expect to get when this scenario ' + this.state.current_scenario + ' has been tested' }</strong>
                            <textarea
                                onChange={ this.handle_instruction_change.bind( null, 'expected_results' ) }
                                className={ 'edd-testing-assistant-instructions' }
                                value={ this.state['expected_results_' + this.state.current_scenario] }
                                placeholder={ 'Enter the expected results for scenario ' + this.state.current_scenario }
                            />
                        </div>
                    </div>

                    <div className={ 'edd-testing-assistant-current-scenario-area' }>
                        <p><strong>{ 'The settings for scenario ' + this.state.current_scenario + ' are: ' }</strong></p>
                        <div className={ 'edd-testing-assistant-settings-values-table' }>
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

window.EDD_Testing_Assistant_Name_Of_Test = class EDD_Testing_Assistant_Name_Of_Test extends React.Component{

    constructor( props ) {
        super( props );

        this.state = {
            name_of_file: '',
            version_of_file: ''
        }

        this.name_input_delay = null;
        this.version_input_delay = null;
    }

    handle_name_change( event ) {

        this.setState( {
            name_of_file: event.target.value
        } );

        // Set up a delay which waits to save the tip until .5 seconds after they stop typing.
        if( this.name_input_delay ) {
            // Clear the keypress delay if the user just typed
            clearTimeout( this.name_input_delay );
            this.name_input_delay = null;
        }

        var this_component = this;
        var new_value = event.target.value;

        // (Re)-Set up the save to fire in 500ms
        this_component.name_input_delay = setTimeout( function() {

            clearTimeout( this_component.name_input_delay );

            console.log( 'sgsdgsdg' );

            this_component.props.update_parent_state( 'name_of_file', new_value );

        }, 1000);

    }

    handle_version_change( event ) {
        this.setState( {
            version_of_file: event.target.value
        } );

        // Set up a delay which waits to save the tip until .5 seconds after they stop typing.
        if( this.version_input_delay ) {
            // Clear the keypress delay if the user just typed
            clearTimeout( this.version_input_delay );
            this.version_input_delay = null;
        }

        var this_component = this;
        var new_value = event.target.value;

        // (Re)-Set up the save to fire in 500ms
        this_component.version_input_delay = setTimeout( function() {

            clearTimeout( this_component.version_input_delay );

            console.log( 'sgsdgsdg' );

            this_component.props.update_parent_state( 'version_of_file', new_value );

        }, 1000);

    }

    render() {

        return (

            <div className={ 'edd-testing-assistant-id-of-test-area' }>
                <div className={ 'edd-testing-assistant-name-of-test-area' }>
                    <label>
                        <strong>Name of test file:</strong><br />
                        Enter the name of this group of tests. You may wish to use the Github issue as the title
                        <input type="text" placeholder="Name of Github Repo - Issue #" value={ this.state.name_of_file } onChange={ this.handle_name_change.bind( this ) } />
                    </label>
                </div>
                <div className={ 'edd-testing-assistant-version-of-test-area' }>
                    <label>
                        <strong>Version of test file:</strong><br />
                        Enter the version of this group of tests. If it has been modified at all, increment the version number.
                        <input type="text" placeholder="1.0.0" value={ this.state.version_of_file } onChange={ this.handle_version_change.bind( this ) } />
                    </label>
                </div>
            </div>
        )

    }
}

window.EDD_Testing_Assistant_Number_Of_Products = class EDD_Testing_Assistant_Number_Of_Products extends React.Component{

    constructor( props ) {
        super( props );

        this.state = {
            number_of_products_in_cart: 1
        }

    }

    handle_number_change( event ) {

        if ( event.target.value < 1 ) {
            var number_of_products = 1;
        } else {
            var number_of_products = event.target.value;
        }

        this.setState( {
            number_of_products_in_cart: number_of_products
        } );

        this.props.update_parent_state( 'number_of_products_in_cart', event.target.value );

    }

    render() {

        return (

            <div className={ 'edd-testing-assistant-number-of-products-area' }>
                <input type="number" min="1" value={ this.state.number_of_products_in_cart } onChange={ this.handle_number_change.bind( this ) } />
            </div>
        )

    }
}
