$( document ).ready( function() {

	var add_mirr = $( '#add_mirror' );
	var add_dialog = $( '#add_dialog' );
	var current_mirr = $( '#current_mirrors' );
	var mirr_table = $( '#mirrors_table' );
	var add_sel = $( '#add_sel' );

	add_mirr.button();

	add_dialog.dialog( {
		autoOpen: false,
		modal: true,
		buttons: {
			'Add': function() {
			},
			'Cancel': function() {
				$( this ).dialog( 'close' );
			}
		}
	});

	add_mirr.click( function() {
		add_dialog.dialog( 'open' );
	});

	mirr_table.dataTable({
		bJQueryUI: true
	});

});
