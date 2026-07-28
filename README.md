<div align="center">
<img src="https://github.com/webd2276/sarah-dental-clinic-crm/blob/main/Screenshot%20from%202026-07-28%2014-37-39.png" width="600" alt="Screenshot">

</div>

# Run and deploy 

This contains everything you need to run your app locally.

View your app in https://sarah-dental-clinic-crm.netlify.app

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local)
3. Run the app:
   `npm run dev`
n8n vapi workflows.json

# Sara-Dentist-calling-agent
## Preview

**n8n — Check Availability workflow**
Webhook receives the requested date from Vapi, pulls that day's events from Google Calendar, and a Code node computes the open 30-minute slots (9 AM–6 PM) before responding back to the assistant.

![Check Availability workflow](https://raw.githubusercontent.com/webd2276/Sara-Dentist-calling-agent/main/Screenshot%20from%202026-07-25%2014-48-51.png)

**n8n — Book Appointment workflow**
Webhook receives the confirmed booking details, creates the Google Calendar event, logs the booking to Google Sheets, then branches on whether an email was provided to send a Gmail and/or WhatsApp confirmation.
![Reschedule / Cancel workflow](https://raw.githubusercontent.com/webd2276/Sara-Dentist-calling-agent/main/Screenshot%20from%202026-07-25%2014-50-05.png)

**Vapi Assistant dashboard**
The "Sara" assistant configured in Vapi — model, voice, and the `check_availability` / `book_appointment` / `cancel_or_reschedule` tools wired to the n8n webhooks above.

![Vapi Assistant dashboard](https://raw.githubusercontent.com/webd2276/Sara-Dentist-calling-agent/main/Screenshot%20from%202026-07-25%2014-51-34.png)


![Book Appointment workflow](https://raw.githubusercontent.com/webd2276/Sara-Dentist-calling-agent/main/Screenshot%20from%202026-07-25%2014-49-33.png)

**n8n — Reschedule / Cancel workflow**
Webhook looks up the existing booking in Google Sheets by phone number, then branches: cancel deletes the Calendar event, reschedule updates its start/end time and sends updated email + WhatsApp notifications.


