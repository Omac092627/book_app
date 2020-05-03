'use strict' 

$('#edit').on('click', showForm);

function showForm() {
  $('#edit-task-form').show();
  $('#edit').hide();
  $('#listItems').hide();
  $('#delete').hide();
}