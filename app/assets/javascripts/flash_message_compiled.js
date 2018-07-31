"use strict";

var contact_app = contact_app || {};
contact_app.flashMessage = contact_app.flashMessage || {};

contact_app.flashMessage.template = "<div class='c-flash-message  c-flash-message--___STYLE___'>___MESSAGE___</div>";

contact_app.flashMessage.show = function (message) {
  var style = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "default";

  var newMessage = $($.parseHTML(contact_app.flashMessage.template.replace("___MESSAGE___", message).replace("___STYLE___", style)));
  $("body").append(newMessage);
  setTimeout(function () {
    newMessage.addClass("is-active");
  }, 200);

  setTimeout(function () {
    newMessage.addClass("is-leaving");
  }, 5200);

  setTimeout(function () {
    newMessage.remove();
  }, 5500);
};

contact_app.flashMessage.dismiss = function (element) {
  element.addClass("is-leaving");
  setTimeout(function () {
    element.remove();
  }, 300);
};

$(function () {
  $("body").on("touchend.dismissFlash click.dismissFlash", ".c-flash-message", function () {
    contact_app.flashMessage.dismiss($(this));
  });
});
