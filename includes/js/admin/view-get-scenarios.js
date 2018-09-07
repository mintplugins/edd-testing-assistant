// This component is the portion that accepts a JSON file, which defines the settings which will be combined to create scenarios.
window.EDD_Testing_Assistant_Get_Scenarios_View = class EDD_Testing_Assistant_Get_Scenarios_View extends React.Component {

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
            //this.props.update_parent_state( 'current_view', 'run_scenarios' );

        }


    }

    helper_json_valid_class_name( helper_json_valid ) {

        if ( 'unknown' == helper_json_valid ) {
            return '';
        }

        if ( helper_json_valid ) {
            return ' ' + 'edd-testing-assistant-json-helper-valid';
        } else {
            return ' ' + 'edd-testing-assistant-json-helper-invalid';
        }
    }

    render() {

        return (
            <div className={ 'edd-testing-assistant-admin-define-tests-view' + this.props.current_view_class }>
                <div className="edd-testing-assistant-admin-view-title">
                    <h2>{ this.props.view_info.visual_name }</h2>
                </div>
                <div className={ 'edd-testing-assistant-admin-view-description' }>
                    { this.props.view_info.description }
                </div>
                <div className={ 'edd-testing-assistant-build-scenarios-paste-area' + this.helper_json_valid_class_name( this.state.helper_json_valid ) }>
                    <textarea value={ this.state.helper_json } onChange={ this.handle_helper_json_change.bind( null ) }></textarea>
                </div>
            </div>
        )
    }

}
