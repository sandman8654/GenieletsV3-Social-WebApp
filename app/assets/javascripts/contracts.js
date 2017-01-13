var contractForm = function() {
  var runDatePicker = function () {
    $('.date-picker').datepicker({
      autoclose: true,
      format: 'yyyy-mm-dd'
    });

    var $startDate = $('#contract-start-date');

    $startDate.datepicker({
      autoclose: true,
      format: 'yyyy-mm-dd'
    }).on('changeDate', function(e) {
      var $startDate = $('#contract-start-date');
      var $endDate = $('#contract-end-date');
      var start_date = $startDate.datepicker('getDate');
      start_date.setFullYear(start_date.getFullYear() + 1);
      $endDate.datepicker('setDate', start_date);
    });

    $startDate.datepicker('setDate', new Date()).datepicker('update');
  };

  var runActiveContractsTable = function () {
    var oTable = $('#active-contracts-table').dataTable({
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
        [3, 'asc']
      ],
      "aLengthMenu": [
        [5, 10, 15, 20, -1],
        [5, 10, 15, 20, "All"] // change per page values here
      ],
      // set the initial value
      "iDisplayLength": 10
    });
    $('#active-contracts-table_wrapper .dataTables_filter input').addClass("form-control input-sm").attr("placeholder", "Search");
    // modify table search input
    $('#active-contracts-table_wrapper .dataTables_length select').addClass("m-wrap small");
    // modify table per page dropdown
    $('#active-contracts-table_wrapper .dataTables_length select').select2();
    // initialzie select2 dropdown
    $('#active-contracts-table_column_toggler input[type="checkbox"]').change(function () {
      /* Get the DataTables object again - this is not a recreation, just a get of the object */
      var iCol = parseInt($(this).attr("data-column"));
      var bVis = oTable.fnSettings().aoColumns[iCol].bVisible;
      oTable.fnSetColumnVis(iCol, (bVis ? false : true));
    });
  };

  var runFinishedContractsTable = function () {
    var oTable = $('#finished-contracts-table').dataTable({
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
        [3, 'asc']
      ],
      "aLengthMenu": [
        [5, 10, 15, 20, -1],
        [5, 10, 15, 20, "All"] // change per page values here
      ],
      // set the initial value
      "iDisplayLength": 10
    });
    $('#finished-contracts-table_wrapper .dataTables_filter input').addClass("form-control input-sm").attr("placeholder", "Search");
    // modify table search input
    $('#finished-contracts-table_wrapper .dataTables_length select').addClass("m-wrap small");
    // modify table per page dropdown
    $('#finished-contracts-table_wrapper .dataTables_length select').select2();
    // initialzie select2 dropdown
    $('#finished-contracts-table_column_toggler input[type="checkbox"]').change(function () {
      /* Get the DataTables object again - this is not a recreation, just a get of the object */
      var iCol = parseInt($(this).attr("data-column"));
      var bVis = oTable.fnSettings().aoColumns[iCol].bVisible;
      oTable.fnSetColumnVis(iCol, (bVis ? false : true));
    });
  };

  return {
    init: function() {
      runDatePicker();
      runActiveContractsTable();
      runFinishedContractsTable();
    }
  };
}();

$(document).ready(function() {
  contractForm.init();

  $('#contract-tenant-select').on('change', function() {
    var connection_id = $('option:selected', this).data('connection_id');
    $('#contract-connection-id').val(connection_id);
  });

  $('#contract-tenant-select').trigger('change');
});