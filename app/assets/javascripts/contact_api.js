var contact_app = contact_app || {};
contact_app.api = contact_app.api || {}

// normally, this token should only be kept on the server in an environment variable, for security
contact_app.api.auth_token = "BmATkVdzulHPBG9zgBYNO3JWmCL0yaQdQC5J2Nqt";
contact_app.api.base_url = "https://challenge.acstechnologies.com/api/";
contact_app.api.contacts = [];
contact_app.api.searchResults = [];
contact_app.api.searchKeys = '';
contact_app.api.sort = "last_name";
contact_app.api.order = false;
// contact_app.api.commandDown = false;
contact_app.api.shiftDown = false;
contact_app.api.isScrolling = false;
contact_app.api.activeContact = false;
contact_app.api.rowTemplate = `
  <div class="c-dynamic-table__body__row  js-contact-row" data-row-id="___ID___">
    <h5 class="c-dynamic-table__body__row__item">___FIRST_NAME___ ___LAST_NAME___</h5>
    <h5 class="c-dynamic-table__body__row__item">___COMPANY_NAME___</h5>
  </div>
`;

// when you only have the quantity of entries we're dealing with, I'd rather just load them into memory instead of making more network requests
contact_app.api.list = function({event, page = 1, sort = "last_name", desc = false, limit = 9999}) {
  contact_app.api.contacts = [];
  contact_app.api.searchResults = [];

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

contact_app.api.create = function() {
  var form_data = $(".js-contact-form").serialize();
  $(".js-contact-form").find(".o-input__field").each(function() {
    var form_field_value = $(this).text();
    if ($(this).data("form-field") == "url") {
      if (!$(this).text().startsWith("http")) {
        form_field_value = "http://" + $(this).text();
      }
    }
    form_data = form_data + "&" + $(this).data("form-field") + "=" + form_field_value;
  });

  $.ajax({
    url: contact_app.api.base_url + "contact",
    method: "POST",
    data: form_data,
    beforeSend: function(request) {
      request.setRequestHeader("X-Auth-Token", contact_app.api.auth_token);
    },
    success: function(data) {
      $(".js-contact-form").find(".o-input__field").attr("contenteditable", false);
      $(".js-contact-form").find(".o-button-group--dynamic").removeClass("alt-showing");
      $(".c-modal").removeClass("is-active new-entry");
      if (contact_app.api.searchResults.length > 0) {
        contact_app.api.filter(contact_app.api.searchResults);
      } else {
        contact_app.api.list(event);
      }
    },
    error: function(data) {
      console.log(data);
      alert("There was a problem updating your contact!");
    }
  });
};

contact_app.api.update = function() {
  if (contact_app.api.activeContact) {
    var form_data = $(".js-contact-form").serialize();
    $(".js-contact-form").find(".o-input__field").each(function() {
      var form_field_value = $(this).text();
      if ($(this).data("form-field") == "url") {
        if (!$(this).text().startsWith("http")) {
          form_field_value = "http://" + $(this).text();
        }
      }
      form_data = form_data + "&" + $(this).data("form-field") + "=" + form_field_value;
    });

    $.ajax({
      url: contact_app.api.base_url + "contact/" + contact_app.api.activeContact,
      method: "PUT",
      data: form_data,
      beforeSend: function(request) {
        request.setRequestHeader("X-Auth-Token", contact_app.api.auth_token);
      },
      success: function(data) {
        $(".js-contact-form").find(".o-input__field").attr("contenteditable", false);
        $(".js-contact-form").find(".o-button-group--dynamic").removeClass("alt-showing");
        if (contact_app.api.searchResults.length > 0) {
          contact_app.api.filter(contact_app.api.searchResults);
        } else {
          contact_app.api.list(event);
        }
      },
      error: function(data) {
        alert("There was a problem updating your contact!");
      }
    });
  }
};

contact_app.api.destroy = function() {
  if (contact_app.api.activeContact) {
    var form_data = $(".js-contact-form").serialize();
    $(".js-contact-form").find(".o-input__field").each(function() {
      form_data = form_data + "&" + $(this).data("form-field") + "=" + $(this).text();
    });

    $.ajax({
      url: contact_app.api.base_url + "contact/" + contact_app.api.activeContact,
      method: "DELETE",
      beforeSend: function(request) {
        request.setRequestHeader("X-Auth-Token", contact_app.api.auth_token);
      },
      success: function(data) {
        $(".js-contact-form").find(".o-input__field").attr("contenteditable", false);
        $(".js-contact-form").find(".o-button-group--dynamic").removeClass("alt-showing");
        $(".c-modal").removeClass("is-active");
        contact_app.api.list(event);
      },
      error: function(data) {
        console.log(data);
        alert("There was a problem updating your contact!");
      }
    });
  }
};

contact_app.api.render = function(contacts) {
  $(".c-dynamic-table__body").empty();
  var contact_array = [];

  if (contacts.length > 0) {
    $.each(contacts, function() {
      contact_array.push(contact_app.api.rowTemplate.replace("___FIRST_NAME___", this.first_name).replace("___LAST_NAME___", this.last_name).replace("___COMPANY_NAME___", this.company_name).replace("___ID___", this.id));
    });
    $(".c-dynamic-table__body").append(contact_array);
  } else {
    $(".c-dynamic-table__body").append("<h5 class='o-heading  o-heading--thin  u-italicize'>No results found.</h5>");
  }
};

contact_app.api.filter = function(contacts) {
  $(".c-dynamic-table__body__row").addClass("is-hidden");
  if (contacts.length > 0) {
    $.each(contacts, function() {
      $(".c-dynamic-table__body__row[data-row-id='" + this.id + "']").removeClass("is-hidden");
    });
  }
};

contact_app.api.search = function(value = false) {
  contact_app.api.searchResults = [];

  if (value) {
    value = value.toString().toUpperCase();
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

contact_app.api.sortContacts = function(contacts, field) {
  contacts.sort(function(a, b) {
    var nameA = a[field].toLowerCase(), nameB = b[field].toLowerCase();

    if (nameA < nameB) {
      return contact_app.api.order ? 1 : -1;
    }
    if (nameA > nameB) {
      return contact_app.api.order ? -1 : 1;
    }

    return 0;
  });

  contact_app.api.render(contacts);
};

contact_app.api.searchObject = function(contactID, array) {
  for (var i = 0; i < array.length; i++) {
    if (array[i].id === contactID) {
      return array[i];
    }
  }
};

contact_app.api.renderContactForm = function(contactID = false) {
  if (contactID) {
    var contact = contact_app.api.searchObject(contactID, contact_app.api.contacts)
    contact_app.api.activeContact = contactID;
    Object.keys(contact).forEach(function(key) {
      if (key == "id") {
        $(".js-contact-form").find("input[data-form-field='id']").val(contact[key]);
      } else {
        $(".js-contact-form").find(".o-input__field[data-form-field='" + key + "']").html(contact[key]);
      }
    });
  } else {

  }
};

// init with loading the contacts into memory
$(window).on("load", contact_app.api.list);
document.addEventListener("touchstart", function() {}, true);

$(function() {

  $(".js-contact-search").on("keyup", function(event) {
    var searchValue = $(this).val();
    contact_app.api.search(searchValue);
  });

  $(".js-sort").on("click.sort", function(event) {
    var sortField = $(this).data("sort-field");
    var contacts = contact_app.api.searchResults.length > 0 ? contact_app.api.searchResults : contact_app.api.contacts;

    if (contact_app.api.sort == sortField) {
      contact_app.api.order = !contact_app.api.order;
    } else {
      contact_app.api.sort = sortField;
      contact_app.api.order = false;
    }

    contact_app.api.sortContacts(contacts, sortField);
  });

  $("body").on("touchend.selectContact click.selectContact", ".js-contact-row", function(event) {
    $(".c-modal").addClass("is-active").find(".js-contact-form-header").text("View Contact");

    if (!contact_app.api.isScrolling) {
      if (contact_app.api.commandDown) {
        $(this).toggleClass("is-selected");
      } else {
        $(".c-modal").addClass("is-active");
        contact_app.api.renderContactForm($(this).data("row-id"));
      }
    }
  });

  $("body").on("click.selectClear", function(event) {
    if (!contact_app.api.commandDown && !contact_app.api.shiftDown && $(event.target).closest(".o-input").length <= 0) {
      $(".js-contact-row").removeClass("is-selected");
    }
  });

  $("body").on("touchend.closeModal click.closeModal", function(event) {
    event.stopPropagation();
    if ($(event.target).hasClass("c-modal") || $(event.target).closest(".js-close-modal").length > 0) {
      contact_app.api.activeContact = false;
      $(".c-modal").removeClass("is-active new-entry");
      $(".js-contact-form").find(".o-input__field").html("");
      $(".c-modal__inner").scrollTop(0);
      $(".js-contact-form").find(".o-input__field").attr("contenteditable", false);
      $(".js-contact-form").find(".o-button-group--dynamic").removeClass("alt-showing");
    }
  });

  // $(document).on("keydown.modifiers", function(event) {
  //   switch (event.which) {
  //     case 91:
  //       contact_app.api.commandDown = true;
  //       break;
  //     case 16:
  //       contact_app.api.shiftDown = true;
  //       break;
  //   }
  // });

  // $(document).on("keyup.modifiers", function(event) {
  //   switch (event.which) {
  //     case 91:
  //       contact_app.api.commandDown = false;
  //       break;
  //     case 16:
  //       contact_app.api.shiftDown = false;
  //       break;
  //   }
  // });

  $(".js-contact-edit").on("click", function() {
    $(".js-contact-form").find(".o-input__field").attr("contenteditable", true);
    $(this).closest(".o-button-group--dynamic").addClass("alt-showing");
  });

  $(".js-contact-cancel").on("click", function() {
    $(".js-contact-form").find(".o-input__field").attr("contenteditable", false);
    if ($(this).closest(".new-entry").length > 0) {
      $(".c-modal").removeClass("is-active new-entry");
      $(".js-contact-form").find(".o-input__field").html("");
      $(".c-modal__inner").scrollTop(0);
      $(".js-contact-form").find(".o-input__field").attr("contenteditable", false);
      $(".js-contact-form").find(".o-button-group--dynamic").removeClass("alt-showing");
    } else {
      $(".js-contact-form").find(".o-button-group--dynamic").removeClass("alt-showing");
      contact_app.api.renderContactForm(contact_app.api.activeContact);
    }
  });

  $(".js-contact-save").on("click.save", function() {
    if ($(this).closest(".c-modal.new-entry").length > 0) {
      contact_app.api.create();
    } else {
      contact_app.api.update();
    }
  });

  $(".js-contact-destroy").on("click.destroy", function() {
    contact_app.api.destroy();
  });

  $(document).on("touchstart", function() {
    contact_app.api.isScrolling = false;
  });

  $(document).on("touchmove", function() {
    contact_app.api.isScrolling = true;
  });

  $(".js-add-contact").on("click", function() {
    $(".c-modal").addClass("is-active new-entry").find(".js-contact-form-header").text("New Contact");
    $(".js-contact-form").find(".o-input__field").attr("contenteditable", true);
    contact_app.api.renderContactForm();
  });

});
