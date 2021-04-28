# cf-worker-ical-coda
Example Cloudflare Worker for Creating iCal files from Coda Tables.

# Setup

## Cloudflare / Worker
This project was created with `worker-template` from cloudflare if you have any questions on how to setup the worker please review the documentation located at https://developers.cloudflare.com/workers/get-started/guide or further documentation for Wrangler can be found [here](https://developers.cloudflare.com/workers/tooling/wrangler).

In addition I did not include a wrangler.toml file due to the file needs to be setup for your own Cloudflare worker account. Refer to https://developers.cloudflare.com/workers/cli-wrangler/configuration

## Configuration
Config file can be found in `config.json` This file needs to be changed for the script to work. At minimum you will need to put in your Coda API token https://coda.io/developers/apis/v1#section/Authentication


# Why was this created?
In order to make coda tables more calendar friendly I  create a Cloudflare worker to convert table data into an iCalendar File. This is the typical format for calendar system created for Lotus notes. More information  about that if you are interested here https://icalendar.org

## Requirements for Table
* Required Columns
  * **Start Time** - The start date/time of the event. needs to be Date/Time format
* Optional Columns
  * **End Time** - If this is no present the system will consider the event to be an all day event. needs to be Date/Time format
  * **Title** - Title for event
  * **Description** - Description for event
  * **All Day** - if this is present it will force the event to show as an all day calendar event. This can be used if you want to have a multiple day event with a Start Time and End Time
  * **Organizer** - Adds organizer name to the event in calendar (Currently not supported due to google calendar does not work with this field)


# Here is an example Table

| Start Time |	End Time |	Title	|Description	|Organizer|	All Day|
|--|--|--|--|--|--|
| |  | My Event Title | My Event Description | Organizer Name |false|

