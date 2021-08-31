---
title: 'Customer Management System to manage all customers from one place'
date: 2021-08-31
path: /case-studies/customer-management-system/
excerpt: "Customer Management System to manage all customers in telecom company by integrating with external services for ease in managing invoices and payments."
image: ../../images/notes/fix-rails-auto-increment-id-postgres-error.webp
categories: [case-studies]
tags: [ruby on rails, reactjs]
toc: false
featured: false
comments: false
---

## General Information

- Time: Completed
- Team: 3 members
- Platform: Web
- Type: ERP, Custom Solutions
- Industry: Telecommunication
- Country: Denmark

## Short Testimonial

"Prabin has been a valued partner in building solutions we use in Flexonet for more than 2 years now. If you are building custom solutions for your company, you can confidently choose Prabin!"

Ronni Poulsen, Owner, Flexonet Aps

## Who is Flexonet?

**Flexonet is a telecommunications company with focus on providing individual solutions to business with flexible plans for each solution**

They want to establish themselves as an alternative to the top telecom companies that are on the market today in Denmark. Main focus and selling point of the company is to provide solutions that are tailored for the business which ultimately leads to flexible plans for each solutions that business want to use.

## Backstory

Ronni Poulsen, owner of Flexonet Aps, felt that the current customer management app used in the company was outdated, very slow and cumbersome to work with. Invoicing one customer would take around 5 minutes to process everything.

Solution he came up with was using <a href="https://www.odoo.com/"  target="_blank" rel="noopener">ODOO</a>, an external ERP system which provides customer management, invoice management and bank integrations for payments. Because ODOO is a general solution it was not  enough for the company. To handle that there was a need of custom web app that could integrate well with ODOO to manage customers, scheduled invoices, and in future also their solutions like mobile phones, pbxes, internet, etc. from the single web app.

Ronni was looking for a freelancer with proven history and matching tech stack i.e. Ruby on Rails and ReactJS and within the budget. That's when he found me in [Upwork](https://www.upwork.com/freelancers/~0184b506a4486b8f86?s=1110580755107926016) to work in the project.

## Planning

1. Input

    The client initially had:

    - Existing customer management web app
    - List of required features
    - Documentation for integration with ODOO
    - Project release deadline

2. Analysis

   Team analyzed requirements very carefully:

    - Held over 5 meetings for clarity of requirements
    - Analysed existing web applications
    - Analysed database design of old web applications

3. Outcome

    This resulted in:

    - Database design for the new application
    - Project Roadmap for completing the project within deadline

## Challenges and Solutions

1. Manual Integration with external service

    Normally, with Rails applications there are gems (pre configured packages) for the majority of the services but there wasn’t one for ODOO. Luckily, there were API endpoints we could use with detailed documentation from ODOO. 
    
    To address the issue, we built our own service to connect with the ODOO API and perform CRUD operations through that API.

2. Customer Login

    All customers (business) of Flexonet are created in the database of ODOO while each users inside the business are inside our own web app. The challenge for us now was to allow users from the business to access the data in our web app.

    We solved this by maintaining a column in our database by referencing the record id in ODOO. That way each user created for login in our app was associated with the customer's company and we could easily fetch related records from the ODOO while other user information like names and passwords were inside the database of our web app.

3. Database Separation

    When integrating with external services, most of the data will be stored inside that service and it is a challenge to figure out what to save in our web app versus what is already provided and refraining from designing database that leads to data duplication issue.

    As mentioned above in customer login, this was resolved the same way by maintaining a column in our database for referencing the record in ODOO. That way whatever we needed from ODOO will be fetched from there and rest from our own database.

## Result

1. Blazing Fast Interface

    One of the reasons for redeveloping features and creating the current customer management application was that existing application was very slow. Either it be while invoicing customers or overall speed of the web interface.

    With ReactJS as a frontend and Rails as an API we resolved the issue of the speed very easily. All APIs are optimized and every UI loads in a matter of a second.

2. General solution integrated with custom solutions

    ODOO provides solutions for general purposes which is not suited for all the company and that was the case for Flexonet too. With web app we have tailored the solution enough to work for the company.
    
    
    This has resulted in general solutions being integrated with custom solutions:
    
        - ODOO provides handling of invoices, web app provides way to schedule all invoice generation for customers
        - ODOO provides managing customers easily, web app provides login interface for all users inside the business so they can manage their invoices and solutions like cell phones, pbx, etc.
        - ODOO provides products to use for solutions, web app provides subscription system to use those products and add to invoices

3. Invoice Automation

    ODOO provides an interface to handle invoices where we can create, edit and send the invoice to client. But invoices generally work with subscription system where each business can have multiple solutions they have subscribed to like cell phone, pbx, internet, etc. and all these subscription need to be invoiced on specific period configured for the customers e.g. monthly, quarterly, yearly, etc.

    Previously, company had to manually add all the subscriptions to invoice and send to customers. This was not productive at all because it would take a lot of time to invoice 1000 customers in the company manually.

    With the new web app, Flexonet had a way to add subscriptions for each solution in single place which we like to call "Agreement". Invoicing system inside the web app will then take care of generating invoice on specific period for each agreement with scheduling. This was invoicing customers was fully automated and Flexonet has saved a lot of money in terms of time of the employees.

## CTA

Build your next solution with me (pfft, lame)

It should be something that customers can relate to, what could their pain point be? I have to identify that put it here.

Remember, CTA is not about me, it's about them (customers).

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

I had a bad experience with freelancing previously and was quite afraid when I hired Prabin to work on our telecom app. But he is such a professional that he right away made me feel that he was the right choice for the job. I needed a full stack developer who could work on redesigning existing system and also create new applications as we moved forward, and Prabin has done a brilliant job in that regard. He has excellent knowledge on Ruby on Rails and React. He always comes up with suggestions and is very approachable and flexible. I will definitely hire him again in the future and recommend him to anyone wanting to hire him!

Ronni Poulsen, Owner, Flexonet Aps

## CTA

..... solution specific CTA ....

Automate your business with our custom solutions while you maintain focus on making profits. Schedule a call. (Pffft ... lame, I know!)

## What's next for the Project?

The work first started with Customer Management Web App and now we are concurrently building Pbx management, Telecom billing, Flexonet Landing Page and soon to come Telecom Customer portal for letting users manage their cell phone and pbx services both in web and mobile.


## Related case studies and blogs

... .... ...... 
