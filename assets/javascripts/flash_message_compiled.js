"use strict";

// establish message namespace
var contact_app = contact_app || {};
contact_app.flashMessage = contact_app.flashMessage || {};

contact_app.flashMessage.template = "<div class='c-flash-message  c-flash-message--___STYLE___'>___MESSAGE___</div>";

// defined methods

// names of all methods available
// show
// dismiss

// @function show - show a message
// message {string} - the text to be displayed
// style {string} - the color theme to use
contact_app.flashMessage.show = function (message) {
  var style = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "default";

  var newMessage = $(contact_app.flashMessage.template.replace("___MESSAGE___", message).replace("___STYLE___", style));

  $("body").append(newMessage);

  setTimeout(function () {
    newMessage.addClass("is-active");
  }, 200);

  setTimeout(function () {
    newMessage.addClass("is-leaving");
  }, 4000);

  setTimeout(function () {
    newMessage.remove();
  }, 4300);
};

// @function show - animate out and remove a message
// element {$object} - the message element
contact_app.flashMessage.dismiss = function (element) {
  element.addClass("is-leaving");
  setTimeout(function () {
    element.remove();
  }, 300);
};

$(function () {

  // if someone taps or clicks on a message then dismiss it instantly, without waiting for it to expire
  $("body").on("touchend.dismissFlash click.dismissFlash", ".c-flash-message", function () {
    contact_app.flashMessage.dismiss($(this));
  });
});
