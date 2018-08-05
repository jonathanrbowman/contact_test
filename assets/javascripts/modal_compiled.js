"use strict";

// establish modal namespace
var contact_app = contact_app || {};
contact_app.modal = contact_app.modal || {};

// defined methods

// names of all methods available
// open
// close

// @function open - open up the identified modal
// callback {function} - pass a function to execute after the modal opens
contact_app.modal.open = function (modalID) {
  var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  $(".c-modal[data-modal-id='" + modalID + "']").addClass("is-active");
  if (callback) {
    callback();
  }
};

// @function open - close all modals
// callback {function} - pass a function to execute after modals close
contact_app.modal.close = function () {
  var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

  $(".c-modal").removeClass("is-active new-entry");
  if (callback) {
    callback();
  }
};

// bound events
$(function () {
  // open the targeted modal
  $("body").on("click.openModal", ".js-modal-trigger", function () {
    contact_app.modal.open($(this).data("modal-id"));
  });

  // close the modal if a click was initiated inside a close trigger spot
  $("body").on("mousedown.closeModal", function (event) {
    if ($(event.target).hasClass("c-modal") || $(event.target).closest(".js-close-modal").length > 0) {
      event.preventDefault();
      event.stopPropagation();
      contact_app.modal.close(contact_app.api.manageFormState("reset"));
    }
  });
});
