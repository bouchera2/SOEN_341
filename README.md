# SOEN_341
SOEN 341 project FALL 2025

Bouchera Hazzab (40282895) @bouchera2,

Nkrumah Leugoue Nougoue (40258711) @LNN10,

Elizabeth Tremblay (40117481) @liztremblay,

Mahdi Djellab (40254945) @rabzouuuz,

Elias Nasrallah (40233118) @Eliasn20,

Georgy Khoder (40248521) @Georgii77,

Mohammed Mrani Alaoui (40279836) @momrania,

M-Amar Kseibi (40276594) @3Ammar3

## <ins>Language and techniques </ins> 

Backend: Java

Database: mySQL

Framework for the backend: Springboot

Frontend: JavaScript, CSS, HTML

Framework for the frontend: React, Bootstrap

# Project Description
You are implementing a Campus Events & Ticketing Web Application designed to help students discover, organize, and attend events on campus. The system enables students to browse events, save them, claim free or paid tickets, and check in using QR codes. Organizers can create and manage events, track attendance, and access analytics through dashboards, while administrators moderate content and oversee organizations. The application streamlines event management, improves student engagement, and provides valuable insights for both organizers and campus administration.

As an example, you can take a look at: https://www.campusgroups.com

## **Core Features** 
We identify three primary users: Students, Organizers, and Administrators.

**1. Student Event Experience**

<ins>Event Discovery</ins>

 -Browse and search events with filters (date, category, organization).

<ins>Event Management</ins> 

 -Save events to a personal calendar.
 
 -Claim tickets (free or mock paid).
 
 -Receive a digital ticket with a unique QR code.


**2. Organizer Event Management**

<ins>Event Creation</ins>

 -Enter event details: title, description, date/time, location, ticket capacity, ticket type (free or paid).

<ins>Event Analytics</ins>

 -Dashboard per event with stats: tickets issued, attendance rates, and remaining capacity.

<ins>Tools</ins>

 -Export the attendee list in CSV.
 
 -Integrated QR scanner for ticket validation (for simplicity, you can assume the QR code image can be provided via file upload).

**3. Administrator Dashboard & Moderation**

<ins>Platform Oversight</ins>

 -Approve organizer accounts.
 
 -Moderate event listings for policy compliance.

<ins>Analytics</ins>

 -View global stats: number of events, tickets issued, and participation trends.

Management
 -Manage organizations and assign roles.

## Additional Feature
### Comment section and ratings

 Users can add comments and ask questions under each event. Once the user has attended the event, they will be able to rate it out of 5 stars.
