# Social Dining App API
Social Dining App Server serving up the RESTful API to the Social Dining App Client. The API follows REST best practices with the endpoints below utilized within the Front End Client. 

## API Documentation

* **Endpoints**
  * **/api/users**
    * GET
    * POST
    * PATCH
    * DELETE
    * _/:user_id
      * GET
    * **/all/events**
      * GET
  * **/api/events**
    * GET
    * POST
    * **/:event_id**
      * GET
      * PATCH
      * DELETE
  * **/api/attendees**
    * GET
    * POST
    * DELETE

## Built with
* NodeJS
* ExpressJS
* PostgreSQL

## Demo

- [Client Repo](https://github.com/djbradleyii/social-dining-app-client)
- [Live Demo](https://social-dining-app.now.sh/)


## Screenshots
Landing Page:
![Landing Page](screenshots/landing_page.png)

Register:  
![Register](screenshots/registration.png)

Error:  
![Error](screenshots/error.png)

Account Created:  
![Account Created](screenshots/account_created.png)

Sign In:  
![Sign In](screenshots/signin.png)

Dashboard:
![Dashboard](screenshots/dashboard.png)

Edit User Details:
![Edit User Details](screenshots/edit_user_details.png)

Edit Event Details:
![Edit Event Details](screenshots/edit_event_details.png)

Add Event:
![Add Event](screenshots/add_event.png)

Search:  
![Search](screenshots/search.png)

Event Details:
![Event Details](screenshots/event_details.png)

Event Organizer Details:
![Event Organizer Details](screenshots/event_organizer_details.png)

Logged Out:  
![Logged Out](screenshots/logged_out.png)
