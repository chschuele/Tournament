//logic for adding teams
var newIndex = 0;

function addTeam(index) {
  if (newIndex == 0) {
    newIndex = index + 1
  } else {
    newIndex = newIndex + 1
  }
  var teamTest = `<div class="form-group row"><label for="inputTeam${newIndex}" class="col-sm-2 col-form-label"><b>Team ${newIndex}</b></label><div class="col-sm-10"><input type="team${newIndex}" class="form-control" id="inputTeam${newIndex}" placeholder="Team ${newIndex}"></div></div>`
  var teamTest2 = `<div class="form-group row"><label for="inputTeam${newIndex + 1}" class="col-sm-2 col-form-label"><b>Team ${newIndex + 1}</b></label><div class="col-sm-10"><input type="team${newIndex + 1}" class="form-control" id="inputTeam${newIndex + 1}" placeholder="Team ${newIndex + 1}"></div></div>`
  $(".extra__team").append(teamTest + teamTest2)
  newIndex = newIndex + 1
}

//-----------
//checks if forms are all filled

$(document).ready(function() {
  $(".btnFertig").click(function() {
    ValidateForm();
  });

});

function ValidateForm() {
  var formInvalid = false;
  $('#register_form input').each(function() {
    if ($(this).val() === '') {
      formInvalid = true;
    }
  });

  if (formInvalid) {
    alert('Ein oder mehrere Felder sind leer. Bitte füllen Sie alle Felder aus');
  } else {
    $(".spielplan , .rangliste").show();
    $('.spielplan').tab('show');
  }
}
