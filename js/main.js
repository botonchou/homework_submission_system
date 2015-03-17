$(function () {
  $.getJSON("/homeworks/all", showCollections).fail(function( jqxhr, textStatus, error ) {
    console.log( "JSON Request Failed: " + textStatus + ", " + error );
  });

  popMessageOnNecessary();

  $('#upload').click(function () {
    $(this).blur();
    $('#popup_msg').hide();
    $('#hw_submit').slideToggle();
  });

  $('#hw_submit form').submit(formValidation);
});

function formValidation () {

  var $form = $(this);

  function valid(id, f) {
    var $input = $form.find(id);
    var val = $input.val();
    if (f(val)) {
      $input.parent().removeClass('has-error');
      return true;
    }
    else {
      $input.parent().addClass('has-error');
      return false;
    }
  }

  function notEmpty(x) {
    return x != "";
  }
  
  var v1 = valid('#student_id', notEmpty);
  var v2 = valid('#file_upload', notEmpty);
  var v3 = valid('#image_upload', notEmpty);

  // https://www.facebook.com/video.php?v=1060647...123
  var v4 = valid('#fb_link', function (url) {
    var good = /https\:\/\/www\.facebook\.com/g.test(url) && /\?v=/g.test(url);
    if (!good) {
      popErrorMessage({
	title: "Invalid Facebook video link !",
	body: 'A valid Facebook video link must look like this: <pre>https://www.facebook.com/...?v=...</pre>'
      });
    }
    else
      $('#error_msg').slideUp();

    return good;
  });

  return v1 && v2 && v3 && v4;
}

function popErrorMessage(msg) {
  var $emsg = $('#error_msg');
  $emsg.find('.msg_title').html(msg.title);
  $emsg.find('.msg_body').html(msg.body);
  $emsg.slideDown();
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
  thead += '<th>Image</th>';
  thead += '<th>Codes</th>';
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

    val = data[i].image;
    val = "<a download='" + val.name + "' href='" + val.path + "'>" + val.name + "</a>";
    tbody += "<td>" + val + "</td>";

    val = data[i].file;
    val = "<a download='" + val.name + "' href='" + val.path + "'>" + val.name + "</a>";
    tbody += "<td>" + val + "</td>";

    tbody += "<td>" + data[i].created + "</td>";

    tbody += "</tr>";
  }

  tbody += "</tbody>";

  var caption = "<caption>上傳紀錄</caption>";

  $table.append(caption).append(thead).append(tbody).appendTo("#homeworks");
}
