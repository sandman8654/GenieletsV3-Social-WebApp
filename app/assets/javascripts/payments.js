var paymentsForm = function() {
  var runOutstandingPaymentsTable = function () {
    var oTable = $('#outstanding-payments-table').dataTable({
      "aoColumnDefs": [
        {
          "aTargets": [0]
        }
      ],
      "oLanguage": {
        "sLengthMenu": "Show _MENU_ Rows",
        "sSearch": "",
        "oPaginate": {
          "sPrevious": "",
          "sNext": ""
        }
      },
      "aaSorting": [
        [1, 'asc']
      ],
      "aLengthMenu": [
        [5, 10, 15, 20, -1],
        [5, 10, 15, 20, "All"] // change per page values here
      ],
      // set the initial value
      "iDisplayLength": 10
    });
    $('#outstanding-payments-table_wrapper .dataTables_filter input').addClass("form-control input-sm").attr("placeholder", "Search");
    // modify table search input
    $('#outstanding-payments-table_wrapper .dataTables_length select').addClass("m-wrap small");
    // modify table per page dropdown
    $('#outstanding-payments-table_wrapper .dataTables_length select').select2();
    // initialzie select2 dropdown
    $('#outstanding-payments-table_column_toggler input[type="checkbox"]').change(function () {
      /* Get the DataTables object again - this is not a recreation, just a get of the object */
      var iCol = parseInt($(this).attr("data-column"));
      var bVis = oTable.fnSettings().aoColumns[iCol].bVisible;
      oTable.fnSetColumnVis(iCol, (bVis ? false : true));
    });
  };

  var runPaidPaymentsTable = function () {
    var oTable = $('#paid-payments-table').dataTable({
      "aoColumnDefs": [{
        "aTargets": [0]
      }],
      "oLanguage": {
        "sLengthMenu": "Show _MENU_ Rows",
        "sSearch": "",
        "oPaginate": {
          "sPrevious": "",
          "sNext": ""
        }
      },
      "aaSorting": [
        [1, 'asc']
      ],
      "aLengthMenu": [
        [5, 10, 15, 20, -1],
        [5, 10, 15, 20, "All"] // change per page values here
      ],
      // set the initial value
      "iDisplayLength": 10
    });
    $('#paid-payments-table_wrapper .dataTables_filter input').addClass("form-control input-sm").attr("placeholder", "Search");
    // modify table search input
    $('#paid-payments-table_wrapper .dataTables_length select').addClass("m-wrap small");
    // modify table per page dropdown
    $('#paid-payments-table_wrapper .dataTables_length select').select2();
    // initialzie select2 dropdown
    $('#paid-payments-table_column_toggler input[type="checkbox"]').change(function () {
      /* Get the DataTables object again - this is not a recreation, just a get of the object */
      var iCol = parseInt($(this).attr("data-column"));
      var bVis = oTable.fnSettings().aoColumns[iCol].bVisible;
      oTable.fnSetColumnVis(iCol, (bVis ? false : true));
    });
  };

  return {
    init: function() {
      runOutstandingPaymentsTable();
      runPaidPaymentsTable();
    }
  };
}();

$(document).ready(function() {
  paymentsForm.init();
});