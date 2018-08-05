"use strict";

var contact_app = contact_app || {};
contact_app.uploadBox = contact_app.uploadBox || {};

$(function () {

  $(".c-upload-box__label").on("drop drag dragstart dragend dragover dragenter dragleave", function (event) {
    event.preventDefault();
    event.stopPropagation();
  }).on("dragover dragenter", function () {
    $(this).addClass("is-active");
  }).on("dragleave dragend drop", function () {
    $(this).removeClass("is-active");
  }).on("drop", function (event) {
    contact_app.api.parseCSVFile(event.originalEvent.dataTransfer.files);
  });

  $(".js-upload-csv").on("change", function (event) {
    console.log("should be parsing");
    contact_app.api.parseCSVFile(this.files);
  });
});
