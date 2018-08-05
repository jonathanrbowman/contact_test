// establish api namespace
var contact_app = contact_app || {};
contact_app.api = contact_app.api || {}

// definitions of all constant variables and templates

// normally, this token should only be kept on the server in an environment variable, for security
contact_app.api.auth_token = "BmATkVdzulHPBG9zgBYNO3JWmCL0yaQdQC5J2Nqt";
contact_app.api.base_url = "https://challenge.acstechnologies.com/api/";
contact_app.api.contacts = [];
contact_app.api.searchResults = [];
contact_app.api.searchKeys = '';
contact_app.api.sort = "last_name";
contact_app.api.order = false;
contact_app.api.isScrolling = false;
contact_app.api.activeContact = false;
contact_app.api.multipleTotal = false;
contact_app.api.multipleUploads = 0;
contact_app.api.multipleErrors = 0;
contact_app.api.rowTemplate = `
  <div class="c-dynamic-table__body__row  js-contact-row" data-row-id="___ID___">
    <h5 class="c-dynamic-table__body__row__item">___FIRST_NAME___ ___LAST_NAME___</h5>
    <h5 class="c-dynamic-table__body__row__item">___COMPANY_NAME___</h5>
  </div>
`;
contact_app.api.rowTemplateReverse = `
<div class="c-dynamic-table__body__row  js-contact-row" data-row-id="___ID___">
  <h5 class="c-dynamic-table__body__row__item">___LAST_NAME___, ___FIRST_NAME___</h5>
  <h5 class="c-dynamic-table__body__row__item">___COMPANY_NAME___</h5>
</div>
`;

// names of all methods available
// list
// create
// update
// destroy
// validate
// render
// filter
// search
// searchObject
// manageFormState
// renderContactForm
// exportCSV
// parseCSVFile
// importCSV

// @function list - reaches out to grab a contact list from the server
// page {integer}
// sort {string} - expects the field name
// desc {boolean} - true brings back descending order, false brings back ascending
// limit {integer}
contact_app.api.list = function(page = 1, sort = contact_app.api.sort, desc = contact_app.api.order, limit = 9999) {
  $.ajax({
    url: contact_app.api.base_url + "contact",
    method: "GET",
    data: {
      page: page,
      limit: limit,
      desc: desc,
      sort: sort
    },
    beforeSend: function(request) {
      request.setRequestHeader("X-Auth-Token", contact_app.api.auth_token);
    },
    success: function(data) {
      contact_app.api.contacts = [];
      contact_app.api.searchResults = [];
      contact_app.api.searchKeys = [];

      $.each(data.data, function() {
        contact_app.api.contacts.push(this);
      });

      contact_app.api.searchKeys = Object.keys(contact_app.api.contacts[0]);
      contact_app.api.render(contact_app.api.contacts);
    },
    error: function(data) {
      console.log(data);
    }
  });
};

// @function create - creates a new contact record
// formData {object} - object containing all of the key/value data to send
contact_app.api.create = function(formData) {
  $(".o-button").prop("disabled", true);

  $.ajax({
    url: contact_app.api.base_url + "contact",
    method: "POST",
    data: formData,
    beforeSend: function(request) {
      request.setRequestHeader("X-Auth-Token", contact_app.api.auth_token);
    },
    success: function(data) {
      if (contact_app.api.multipleTotal) {
        contact_app.api.multipleUploads ++;
      } else {
        contact_app.api.manageFormState("reset");
        contact_app.api.list();
        contact_app.flashMessage.show("Contact created!", "success");
      }
    },
    error: function(data) {
      if (contact_app.api.multipleTotal) {
        contact_app.api.multipleErrors ++;
      } else {
        contact_app.flashMessage.show("There was a problem creating your contact :/", "error");
      }
    },
    complete: function() {
      if (contact_app.api.multipleTotal && (contact_app.api.multipleUploads + contact_app.api.multipleErrors) >= contact_app.api.multipleTotal) {
        var successLanguage = contact_app.api.multipleUploads === 1 ? " contact was uploaded!" : " contacts were uploaded!";
        var errorLanguage = contact_app.api.multipleErrors === 1 ? " contact had errors and could not be uploaded." : " contacts had errors and could not be uploaded.";
        var message, style;

        if (contact_app.api.multipleUploads && contact_app.api.multipleErrors) {
          message = "Finished - " + contact_app.api.multipleUploads + successLanguage + "<br>" + contact_app.api.multipleErrors + errorLanguage;
          style = "default";
        } else if (contact_app.api.multipleUploads) {
          message = "Finished - " + contact_app.api.multipleUploads + successLanguage;
          style = "success";
        } else {
          message = contact_app.api.multipleErrors + errorLanguage;
          style = "error";
        }

        contact_app.flashMessage.show(message, style);

        contact_app.api.manageFormState("reset");
        contact_app.api.multipleTotal = false;
        contact_app.api.multipleUploads = 0;
        contact_app.api.multipleErrors = 0;
        contact_app.api.list();
      }
      $(".o-button").prop("disabled", false);
    }
  });
};

// @function update - updates an existing contact record
// formData {object} - object containing all of the key/value data to send
contact_app.api.update = function(formData) {
  $(".o-button").prop("disabled", true);

  $.ajax({
    url: contact_app.api.base_url + "contact/" + contact_app.api.activeContact,
    method: "PUT",
    data: formData,
    beforeSend: function(request) {
      request.setRequestHeader("X-Auth-Token", contact_app.api.auth_token);
    },
    success: function(data) {
      contact_app.api.manageFormState("lock-down");
      contact_app.api.list();
      contact_app.flashMessage.show("Contact updated!", "success");
    },
    error: function(data) {
      contact_app.flashMessage.show("There was a problem updating your contact :/", "error");
    },
    complete: function() {
      $(".o-button").prop("disabled", false);
    }
  });
};

// @function destroy - removes an existing contact record
// contactID {integer}
contact_app.api.destroy = function(contactID) {
  $.ajax({
    url: contact_app.api.base_url + "contact/" + contactID,
    method: "DELETE",
    beforeSend: function(request) {
      request.setRequestHeader("X-Auth-Token", contact_app.api.auth_token);
    },
    success: function(data) {
      var result = contact_app.api.searchObject(contactID, contact_app.api.searchResults);
      var index = contact_app.api.searchResults.indexOf(result);
      contact_app.api.searchResults.splice(index, 1);

      contact_app.api.manageFormState("reset");

      if (contact_app.api.searchResults.length > 0) {
        $(".js-contact-row[data-row-id='" + contactID + "']").remove();
      } else {
        contact_app.api.list();
      }

      contact_app.flashMessage.show("Contact removed!", "success");
    },
    error: function(data) {
      contact_app.flashMessage.show("There was a problem deleting the contact :/", "error");
    }
  });
};

// @function validate - do some client side checking on known model validations
// formData {object}
// callback {function} - fires after completion
contact_app.api.validate = function(formData, callback) {
  var dataValid = true;
  var errorMessage;

  Object.keys(formData).forEach(function(key) {
    if (formData[key] != null && formData[key].length > 0) {
      formData[key] = formData[key].trim();
    }
    switch (key) {
      case "url":
        if (formData[key] != null && formData[key].length > 0 && !formData[key].startsWith("http")) {
          formData[key] = "http://" + formData[key];
        }
        break;
      case "first_name":
        if (formData[key] != null && formData[key].length <= 0) {
          dataValid = false;
        }
        errorMessage = "You have to include a first name."
        break;
      case "email":
        if (formData[key] != null && formData[key].length > 0) {
          var emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
          if (!emailRegex.test(formData[key])) {
            dataValid = false;
            errorMessage = "Email appears to be invalid.";
          }
        }
        break;
    }
  });


  if (dataValid) {
    callback(formData);
  } else {
    contact_app.flashMessage.show(errorMessage, "error");
    return false;
  }
};

// @function render - reset contact table and render contact object
// contacts {object}
contact_app.api.render = function(contacts) {
  $(".c-dynamic-table__body").html("");
  var contactArray = [];
  var templateNeeded;

  if (contact_app.api.sort === "last_name") {
    templateNeeded = "rowTemplateReverse";
  } else {
    templateNeeded = "rowTemplate";
  }

  $.each(contacts, function() {
    contactArray.push(contact_app.api[templateNeeded].replace("___FIRST_NAME___", this.first_name).replace("___LAST_NAME___", this.last_name).replace("___COMPANY_NAME___", this.company_name).replace("___ID___", this.id));
  });

  $(".c-dynamic-table__body").append(contactArray);
};

// @function filter - hide all contacts except ones in the passed object
// contacts {object}
contact_app.api.filter = function(contacts) {
  $(".js-contact-row").addClass("is-hidden");
  $.each(contacts, function() {
    $(".js-contact-row[data-row-id='" + this.id + "']").removeClass("is-hidden");
  });
};

// @function filter - search the contact object keys, except id, created_at, and updated_at
// value {string}
contact_app.api.search = function(value = false) {
  contact_app.api.searchResults = [];

  if (value) {
    value = value.toString().toUpperCase().trim();
    $.each(contact_app.api.searchKeys, function() {
      if (!["id", "created_at", "updated_at"].includes(this)) {
        contact_app.api.searchResults.push(contact_app.api.contacts.filter(
          contact => contact[this] ? contact[this].toString().toUpperCase().includes(value) : false)
        );
      }
    });

    contact_app.api.searchResults = [].concat(...contact_app.api.searchResults);
    contact_app.api.filter(contact_app.api.searchResults);
  } else {
    contact_app.api.filter(contact_app.api.contacts);
  }
};

// @function searchObject - search the contact object to return single contact entry
// contactID {integer}
// contacts {object}
contact_app.api.searchObject = function(contactID, contacts) {
  for (var i = 0; i < contacts.length; i++) {
    if (contacts[i].id === contactID) {
      return contacts[i];
    }
  }
};

contact_app.api.removeObject = function(contactID, contacts) {
  for (var i = 0; i < contacts.length; i++) {
    if (contacts[i].id === contactID) {
      return contacts[i];
    }
  }
};

// @function manageFormState - consolidated place to execute various UI updates to manage the contact form, based on the given context
// context {string} - you can see what is used in the switch statement
contact_app.api.manageFormState = function(context) {
  switch (context) {
    case "viewing":
      $(".js-contact-form .c-modal__inner__header").text("View Contact");
      break;
    case "editing":
      $(".js-contact-form").find(".o-input__field").attr("contenteditable", true).prop("disabled", false);
      $(".o-button-group--dynamic").addClass("alt-showing");
      break;
    case "new-entry":
      $(".c-modal").addClass("new-entry");
      $(".js-contact-form .c-modal__inner__header").text("New Contact");
      $(".js-contact-form").find(".o-input__field").attr("contenteditable", true).prop("disabled", false);
      break;
    case "reset":
      contact_app.api.activeContact = false;
      $(".js-contact-form").find(".o-input--text .o-input__field").html("");
      $(".js-contact-form").find(".o-input--select .o-input__field").val("");
      $(".c-form__body").scrollTop(0);
      $(".js-contact-form").find(".o-input__field").attr("contenteditable", false).prop("disabled", true);
      $(".js-contact-form").find(".o-button-group--dynamic").removeClass("alt-showing");
      $(".c-modal").removeClass("is-active new-entry");
      $(".c-upload-box").find("input").val("");
      break;
    case "lock-down":
      $(".js-contact-form").find(".o-input__field").attr("contenteditable", false).prop("disabled", true);
      $(".js-contact-form").find(".o-button-group--dynamic").removeClass("alt-showing");
      break;
  }
};

// @function renderContactForm - populate the contact form, given a contact ID
// contactID {integer}
contact_app.api.renderContactForm = function(contactID) {
  var contact = contact_app.api.searchObject(contactID, contact_app.api.contacts);
  contact_app.api.activeContact = contactID;
  Object.keys(contact).forEach(function(key) {
    switch (key) {
      case "id":
        $(".js-contact-form").find("input[data-form-field='id']").val(contact[key]);
      break;
      case "state":
        $(".js-contact-form").find(".o-input__field[data-form-field='" + key + "']").val(contact[key]);
      break;
      default:
        $(".js-contact-form").find(".o-input__field[data-form-field='" + key + "']").html(contact[key]);
    }
  });
};

// @function exportCSV - generate a CSV out of the passed contacts object, which opens in a new window on smaller devices and direct downloads on lap/desktops
// contactObject {object} allows you to include custom column/line delimiters attached to the passed contact object
contact_app.api.exportCSV = function(contactObject) {
  var result, iterator, keys, columnDelimiter, lineDelimiter, data, downloadLink;

  columnDelimiter = contactObject.columnDelimiter || ',';
  lineDelimiter = contactObject.lineDelimiter || '\n';

  keys = Object.keys(contactObject[0]);

  result = "";
  result += keys.join(columnDelimiter);
  result += lineDelimiter;

  contactObject.forEach(function(contact) {
    iterator = 0;
    keys.forEach(function(key) {
      if (iterator > 0) {
        result += columnDelimiter;
      }
      result += contact[key];
      iterator ++;
    });
    result += lineDelimiter;
  });

  var csv = result;
  if (csv == null) return;

  if (!csv.match(/^data:text\/csv/i)) {
    csv = 'data:text/csv;charset=utf-8,' + csv;
  }
  data = encodeURI(csv);

  if ($(window).outerWidth() < 640) {
    window.open(data, "_blank");
  } else {
    downloadLink = document.createElement('a');
    $(downloadLink).attr({href: data, download: "contact_export.csv"});
    downloadLink.click();
    downloadLink.remove();
  }

  contact_app.flashMessage.show("Contacts have been exported!", "success");
};

contact_app.api.parseCSVFile = function(uploadedFile) {
  var csvTest = /(\.|\/)(csv)$/i;

  if (uploadedFile.length === 1) {
    uploadedFile = uploadedFile[0];
  } else {
    contact_app.flashMessage.show("Please only upload one file at a time", "error");
    return false;
  }

  if (csvTest.test(uploadedFile.type) || csvTest.test(uploadedFile.name)) {
    Papa.parse(uploadedFile, {
      dynamicTyping: true,
      header: true,
      skipEmptyLines: 'greedy',
      complete: function(results) {
        contact_app.uploadBox.importCSV(results.data);
      }
    });
  } else {
    contact_app.flashMessage.show("The file does not appear to be a CSV", "error");
    return false;
  }
};

contact_app.uploadBox.importCSV = function(contacts) {
  contact_app.api.multipleTotal = contacts.length;
  contact_app.api.multipleUploads = 0;
  contact_app.api.multipleErrors = 0;
  $.each(contacts, function() {
    contact_app.api.validate(this, contact_app.api.create);
  });
};

// init by loading the contacts into memory, and saying hello!
$(window).on("load", function(event) {
  contact_app.api.list();
  contact_app.flashMessage.show("Welcome!", "success");
});

// Start of all bound events
// ensure that touch devices have the touchstart event bound
document.addEventListener("touchstart", function() {}, true);

$(function() {

  // search contacts while typing in search
  $(".js-contact-search").on("keyup.search", function(event) {
    contact_app.api.search($(this).val());
  });

  // launch the contact modal, unless a user is scrolling to avoid tap mistakes on mobile
  $("body").on("click.selectContact", ".js-contact-row", function(event) {
    if (!contact_app.api.isScrolling) {
      contact_app.modal.open("contact-form", contact_app.api.manageFormState("viewing"));
      contact_app.api.renderContactForm($(this).data("row-id"));
    }
  });

  // clicking the edit button unlocks the form
  $(".js-contact-edit").on("click.editContact", function() {
    contact_app.api.manageFormState("editing");
  });

  // canceling the creation or editing of a contact entry
  $(".js-contact-cancel").on("click.cancelEdit", function() {
    if ($(this).closest(".new-entry").length > 0) {
      contact_app.modal.close(contact_app.api.manageFormState("reset"));
    } else {
      contact_app.api.manageFormState("lock-down");
      contact_app.api.renderContactForm(contact_app.api.activeContact);
      contact_app.flashMessage.show("Changes discarded!");
    }
  });

  // save a contact to either create or update
  $(".js-contact-save").on("click.save", function() {
    var formData = {state: $(".o-input__field[data-form-field='state']").val()};

    $(".js-contact-form").find(".o-input__field--contenteditable .o-input__field").each(function() {
      formData[$(this).data("form-field")] = $(this).text().trim();
    });

    if ($(this).closest(".c-modal.new-entry").length > 0) {
      contact_app.api.validate(formData, contact_app.api.create);
    } else {
      contact_app.api.validate(formData, contact_app.api.update);
    }
  });

  // confirm and destroy given contact
  $(".js-contact-destroy").on("click.destroy", function() {
    if (confirm("Are you sure you want to remove this contact?")) {
      contact_app.api.destroy($(".js-current-contact").val());
    }
  });

  // helpers to prevent false taps on mobile while scrolling
  $(document).on("touchstart", function() {
    contact_app.api.isScrolling = false;
  }).on("touchmove", function() {
    contact_app.api.isScrolling = true;
  }).on("touchend", function() {
    contact_app.api.isScrolling = false;
  });

  // opens the new contact modal
  $(".js-add-contact").on("click", function() {
    contact_app.modal.open("contact-form", contact_app.api.manageFormState("new-entry"));
  });

  // start the processing and export of your contacts
  $(".js-download-csv").on("click", function() {
    contact_app.api.exportCSV(contact_app.api.contacts);
  });

  // toggle display of the search menu
  // it has some weirdness to trick the keyboard to auto pop up on iOS devices, which makes it feel quicker
  $(".js-show-search").on("click", function() {
    $(".c-menu").addClass("showing-search");
    $("body").prepend("<input class='o-input--false-placeholder' type='text'>");
    $(".o-input--false-placeholder").focus();
    setTimeout(function() {
      $(".js-contact-search").trigger("focus");
      $(".o-input--false-placeholder").remove();
    }, 300);
  });

  // toggle display of the file management options
  $(".js-show-file-manager").on("click", function() {
    $(".c-menu").addClass("showing-more");
  });

  // resets the state of the dynamic menu in the header
  $(".js-reset-menu").on("click", function() {
    $(".js-contact-search").blur().val("");
    $(".c-menu").removeClass("showing-more showing-search");
    contact_app.api.searchResults = [];
    contact_app.api.render(contact_app.api.contacts);
  });

  // set the global sort field
  $(".js-sort-field").on("change", function() {
    contact_app.api.sort = $(this).val();
  });

  // set the global sort order
  $(".js-sort-order").on("change", function() {
    contact_app.api.order = $(this).val();
  });

  // execute sort options
  $(".js-sort").on("click", function(event) {
    contact_app.api.list();
    contact_app.modal.close();
  });

  $(document).on("keyup", function(event) {
    if (event.which === 27) {
      $(".js-contact-search").blur().val("");
      $(".c-menu").removeClass("showing-more showing-search");
      contact_app.api.searchResults = [];
      contact_app.api.manageFormState("reset");
      contact_app.api.render(contact_app.api.contacts);
    }
  });

});
