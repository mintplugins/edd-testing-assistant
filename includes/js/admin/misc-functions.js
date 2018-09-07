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
                context: settings_and_variations[setting_key]['context'],
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

window.edd_testing_assistant_copy_text_to_clipboard = function edd_testing_assistant_copy_text_to_clipboard( text, event ) {

    event.preventDefault();

    var dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}

// This function takes a string and turns it into the corresponding react object
window.edd_testing_assistant_string_to_component = function edd_testing_assistant_string_to_component( component_name ) {

    switch( component_name ) {
        case 'build_scenarios_view':
            return EDD_Testing_Assistant_Build_Scenarios_View;
            break;
        case 'get_scenarios_view':
            return EDD_Testing_Assistant_Get_Scenarios_View;
            break;
        case 'run_scenarios_view':
            return EDD_Testing_Assistant_Run_Scenarios_View;
            break;

        case 'multiple_checkboxes':
            return EDD_Testing_Assistant_Multiple_Checkboxes;
        case 'name_of_test':
            return EDD_Testing_Assistant_Name_Of_Test;
            break;
        case 'number_of_products':
            return EDD_Testing_Assistant_Number_Of_Products;
            break;
        default:
            return null;
    }
}

// This function will append a number to each setting slug
window.edd_testing_assistant_get_product_settings = function edd_testing_assistant_get_product_settings( number_to_add, base_product_settings ) {

    var product_settings = JSON.parse( JSON.stringify( base_product_settings ) );

    //console.log( base_product_settings );

    for( var parent_level_key in base_product_settings ) {

        for( var setting_section_key in base_product_settings[parent_level_key]['contents'] ) {

            for( var setting_key in base_product_settings[parent_level_key]['contents'][setting_section_key]['contents'] ) {

                product_settings[parent_level_key]['contents'][setting_section_key]['contents'][setting_key + ' - Product ' + number_to_add] = base_product_settings[parent_level_key]['contents'][setting_section_key]['contents'][setting_key];

                delete product_settings[parent_level_key]['contents'][setting_section_key]['contents'][setting_key];

            }

        }
    }

    //console.log( base_product_settings );

    return product_settings[parent_level_key];

}
