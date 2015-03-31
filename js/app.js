$(function () {
  $.getJSON("/homeworks/all", showCollections).fail(function( jqxhr, textStatus, error ) {
    console.log( "JSON Request Failed: " + textStatus + ", " + error );
  });

  popMessageWhenNecessary();

  $('#upload').click(function () {
    $(this).blur();
    $('#popup_msg').hide();
    $('#hw_submit').slideToggle();
  });

  // Perform form validation before submission
  $('#hw_submit form').submit(formValidation);
});

function formValidation () {

  var $form = $(this);
  
  var v1 = isValid('#student_id', function (id) { return /^[A-z]\d{8}$/.test(id); });

  var v2 = isValid('#file_upload', nonEmpty);
  var v3 = isValid('#image_upload', nonEmpty);

  var v4 = isValid('#fb_link', function (url) {
    // https://www.facebook.com/video.php?v=1060647...123
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

  function isValid(id, f) {
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

  function nonEmpty(x) {
    return x != "";
  }

  function popErrorMessage(msg) {
    var $emsg = $('#error_msg');
    $emsg.find('.msg_title').html(msg.title);
    $emsg.find('.msg_body').html(msg.body);
    $emsg.slideDown();
  }
}

function popMessageWhenNecessary(msg) {
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

  var thead = create_table_head();

  var tbody = "<tbody>";
  for (var i=0; i<data.length; ++i)
    tbody += "<tr>" + create_table_row(data[i]) + "</tr>";
  tbody += "</tbody>";

  var caption = "<caption>上傳紀錄</caption>";

  $table.append(caption).append(thead).append(tbody).appendTo("#homeworks");

  $('[data-toggle="tooltip"]').tooltip();

  function create_table_head() {
    return "<thead><tr>"
    + '<th>ID</th>'
    + '<th>Project Name</th>'
    + '<th>Description</th>'
    + '<th>Facebook Video</th>'
    + '<th>Image</th>'
    + '<th>Codes</th>'
    + '<th>Submission Time</th>'
    + "</tr></thead>";
  }

  function create_table_row(data) {
    var row = "";
    row += sprintf("<td>%s</td><td>%s</td>", data.id, data.proj_name);

    var des = data.description;
    row += sprintf("<td><div data-toggle='tooltip' data-placement='right' title='%s'>%s</div></td>", des, truncate(des, 40));

    var video_id = data.fb_link.match(/v=[^&]*/g)[0].replace(/v=/g, '');
    row += sprintf("<td><a target='_blank' href='%s'>%s</a></td>", data.fb_link, video_id);

    var img = data.image;
    row += sprintf("<td><a href='%s'>%s</a></td>", img.path, truncate(img.name));

    var file = data.file;
    row += sprintf("<td><a download='%s' href='%s'>%s</a></td>", file.name, file.path, truncate(file.name));

    row += sprintf("<td>%s</td>", data.created);

    return row;
  }

  function truncate(str, length) {
    if (typeof length === 'undefined')
      length = 20;

    if (str.length > length)
      return str.slice(0, length) + "...";
    else
      return str;
  }
}
