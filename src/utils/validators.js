/**
 * Validation utilities for form inputs
 * Each validator returns { isValid: boolean, error: string }
 */

/**
 * Validates required fields (non-empty strings)
 */
export const validateRequired = (value, fieldName = 'This field') => {
    const trimmed = value?.trim() || '';
    if (!trimmed) {
        return { isValid: false, error: `${fieldName} is required` };
    }
    return { isValid: true, error: '' };
};

/**
 * Validates email format
 */
export const validateEmail = (email) => {
    const trimmed = email?.trim() || '';

    if (!trimmed) {
        return { isValid: false, error: 'Email is required' };
    }

    // Standard email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmed)) {
        return { isValid: false, error: 'Please enter a valid email address' };
    }

    return { isValid: true, error: '' };
};

/**
 * Validates US phone number format
 * Accepts: (555) 123-4567, 555-123-4567, 5551234567, etc.
 */
export const validatePhone = (phone) => {
    const trimmed = phone?.trim() || '';

    if (!trimmed) {
        return { isValid: false, error: 'Phone number is required' };
    }

    // Remove all non-digit characters
    const digitsOnly = trimmed.replace(/\D/g, '');

    // Check if we have exactly 10 digits (US phone number)
    if (digitsOnly.length !== 10) {
        return { isValid: false, error: 'Please enter a valid 10-digit phone number' };
    }

    return { isValid: true, error: '' };
};

/**
 * Validates EIN format (XX-XXXXXXX)
 */
export const validateEIN = (ein) => {
    const trimmed = ein?.trim() || '';

    if (!trimmed) {
        return { isValid: false, error: 'EIN is required' };
    }

    // Remove all non-digit characters
    const digitsOnly = trimmed.replace(/\D/g, '');

    // EIN should be 9 digits
    if (digitsOnly.length !== 9) {
        return { isValid: false, error: 'EIN must be 9 digits (format: XX-XXXXXXX)' };
    }

    // Check if it matches the XX-XXXXXXX format (optional, for stricter validation)
    const einRegex = /^\d{2}-?\d{7}$/;
    if (!einRegex.test(trimmed)) {
        return { isValid: false, error: 'Please enter EIN in format: XX-XXXXXXX' };
    }

    return { isValid: true, error: '' };
};

/**
 * Validates name (minimum length, basic character check)
 */
export const validateName = (name, fieldName = 'Name') => {
    const trimmed = name?.trim() || '';

    if (!trimmed) {
        return { isValid: false, error: `${fieldName} is required` };
    }

    if (trimmed.length < 2) {
        return { isValid: false, error: `${fieldName} must be at least 2 characters` };
    }

    // Check for at least some alphabetic characters
    if (!/[a-zA-Z]/.test(trimmed)) {
        return { isValid: false, error: `${fieldName} must contain letters` };
    }

    return { isValid: true, error: '' };
};

/**
 * Validates address (minimum length)
 */
export const validateAddress = (address) => {
    const trimmed = address?.trim() || '';

    if (!trimmed) {
        return { isValid: false, error: 'Address is required' };
    }

    if (trimmed.length < 10) {
        return { isValid: false, error: 'Please enter a complete address (minimum 10 characters)' };
    }

    return { isValid: true, error: '' };
};

/**
 * Validates SSN format (XXX-XX-XXXX)
 */
export const validateSSN = (ssn) => {
    const trimmed = ssn?.trim() || '';
    if (!trimmed) return { isValid: false, error: 'SSN is required' };
    const digitsOnly = trimmed.replace(/\D/g, '');
    if (digitsOnly.length !== 9) {
        return { isValid: false, error: 'SSN must be 9 digits' };
    }
    return { isValid: true, error: '' };
};

/**
 * Validates Date of Birth (must be in past)
 */
export const validateDOB = (dob) => {
    if (!dob) return { isValid: false, error: 'Date of Birth is required' };
    const date = new Date(dob);
    if (isNaN(date.getTime())) return { isValid: false, error: 'Invalid date format' };
    if (date > new Date()) return { isValid: false, error: 'Date of Birth cannot be in the future' };
    return { isValid: true, error: '' };
};

/**
 * Master validator that routes to appropriate validator based on field type
 */
export const validateField = (fieldId, value, profileType) => {
    // Handle nested fields or specific tax identifiers
    if (fieldId.includes('ssn') || fieldId === 'SSN') return validateSSN(value);
    if (fieldId.includes('dob') || fieldId === 'DOB') return validateDOB(value);

    switch (fieldId) {
        case 'name':
        case 'first_name':
        case 'last_name':
        case 'firstName':
        case 'lastName':
            return validateName(value, 'Name');
        case 'businessName':
        case 'business_name':
            return validateName(value, 'Business Name');
        case 'address':
        case 'mailing_address':
            return validateAddress(value);
        case 'phone':
        case 'business_phone':
            return validatePhone(value);
        case 'email':
        case 'business_email':
            return validateEmail(value);
        case 'ein':
            return validateEIN(value);
        default:
            return validateRequired(value, fieldId);
    }
};
