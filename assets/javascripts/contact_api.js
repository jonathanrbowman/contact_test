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
contact_app.api.commandDown = false;
contact_app.api.shiftDown = false;
contact_app.api.rowTemplate = `
  <div class="c-dynamic-table__body__row  js-contact-row">
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

contact_app.api.render = function(contacts) {
  $(".c-dynamic-table__body").empty();

  if (contacts.length > 0) {
    $.each(contacts, function() {
      $(".c-dynamic-table__body").append(contact_app.api.rowTemplate.replace("___FIRST_NAME___", this.first_name).replace("___LAST_NAME___", this.last_name).replace("___COMPANY_NAME___", this.company_name));
    });
  } else {
    $(".c-dynamic-table__body").append("<div class='o-layout__item'><h5 class='o-heading  o-heading--thin  u-italicize'>No results found.</h5></div>");
  }
};

contact_app.api.search = function(value = false) {
  contact_app.api.searchResults = [];

  if (value) {
    value = value.toString().toUpperCase();

    $.each(contact_app.api.searchKeys, function() {
      if (!["id", "created_at", "updated_at"].includes(this)) {
        contact_app.api.searchResults.push(contact_app.api.contacts.filter(contact => contact[this].toString().toUpperCase().includes(value)));
      }
    });

    contact_app.api.searchResults = [].concat(...contact_app.api.searchResults);
    contact_app.api.render(contact_app.api.searchResults);
  } else {
    contact_app.api.render(contact_app.api.contacts);
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

// init with loading the contacts into memory
$(window).on("load", contact_app.api.list);

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

  $("body").on("click.selectContact", ".js-contact-row", function(event) {
    if (contact_app.api.commandDown) {
      $(this).toggleClass("is-selected");
    }

    if (contact_app.api.shiftDown) {
      // need to add this logic
      // $(this).addClass("is-selected");
    }
  });

  $("body").on("click.selectClear", function(event) {
    if (!contact_app.api.commandDown && !contact_app.api.shiftDown) {
      $(".js-contact-row").removeClass("is-selected");
    }
  });

  $(document).on("keydown.modifiers", function(event) {
    switch (event.which) {
      case 91:
        contact_app.api.commandDown = true;
        break;
      case 16:
        contact_app.api.shiftDown = true;
        break;
    }
  });

  $(document).on("keyup.modifiers", function(event) {
    switch (event.which) {
      case 91:
        contact_app.api.commandDown = false;
        break;
      case 16:
        contact_app.api.shiftDown = false;
        break;
    }
  });

});
