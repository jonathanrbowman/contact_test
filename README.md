## Simple Contact Manager ##

The goal of this contact manager is to provide a simple, clean interface to perform basic operations with a database of contact information. You can view, add, delete, search, import, and export contacts.

#### Feature List ####

Need to have:
- View, add, edit, and delete records
- Data validation
- Feedback UI
- Welcome screen

Nice to have:
- Search
- CSV data management
- Single page/AJAX functionality

Future Plans:
- Bulk operations for deletion and specific field updates

### Things to Know ###

Data validation appears to be:
-   First name is required
-   Email is string@string.string format
-   URL must start with http
-   Zip code appears to not allow null values in the database and defaults to 0
- You can use escape to clear modals, search, and reset the menu state

If you find any bugs, please report them to me so I can fix them! Feel free to use this for any purposes, or contribute as you want by creating pull requests.
