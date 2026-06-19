/* ============================================================
   ABARTECHZ — GOOGLE SHEET INNOVATORS LOGGER
   ============================================================ */
'use strict';

(function () {
  // ============================================================
  // PASTE YOUR DEPLOYED GOOGLE APPS SCRIPT WEB APP URL #2 HERE:
  // Replace the placeholder below with your Innovators Web App URL.
  // Example: "https://script.google.com/macros/s/AKfycb.../exec"
  // ============================================================
  const INNOVATOR_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbwGq_so7te07EdO2VZtuVJhIpqFoYLkPP7821-h6uBsX4-p2iZqLfaU1dVv0wXC9-PSXQ/exec";

  // Capture the previous sendForm implementation to chain them
  const previousSendForm = window.sendForm;

  /**
   * Helper function to upload files (resumes) securely to tmpfiles.org
   * and return a direct download URL.
   * 
   * @param {File} file The file to upload.
   * @returns {Promise<string>} Direct download link of the uploaded file.
   */
  async function uploadResumeForSheet(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('https://tmpfiles.org/api/v1/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('File upload to tmpfiles.org failed.');
    }

    const result = await response.json();
    return result.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
  }

  /**
   * Overrides the global sendForm function to save innovator application data
   * to Google Sheet #2, then chains to the previous handler (EmailJS).
   */
  window.sendForm = async function (formName, formData) {
    let sheetError = null;

    // Filter to handle ONLY the Become an Innovator form
    if (formName === 'Become an Innovator Form') {
      // 1. Collect and validate fields
      const fullName = formData.get('Name') || '';
      const email = formData.get('Email') || '';
      const phone = formData.get('Phone Number') || '';
      const whyJoin = formData.get('Why Join') || '';
      const file = formData.get('Resume File');

      // Validate required fields to prevent empty submissions
      if (!fullName.trim() || !email.trim() || !phone.trim() || !whyJoin.trim()) {
        throw new Error('Please fill in all required fields.');
      }

      // Validate email format
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(email.trim())) {
        throw new Error('Enter a valid email address.');
      }

      // Check if file is uploaded
      if (!file || !file.name || file.size === 0) {
        throw new Error('Please upload your resume.');
      }

      // Upload file to get direct URL
      let resumeUrl = '';
      try {
        resumeUrl = await uploadResumeForSheet(file);
      } catch (uploadError) {
        console.error('Resume upload for sheet failed:', uploadError);
        throw new Error(`Resume upload failed: ${uploadError.message}`);
      }

      // 2. Prepare payload matching required columns for sheet #2
      const payload = {
        timestamp: new Date().toLocaleString(),
        form_name: formName,
        "Full Name": fullName.trim(),
        Email: email.trim(),
        "Phone Number": "'" + phone.trim(), // Stored as text to preserve formatting
        "Resume URL": resumeUrl,
        "Why Do You Want To Join": whyJoin.trim()
      };

      // 3. Post to Google Sheet #2
      if (INNOVATOR_WEBAPP_URL && INNOVATOR_WEBAPP_URL !== "PASTE_GOOGLE_APPS_SCRIPT_WEBAPP_URL_HERE") {
        try {
          const response = await fetch(INNOVATOR_WEBAPP_URL, {
            method: 'POST',
            mode: 'no-cors', // Essential for Apps Script Web App endpoints
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });
        } catch (err) {
          console.error('Google Sheet Innovator logging failed:', err);
          sheetError = err;
        }
      }
    }

    // 4. Chain back to the previous handler to run both integrations
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
