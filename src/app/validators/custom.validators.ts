import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  /** Indian mobile: starts with 6-9, exactly 10 digits */
  static indianMobile(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const valid = /^[6-9]\d{9}$/.test(control.value);
      return valid ? null : { indianMobile: true };
    };
  }

  /** 6-digit OTP */
  static otp(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const valid = /^\d{6}$/.test(control.value);
      return valid ? null : { otp: true };
    };
  }

  /** PAN: 5 letters + 4 digits + 1 letter */
  static pan(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const valid = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(control.value.toUpperCase());
      return valid ? null : { pan: true };
    };
  }

  /** Aadhaar: exactly 12 digits */
  static aadhaar(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const valid = /^\d{12}$/.test(control.value);
      return valid ? null : { aadhaar: true };
    };
  }

  /** Indian pincode: 6 digits */
  static pincode(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const valid = /^\d{6}$/.test(control.value);
      return valid ? null : { pincode: true };
    };
  }

  /** GSTIN pattern */
  static gstin(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const valid = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
        control.value.toUpperCase()
      );
      return valid ? null : { gstin: true };
    };
  }

  /** Vehicle registration number */
  static registrationNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const value = control.value.toUpperCase();
      const valid = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/.test(value);
      return valid ? null : { registrationNumber: true };
    };
  }

  /** Chassis: 8-17 alphanumeric */
  static chassisNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const value = control.value.toUpperCase();
      const valid = /^[A-Z0-9]{8,17}$/.test(value);
      return valid ? null : { chassisNumber: true };
    };
  }

  /** Age >= 18 from dateOfBirth (YYYY-MM-DD) */
  static minAge(minAge: number = 18): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const dob = new Date(control.value);
      if (isNaN(dob.getTime())) return { invalidDate: true };

      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      return age >= minAge ? null : { minAge: { requiredAge: minAge, actualAge: age } };
    };
  }

  /** Must be true (for declarations) */
  static mustBeTrue(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return control.value === true ? null : { mustBeTrue: true };
    };
  }

  /** File size validator (in MB) */
  static maxFileSize(maxMB: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const file = control.value as File | null;
      if (!file) return null;
      const maxBytes = maxMB * 1024 * 1024;
      return file.size <= maxBytes ? null : { maxFileSize: { maxMB, actualMB: +(file.size / 1024 / 1024).toFixed(2) } };
    };
  }

  /** File MIME type validator */
  static fileType(allowed: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const file = control.value as File | null;
      if (!file) return null;
      return allowed.includes(file.type) ? null : { fileType: { allowed, actual: file.type } };
    };
  }

  /** Array of files – min items */
  static minFiles(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const files = control.value as File[] | null;
      if (!files || !Array.isArray(files)) return { minFiles: { required: min, actual: 0 } };
      return files.length >= min ? null : { minFiles: { required: min, actual: files.length } };
    };
  }
}
