var contact_app = contact_app || {};
contact_app.api = contact_app.api || {}

// normally, this token should only be kept on the server in an environment variable, for security
contact_app.api.auth_token = "BmATkVdzulHPBG9zgBYNO3JWmCL0yaQdQC5J2Nqt";
contact_app.api.base_url = "https://challenge.acstechnologies.com/api/";
contact_app.api.contacts = [];
contact_app.api.searchableContacts = [];
contact_app.api.searchResults = [];
contact_app.api.searchKeyTimeout = '';
contact_app.api.searchKeys = '';
contact_app.api.order = false;
contact_app.api.sort = "last_name";
contact_app.api.page = 1;
contact_app.api.totalPages = '';
contact_app.api.totalEntries = '';
contact_app.api.limit = 10;
contact_app.api.rowTemplate = `
  <div class="character  o-layout__item u-1/3">___FIRST_NAME___</div>
  <div class="o-layout__item u-1/3">___LAST_NAME___</div>
  <div class="o-layout__item u-1/3">___COMPANY_NAME___</div>
`;
contact_app.api.paginationTemplate = "<button type='button' class='o-button  js-go-to-page' data-page='___PAGE___'>___PAGE___</button>";

// when you only have the quantity of entries we're dealing with, I'd rather just load them into memory instead of making more network requests
contact_app.api.list = function({event, page = contact_app.api.page, sort = contact_app.api.sort, desc = contact_app.api.order, limit = contact_app.api.limit, render = true}) {
  contact_app.api.contacts = [];

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
      contact_app.api.totalEntries = data.total;

      if (render) {
        $.each(data.data, function() {
          contact_app.api.contacts.push(this);
        });
        contact_app.api.render({contacts: contact_app.api.contacts});
      } else {
        $.each(data.data, function() {
          contact_app.api.searchableContacts.push(this);
          contact_app.api.searchKeys = Object.keys(contact_app.api.searchableContacts[0]);
        });
      }

      // console.log(contact_app.api.contacts);
    },
    error: function(data) {
      console.log(data);
    }
  });
};

contact_app.api.show = function(event, contactID = false) {
  if (contactID) {
    $.ajax({
      url: contact_app.api.base_url + "contact/" + contactID,
      method: "GET",
      data: {
        id: contactID,
      },
      beforeSend: function(request) {
        request.setRequestHeader("X-Auth-Token", contact_app.api.auth_token);
      },
      success: function(data) {
        console.log(data);
      },
      error: function(data) {
        console.log(data);
      }
    });
  } else {
    alert("Sorry, we need a contact ID to look someone up!");
  }
};

contact_app.api.render = function({event, contacts = [], paginate = true}) {
  $(".js-contact-table").empty();
  $(".js-pagination").empty();

  if (contacts.length > 0) {
    if (paginate) {
      contact_app.api.totalPages = contact_app.api.totalEntries / contact_app.api.limit;
      for (var i = 1; i <= contact_app.api.totalPages; i ++) {
        $(".js-pagination").append(contact_app.api.paginationTemplate.replace(/___PAGE___/g, i));
      }
    }

    $.each(contacts, function() {
      $(".js-contact-table").append(contact_app.api.rowTemplate.replace("___FIRST_NAME___", this.first_name).replace("___LAST_NAME___", this.last_name).replace("___COMPANY_NAME___", this.company_name));
    });
  } else {
    $(".js-contact-table").append("<div class='o-layout__item'><h5 class='o-heading  o-heading--thin  u-italicize'>No results found.</h5></div>");
  }
};

contact_app.api.search = function(event, value = false) {
  contact_app.api.searchResults = [];

  if (value) {
    value = value.toString().toUpperCase();

    $.each(contact_app.api.searchKeys, function() {
      if (!["id", "created_at", "updated_at"].includes(this)) {
        contact_app.api.searchResults.push(contact_app.api.searchableContacts.filter(contact => contact[this].toString().toUpperCase().includes(value)));
      }
    });

    contact_app.api.searchResults = [].concat(...contact_app.api.searchResults);
    contact_app.api.searchResults = [...new Set(contact_app.api.searchResults)];
    contact_app.api.render({contacts: contact_app.api.searchResults, paginate: false});
  } else {
    contact_app.api.render({contacts: contact_app.api.contacts});
  }
};

// init with loading the contacts into memory
$(window).on("load", function(event) {
  contact_app.api.list({event, limit: 9999, render: false});
  contact_app.api.list(event);
});

$(function(){

  $(".js-contact-search").on("keyup", function(event) {
    var searchValue = $(this).val();
    contact_app.api.search(event, searchValue);

    // if we switch back to making network requests, I would use use a delay before searching
    // clearTimeout(contact_app.api.searchKeyTimeout);
    // contact_app.api.searchKeyTimeout = setTimeout(function(event) {
    //   contact_app.api.search(event, searchValue);
    // }, 350);
  });

  $(".js-sort").on("click.sort", function(event) {
    $(".js-contact-search").val("");
    var sortField = $(this).data("sort-field");
    if (contact_app.api.sort == sortField) {
      contact_app.api.order = !contact_app.api.order;
    } else {
      contact_app.api.sort = sortField;
      contact_app.api.order = false;
    }
    contact_app.api.list({sort: sortField, order: contact_app.api.order});
  });

  $("body").on("click.goToPage", ".js-go-to-page", function() {
    contact_app.api.page = $(this).data("page");
    contact_app.api.list(event);
  });

});
