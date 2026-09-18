/**
 * Clinic Payment Management System - Form Validation & Sanitization Helpers
 */

const FormValidator = (function () {
  /**
   * Sanitizes input strings to prevent basic script injections
   */
  function sanitize(str) {
    if (typeof str !== 'string') return '';
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML.trim();
  }

  /**
   * Validates new payment transaction payload
   */
  function validatePaymentPayload(data) {
    const errors = {};

    if (!data.patientName || data.patientName.trim().length < 3) {
      errors.patientName = "Please provide patient's full name (at least 3 characters).";
    }

    if (!data.service || data.service.trim().length < 2) {
      errors.service = "Please specify the procedure or service.";
    }

    const fee = Number(data.totalFee);
    if (isNaN(fee) || fee <= 0) {
      errors.totalFee = "Total fee must be a positive amount.";
    }

    const doctorPct = Number(data.doctorPercent);
    if (isNaN(doctorPct) || doctorPct < 0 || doctorPct > 100) {
      errors.doctorPercent = "Doctor percentage must be between 0 and 100%.";
    }

    const paid = Number(data.paidAmount);
    if (isNaN(paid) || paid < 0) {
      errors.paidAmount = "Paid amount cannot be negative.";
    } else if (paid > fee) {
      errors.paidAmount = "Paid amount cannot exceed total fee.";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Attaches field-level live error feedback to HTML forms
   */
  function applyErrorsToForm(formElement, errors) {
    // Reset all previous errors
    formElement.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    formElement.querySelectorAll('.form-error-text').forEach(el => el.remove());

    Object.keys(errors).forEach(fieldName => {
      const field = formElement.querySelector(`[name="${fieldName}"]`);
      if (field) {
        field.classList.add('is-invalid');
        const errDiv = document.createElement('div');
        errDiv.className = 'form-error-text';
        errDiv.textContent = errors[fieldName];
        field.parentElement.appendChild(errDiv);
      }
    });
  }

  return {
    sanitize,
    validatePaymentPayload,
    applyErrorsToForm
  };
})();
