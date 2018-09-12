// This component is the one that displays, and assist with all scenarios that need to be tested
window.EDD_Testing_Assistant_Run_Scenarios_View = class EDD_Testing_Assistant_Run_Scenarios_View extends React.Component {

    constructor( props ){
        super(props);

        this.state = {
            current_scenario: null,
            current_browser_tab: 1,
            has_been_in_view: false,
            scenario_data_set: false,
            browser_tab_1_url: '',
            browser_tab_2_url: '',
            browser_tab_3_url: '',
            browser_tab_4_url: '',
            browser_tab_5_url: '',
        };

        this.set_current_scenario = this.set_current_scenario.bind( this );
        this.switch_browser_tab = this.switch_browser_tab.bind( this );
        this.render_browser = this.render_browser.bind( this );
        this.set_scenario_on_server = this.set_scenario_on_server.bind( this );

    }

    componentDidUpdate() {

        if ( ! this.state.current_scenario && this.props.all_scenarios[1] ) {
            this.set_current_scenario( 1 );
        }
    }

    set_scenario_on_server() {

        this.setState( {
            scenario_data_set: 'attempting_to_set'
        } );

        // Now we will save the settings in EDD so they actually are ready to be tested
        var postData = JSON.stringify({
            action: 'edd_testing_assistant_set_scenario',
            current_scenario: this.state.current_scenario,
            all_scenarios: this.props.all_scenarios,
            nonce: this.props.ajax_nonce
        });

        var this_component = this;

        fetch( this.props.ajaxurl + '?edd-testing-assistant-set-scenario', {
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
                            }, function() {

                                // Refresh the checkout tab
                                this.setState( {
                                    browser_tab_1_url: '',
                                }, function() {
                                    this.setState( {
                                        browser_tab_1_url: this.props.ajaxurl + '/checkout/'
                                    } );
                                } );

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
        }, function() {

            this.set_scenario_on_server();

        } );

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

        if ( ! all_scenarios[current_scenario] ) {
            return '';
        }

        // Loop through all of the settings in the current scenario
        for( var setting in all_scenarios[current_scenario]['values'] ) {

            mapper.push( <div key={ setting } className={ 'edd-testing-assistant-scenario-setting' }>
                <div className={ 'edd-testing-assistant-scenario-setting-name' }><strong>{ setting }</strong>: </div>
                <div className={ 'edd-testing-assistant-scenario-setting-value' }>{ all_scenarios[current_scenario]['values'][setting]['value'] }</div>
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

    render_browser() {

        if ( 'run_scenarios_view' == this.props.current_view ) {
            return(
                <div className={ 'edd-testing-assistant-testing-area' }>
                    <div className='edd-testing-assistant-current-scenario-title'><strong>{ 'Testing Window:' }</strong></div>
                    <p>{ 'Feel free to use the window below to run your test for this scenario:' }</p>
                    <div className={ 'edd-testing-assistant-browser' }>
                        <div className={ 'edd-testing-assistant-browser-address-bar' }>
                            { this.state['browser_tab_' + this.state.current_browser_tab + '_url'] }
                        </div>
                        <div className={ 'edd-testing-assistant-browser-tabs' }>
                            <button onClick={ this.switch_browser_tab.bind( null, 1 ) }>Tab 1</button>
                            <button onClick={ this.switch_browser_tab.bind( null, 2 ) }>Tab 2</button>
                            <button onClick={ this.switch_browser_tab.bind( null, 3 ) }>Tab 3</button>
                        </div>
                        <iframe hidden={ this.browser_tab_hidden_attribute( 1, this.state.current_browser_tab ) } src={ this.state.browser_tab_1_url }></iframe>
                        <iframe hidden={ this.browser_tab_hidden_attribute( 2, this.state.current_browser_tab ) } src={ this.state.browser_tab_2_url }></iframe>
                        <iframe hidden={ this.browser_tab_hidden_attribute( 3, this.state.current_browser_tab ) } src={ this.state.browser_tab_3_url }></iframe>
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
                <div className={ 'edd-testing-assistant-setting-scenario-data' }>Setting scenario data...</div>
            )
        }
        if ( this.state.scenario_data_set ) {
            return (
                <div className={ 'edd-testing-assistant-scenario-data-set' }>{ 'Scenario data has been saved and set! You are ready to test scenario ' + this.state.current_scenario + '.' }</div>
            )
        }

        return (
            <div className={ 'edd-testing-assistant-scenario-data-not-set' }>Unable to set scenario data! The nonce has likely timed out and you have to refresh.</div>
        )

    }

    render() {

        if ( ! this.props.all_scenarios[this.state.current_scenario] ) {
            return '';
        }

        return (
            <div className={ 'edd-testing-assistant-admin-run-scenarios-view' + this.props.current_view_class }>
                <div className="edd-testing-assistant-admin-view-title">
                    <h2>{ this.props.view_info.visual_name }</h2>
                </div>
                <div className={ 'edd-testing-assistant-admin-view-description' }>
                    { this.props.view_info.description }
                </div>
                <div className={ 'edd-testing-assistant-scenario-chooser-area' }>
                    { this.render_scenario_links( this.props.all_scenarios, this.state.current_scenario ) }
                    <div>{ this.render_scenario_has_been_set_text() }</div>
                </div>
                <div className={ 'edd-testing-assistant-current-scenario-area' }>
                    <div className='edd-testing-assistant-current-scenario-title'><strong>{ 'Current Scenario: ' + this.state.current_scenario }</strong></div>
                    <div className='edd-testing-assistant-instruction-area'>
                        <div className="edd-testing-assistant-testing-instructions">
                            <strong>Testing Instructions:</strong> { this.get_testing_instructions( this.props.all_scenarios[this.state.current_scenario]['info']['instructions'] ) }
                        </div>
                        <div className="edd-testing-assistant-testing-expected-results">
                            <strong>Expected Results:</strong> { this.get_testing_instructions( this.props.all_scenarios[this.state.current_scenario]['info']['expected_results'] ) }
                        </div>
                    </div>
                    <p>{ 'The settings for scenario ' + this.state.current_scenario + ' are: ' }</p>
                    <div className={ 'edd-testing-assistant-settings-values-table' }>
                        { this.render_current_scenario( this.state.current_scenario, this.props.all_scenarios ) }
                    </div>
                </div>
                { this.render_browser() }
            </div>
        )
    }

}
