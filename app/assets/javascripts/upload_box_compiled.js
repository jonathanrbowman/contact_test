"use strict";

var contact_app = contact_app || {};
contact_app.uploadBox = contact_app.uploadBox || {};
contact_app.uploadBox.file = false;
contact_app.uploadBox.validate = /(\.|\/)(csv)$/i;
contact_app.uploadBox.errors = 0;

contact_app.uploadBox.parseFile = function (uploadedFile) {
  if (uploadedFile.length === 1) {
    contact_app.uploadBox.file = uploadedFile[0];
  } else {
    contact_app.flashMessage.show("Please only upload one file at a time", "error");
    return false;
  }

  if (contact_app.uploadBox.validate.test(contact_app.uploadBox.file.type) || contact_app.uploadBox.validate.test(contact_app.uploadBox.file.name)) {
    Papa.parse(contact_app.uploadBox.file, {
      dynamicTyping: true,
      header: true,
      skipEmptyLines: 'greedy',
      complete: function complete(results) {
        contact_app.uploadBox.uploadResults(results.data);
      }
    });
  } else {
    contact_app.flashMessage.show("The file does not appear to be a CSV", "error");
    return false;
  }
};

contact_app.uploadBox.uploadResults = function (contacts) {
  contact_app.uploadBox.errors = 0;
  $.each(contacts, function () {
    contact_app.api.create(this);
  });
};

$(function () {

  $(".c-upload-box__label").on("drop drag dragstart dragend dragover dragenter dragleave", function (event) {
    event.preventDefault();
    event.stopPropagation();
  }).on("dragover dragenter", function () {
    $(this).addClass("is-active");
  }).on("dragleave dragend drop", function () {
    $(this).removeClass("is-active");
  }).on("drop", function (event) {
    contact_app.uploadBox.parseFile(event.originalEvent.dataTransfer.files);
  });

  $(".c-upload-box__input").on("change", function (event) {
    contact_app.uploadBox.parseFile(this.files);
  });
});
