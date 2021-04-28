import moment from 'moment';
import ical from 'ical-generator';

// Import configurations needed for the worker to function
// This information is related to your own company setup such as
// your Coda API and iCal settings
import * as config from './config.json';

/**
 * gatherResponse awaits and returns a response body as a string.
 * Use await gatherResponse(..) in an async function to get the response body
 * @param {Response} response
 */
async function gatherResponse(response) {
  const { headers } = response;
  const contentType = headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return JSON.stringify(await response.json());
  } else if (contentType.includes('application/text')) {
    return await response.text();
  } else if (contentType.includes('text/html')) {
    return await response.text();
  } else {
    return await response.text();
  }
}

addEventListener('fetch', (event) => {
  // Get the requested URL for the worker
  const requestUrl = event.request.url;

  // Pull out the query params and the path segments
  const { searchParams, pathname } = new URL(requestUrl);
  const pathArray = pathname.split('/');

  // Doc ID and Table name can either be sent with query params or
  // they can be sent by the first and second segments in the url
  const documentId = pathArray[1] || searchParams.get('doc');
  const tableName = pathArray[2] || searchParams.get('table');

  // Only work if doc and table exist
  if (documentId && tableName) {
    return event.respondWith(codaTableToIcal(documentId, tableName));
  }
  // Send error message if table ID or document id is missing.
  return event.respondWith(
    new Response(
      "Missing querystring for doc and table should be ID's from coda documents",
    ),
  );
});

// Query Coda API and get table rows and convert the data to iCal format
async function codaTableToIcal(doc, table) {
  const init = {
    headers: {
      //'content-type': 'application/text;charset=UTF-8', // This was used for testing locally with wrangler as it is kinda anoying to work with ical downloads
      'content-type': 'text/calendar;charset=UTF-8',
      Authorization: 'Bearer ' + config.apiToken,
      'Content-Disposition': 'attachment; filename=cool.ics',
    },
  };
  // Generate URL to Coda API
  let url = `https://coda.io/apis/v1/docs/${doc}/tables/${table}/rows/?useColumnNames=true`;

  // Request Results from Coda API
  const response = await fetch(url, init);
  const results = await gatherResponse(response);

  // Create ICS file from api Results
  const calendar = createCalendar(JSON.parse(results).items, doc, table);
  return new Response(calendar, init);
}

const createCalendar = (rows, doc, table) => {
  const eventArray = [];

  rows.map((row) => {
    console.log(
      row.id,
      row.values['Title'],
      row.values['Start Time'],
      row.values['Dates'],
    );
    const start = moment(row.values['Start Time'] || row.values['Dates']);
    if (start.isAfter()) {
      const newEvent = {};
      newEvent.uid = row.id;
      newEvent.timestamp = moment();
      // Table Column can be either Start Time or Dates
      newEvent.start = start;

      newEvent.summary = row.values['Title'];
      newEvent.description = row.values['Description'];

      // If no End Time then
      newEvent.allDay = !!row.values['All Day'];
      if (!row.values['End Time']) {
        newEvent.allDay = true;
      } else {
        newEvent.end = moment(row.values['End Time']);
      }

      // create a new event
      eventArray.push(newEvent);
    }
  });

  // Create new Calendar and set optional fields
  const cal = ical({
    domain: config.domain,
    prodId: {
      company: config.company,
      product: config.product,
    },
    name: `${decodeURI(table)} - ${doc}`,
    timezone: config.timezone,
    events: eventArray,
  });

  return cal.toString();
};
