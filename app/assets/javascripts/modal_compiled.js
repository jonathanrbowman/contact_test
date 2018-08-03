"use strict";

var contact_app = contact_app || {};
contact_app.modal = contact_app.modal || {};

contact_app.modal.open = function (modal_id) {
  var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  $(".c-modal[data-modal-id='" + modal_id + "']").addClass("is-active");
  if (callback) {
    callback();
  }
};

contact_app.modal.close = function () {
  var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

  $(".c-modal").removeClass("is-active new-entry");
  if (callback) {
    callback();
  }
};

$(function () {
  $("body").on("click.openModal", ".js-modal-trigger", function () {
    contact_app.modal.open($(this).data("modal-id"));
  });

  $(".c-modal").on("touchend", function (event) {
    event.preventDefault();
    event.stopPropagation();
  });
});
