var contact_app = contact_app || {};
contact_app.uploadBox = contact_app.uploadBox || {}

$(function() {
  $(".js-upload-box").on("dragover, dragenter", function(event) {
    event.preventDefault();
    event.stopPropagation();
  });
});
