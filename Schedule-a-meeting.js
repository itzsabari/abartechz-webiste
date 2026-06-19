/* ============================================================
   ABARTECHZ — GOOGLE SHEET MEETING LOGGER
   ============================================================ */
'use strict';

(function () {
  // ============================================================
  // PASTE YOUR DEPLOYED GOOGLE APPS SCRIPT WEB APP URL #1 HERE:
  // Replace the placeholder below with your Meetings Web App URL.
  // Example: "https://script.google.com/macros/s/AKfycb.../exec"
  // ============================================================
  const MEETING_WEBAPP_URL = "https://script.google.com/macros/s/AKfycby3lNDIrOM1hMYKL-ngD0TPhQ0nkvGIZg6wSV9yulq6TrfSbgGkME8faxjVIHuWHQSn/exec";

  // Capture the previous sendForm implementation (e.g. EmailJS handler) to chain them
  const previousSendForm = window.sendForm;

  /**
   * Overrides the global sendForm function to save meeting schedule data
   * to Google Sheet #1, then chains to the previous handler (EmailJS).
   */
  window.sendForm = async function (formName, formData) {
    let sheetError = null;

    // Filter to handle ONLY the Schedule a Meeting form
    if (formName === 'Schedule Meeting Modal') {
      // 1. Collect and validate fields
      const name = formData.get('Full Name') || '';
      const email = formData.get('Email') || '';
      const phone = formData.get('Contact Number') || ''; // Prefix + number combined
      const company = formData.get('Company Name') || 'N/A';
      const purpose = formData.get('Meeting Purpose') || '';
      const date = formData.get('Preferred Date') || '';
      const time = formData.get('Preferred Time') || '';
      const mode = formData.get('Meeting Mode') || 'N/A';

      // Validate required fields to prevent empty submissions
      if (!name.trim() || !email.trim() || !phone.trim() || !purpose.trim() || !date.trim() || !time.trim()) {
        throw new Error('Please fill in all required fields.');
      }

      // Validate email format
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(email.trim())) {
        throw new Error('Enter a valid email address.');
      }

      // 2. Prepare payload matching required columns for sheet #1
      const payload = {
        timestamp: new Date().toLocaleString(),
        form_name: formName,
        Name: name.trim(),
        Email: email.trim(),
        "Phone Number": "'" + phone.trim(), // Stored as text to preserve formatting
        "Company Name": company.trim(),
        "Meeting Purpose": purpose.trim(),
        "Preferred Date": date.trim(),
        "Preferred Time": time.trim(),
        "Message": `Scheduled a meeting purpose of ${purpose.trim()} over ${mode.trim()}`
      };

      // 3. Post to Google Sheet #1
      if (MEETING_WEBAPP_URL && MEETING_WEBAPP_URL !== "PASTE_GOOGLE_APPS_SCRIPT_WEBAPP_URL_HERE") {
        try {
          const response = await fetch(MEETING_WEBAPP_URL, {
            method: 'POST',
            mode: 'no-cors', // Essential for Apps Script Web App endpoints
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });
        } catch (err) {
          console.error('Google Sheet Meeting logging failed:', err);
          sheetError = err;
        }
      }
    }

    // 4. Chain back to the previous handler (EmailJS) to run both integrations
    if (previousSendForm) {
      await previousSendForm(formName, formData);
    }

    // 5. Raise error if Sheet submission failed
    if (sheetError) {
      throw new Error(`Google Sheet logging failed: ${sheetError.message}`);
    }

    return { status: 'success' };
  };
})();
