# Sara-Dentist-calling-agent
## Preview

**n8n — Check Availability workflow**
Webhook receives the requested date from Vapi, pulls that day's events from Google Calendar, and a Code node computes the open 30-minute slots (9 AM–6 PM) before responding back to the assistant.

![Check Availability workflow](https://raw.githubusercontent.com/webd2276/Sara-Dentist-calling-agent/main/Screenshot%20from%202026-07-25%2014-48-51.png)

**n8n — Book Appointment workflow**
Webhook receives the confirmed booking details, creates the Google Calendar event, logs the booking to Google Sheets, then branches on whether an email was provided to send a Gmail and/or WhatsApp confirmation.

![Book Appointment workflow](https://raw.githubusercontent.com/webd2276/Sara-Dentist-calling-agent/main/Screenshot%20from%202026-07-25%2014-49-33.png)

**n8n — Reschedule / Cancel workflow**
Webhook looks up the existing booking in Google Sheets by phone number, then branches: cancel deletes the Calendar event, reschedule updates its start/end time and sends updated email + WhatsApp notifications.

