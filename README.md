# Live Bus Tracker

Build the foundation of a real-time public bus tracking prototype.

The project is a web application with two sides:

1. Passenger side

2. Driver/Admin side

Technology requirements:

* Frontend: React + TypeScript

* UI: Tailwind CSS

* Backend/database: Supabase

* Maps: Mapbox

* Realtime updates: Supabase Realtime

* Browser Geolocation API for driver location

* The application must be responsive on desktop and mobile.

Do NOT build unnecessary enterprise features. This is a 4-day working prototype.

The core concept is similar to Flightradar24, but for city buses: passengers should see buses moving live on a map.

Use the existing Supabase database structure:

buses:

* id uuid primary key

* bus_number text

* route_id uuid foreign key to routes

routes:

* id uuid primary key

* name text

* stops jsonb

live_locations:

* id uuid primary key

* bus_id uuid foreign key to buses

* latitude float8

* longitude float8

* updated_at timestamp

Assume these additional live_locations fields will be added:

* speed float8 nullable

* heading float8 nullable

* accuracy float8 nullable

Build a clean application architecture with reusable components.

Create these main routes/pages:

Passenger:

* /

* /passenger

* /passenger/bus/:id

Driver/Admin:

* /driver

* /driver/tracking

* /admin

Do not implement complex functionality yet.

First establish:

* application routing

* Supabase client

* environment variable configuration

* reusable map component placeholder

* reusable bus marker component

* reusable route component

* basic navigation

* clean responsive layout

Use mock data only where necessary.

Do not hardcode API keys.

At the end, make sure the project builds without TypeScript errors.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a24f76ea-2986-43c1-a4ef-d17f7e9ccde8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
