---
title: 'Customer Management System to manage all customers from one place'
date: 2021-08-31
path: /case-studies/customer-management-system/
excerpt: "Flexonet Aps is a telecommunication company based in Denmark. ..... ..... ..... ..... ...... ..... .... ...... ......"
image: ../../images/notes/fix-rails-auto-increment-id-postgres-error.webp
categories: [case-studies]
tags: [ruby on rails, reactjs]
toc: false
featured: false
comments: false
---

## General Information

- Development: Ongoing
- Team: 3 members
- Platform: Web
- Type: ERP, Custom Solutions
- Industry: Telecommunication
- Country: Denmark

## Short Testimonial

"Prabin has been a valued partner in building solutions we use in Flexonet for more than 2 years now. If you are building custom solutions for your company, you can confidently choose Prabin!"

Ronni Poulsen, Owner, Flexonet Aps

## Who is Flexonet?

**Flexonet is a flexible telecommunications company who want to establish themselves as an alternative to the top telecom companies that are on the market today; with a focus on individual solutions for business**

...... add more description ....

https://thoughtbot.com/case-studies/real-simple-energy

https://thoughtbot.com/case-studies/joydrive

## Backstory

Ronni Poulsen, owner of Flexonet Aps, felt that the current customer management app used in the company was outdated, very slow and cumbersome to work with.

Solution came in using [ODOO](https://www.odoo.com/), an external ERP system. ODOO provides customer management, invoice management, bank integrations for receiving and making payments and much more. Because ODOO is a general solution it was not tailored enough for the company since Flexonet being a company providing custom solutions tailored to each business. To handle that there was a need of custom web app that could integrate well with ODOO to manage customers, and their solutions like mobile phones, scheduled invoices, pbxes, internet and many more from the single web app.

Ronni was looking for a freelancer with proven history and matching tech stack i.e. Ruby on Rails and ReactJS and within a budget because company could only afford a freelancer at that moment. That's when he found me in [Upwork](https://www.upwork.com/freelancers/~0184b506a4486b8f86?s=1110580755107926016) and sent the invitation to work in the project.

## Planning

1. Input

    The client initially had:

    - Existing customer management web app
    - List of required features
    - Documentation for integration with ODOO
    - Project release deadline

2. Analysis

   We analyzed the requirement very carefully:
    - Held over 5 meetings for clarity of requirements
    - Analysed existing web applications

3. Outcome

    This resulted in:

    - Database design for the new application
    - Project Roadmap for completing the project in given deadline

## Challenges and Solutions

1. Manual Integration with external service

    Normally, with Rails applications there are gems (pre configured packages) for the majority of the services but there wasn’t one for ODOO. Luckily, there were API endpoints we could use with XML RPC. 
    
    To address the issue, we built our own service to connect with the ODOO API and perform CRUD operations through that API.

2. Customer Login

    Flexonet focuses on providing services to small and big companies so customers for in this case are debtors (or a company). And all customers are created in the database of ODOO. The challenge for us now was to allow users from the customers company to access the data in our web app.

    We solved this by maintaining a column in our database by referencing the record id in ODOO. That way each user created for login in our app was associated with the customer's company and we could easily fetch related records from the ODOO while other user information like names and passwords were inside the database of our web app.

3. Database Separation

    When integrating with external services, most of the data will be stored inside that service and it is a challenge to figure out what to save in our web app versus what is already provided and refraining from designing database that leads to data duplication issue.

    As mentioned above in customer login, this was resolved the same way by maintaining a column in our database for referencing the record in ODOO. That way whatever we needed from ODOO will be fetched from there and rest from our own database.

## Result

1. Blazing Fast Interface

    One of the reasons for redeveloping features and creating the current customer management application was because the existing application was very slow. Either it be while invoicing customers or normal speed.

    With ReactJS as a frontend and Rails as an API we resolved the issue of the speed very easily. All APIs are optimized and every UI loads in a matter of a second.

2. General solution integrated with custom solutions


    Write HOW ODOO being the general solution has been integrate with web app and what that has resulted in -> invoice handling easily, customer management from single place, etc....

    old description:

    With the current application, the client can now manage customers of the company, all pbxes in the company and invoices right from the web app.

    It has made the invoicing a breeze to handle and has saved a lot of time of the client which would have otherwise gone in manually maintaining these invoices in ODOO. With the web app everything is connected and in one place.

3. Invoice Automation

    DONT mention pbx and all, only need to mention agreement, invoices and odoo

    old description:

    With the custom solutions developed for Flexonet, it has helped our client to automate some part of their business

        - Pbx creation and syncing from Customer Management App with Pbx server
        - Telecom usage billing (in separate app) integrated with customer subscriptions invoices

## CTA

Build your next solution with me (pfft, lame)

## Screenshots

add screenshots of the web app that we can show here

## Links

Web App: https://mit.flexonet.dk/

## Technology Stack

1. Frontend

    ReactJS

2. Mobile

    React Native

3. Backend

    Ruby on Rails

4. Release
    
    Website

## Feedback from Client

......


## CTA

..... solution specific CTA ....

Automate your business with our custom solutions while you maintain focus on making profits. Schedule a call. (Pffft ... lame, I know!)

## What's next for the Project?

The work first started with Customer Management Web App and now we are concurrently building Pbx management, Telecom billing, Flexonet Landing Page and soon to come Telecom Customer portal for letting users manage their cell phone and pbx services both in web and mobile.


## Related case studies and blogs

... .... ...... 
