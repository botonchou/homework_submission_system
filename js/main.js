$(function () {
  $.getJSON("/homeworks/all", showCollections).fail(function( jqxhr, textStatus, error ) {
    console.log( "JSON Request Failed: " + textStatus + ", " + error );
  });

  popMessageOnNecessary();

  $('#upload').click(function () {
    $('#popup_msg').hide();
    $('#hw_submit').slideToggle();
  });

  $('#hw_submit form').submit(formValidation);
});

function formValidation () {

  var $form = $(this);

  function valid(id) {
    var $input = $form.find(id);
    var val = $input.val();
    if (val == "") {
      $input.parent().addClass('has-error');
      return false;
    }
    else {
      $input.parent().removeClass('has-error');
      return true;
    }
  }
  
  valid('#student_id');
  valid('#file_upload');
  valid('#image_upload');
  valid('#fb_link');

  return valid('#student_id') && valid('#file_upload') && valid('#image_upload') && valid('#fb_link');
}

function popMessageOnNecessary(msg) {
  if (! location.href.match(/success=1/g) )
    return;

  $('#popup_msg').slideDown(function () {
    setTimeout(function () {
      $('#popup_msg').fadeOut();
    }, 10000);
  });
}

function showCollections(data) {
  if (data.length == 0)
    return;

  console.log(data);
  data.forEach(function (x) {
    delete x._id;
    x.created = new Date(x.created).toLocaleString();
  });

  var $table = $("<table class='table table-hover'>");

  var thead = "<thead><tr>";
  thead += '<th>ID</th>';
  thead += '<th>Project Name</th>';
  thead += '<th>Description</th>';
  thead += '<th>Facebook Video</th>';
  thead += '<th>Codes</th>';
  thead += '<th>Image</th>';
  thead += '<th>Submission Time</th>';
  thead += "</tr></thead>";

  var tbody = "<tbody>";

  for (var i=0; i<data.length; ++i) {
    tbody += "<tr title='" + data[i]._id + "'>";

    tbody += "<td>" + data[i].id + "</td>";
    tbody += "<td>" + data[i].proj_name + "</td>";
    tbody += "<td>" + data[i].description + "</td>";

    var video_code = data[i].fb_link.match(/v=[^&]*/g)[0].replace(/v=/g, '');
    tbody += "<td>" + "<a target='_blank' href='" + data[i].fb_link + "'>" + video_code + "</a>" + "</td>";

    val = data[i].file;
    val = "<a download='" + val.name + "' href='" + val.path + "'>" + val.name + "</a>";
    tbody += "<td>" + val + "</td>";

    val = data[i].image;
    val = "<a download='" + val.name + "' href='" + val.path + "'>" + val.name + "</a>";
    tbody += "<td>" + val + "</td>";

    tbody += "<td>" + data[i].created + "</td>";

    tbody += "</tr>";
  }

  tbody += "</tbody>";

  $table.append(thead).append(tbody).appendTo("#homeworks");
}
