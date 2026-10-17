import { Injectable } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  FormArray,
  Validators,
  AbstractControl
} from '@angular/forms';
import { CustomValidators } from '../validators/custom.validators';
import {
  FormType,
  CustomerCategory,
  EntityType,
  ENTITY_DOCUMENT_MATRIX
} from '../models/form.model';

@Injectable({ providedIn: 'root' })
export class FormService {
  constructor(private fb: FormBuilder) {}

  createForm(): FormGroup {
    return this.fb.group({
      formType: ['APPLY', Validators.required],
      customerCategory: ['CORPORATE', Validators.required],
      entityType: [null], // required only when CORPORATE

      authentication: this.fb.group({
        mobile: ['', [Validators.required, CustomValidators.indianMobile()]],
        otp: ['', [Validators.required, CustomValidators.otp()]]
      }),

      individual: this.createIndividualGroup(),
      corporate: this.createCorporateGroup(),

      vehicle: this.fb.group({
        vehicleType: ['PRIVATE', Validators.required],
        registrationNumber: [
          '',
          [Validators.required, CustomValidators.registrationNumber()]
        ],
        chassisNumber: [
          '',
          [Validators.required, CustomValidators.chassisNumber()]
        ],
        rcFront: [null, [Validators.required, CustomValidators.maxFileSize(5), CustomValidators.fileType(['image/jpeg', 'image/png', 'application/pdf'])]],
        rcBack: [null, [Validators.required, CustomValidators.maxFileSize(5), CustomValidators.fileType(['image/jpeg', 'image/png', 'application/pdf'])]],
        frontImage: [null, [Validators.required, CustomValidators.maxFileSize(5), CustomValidators.fileType(['image/jpeg', 'image/png'])]],
        sideImage: [null, [Validators.required, CustomValidators.maxFileSize(5), CustomValidators.fileType(['image/jpeg', 'image/png'])]]
      }),

      product: this.fb.group({
        bank: ['IDFC', Validators.required],
        plan: ['REGULAR', Validators.required]
      }),

      replacement: this.fb.group({
        reason: [null],
        oldTagId: ['']
      }),

      declarations: this.fb.group({
        ovotAccepted: [false, [Validators.required, CustomValidators.mustBeTrue()]],
        vahanVerified: [false, Validators.required]
      })
    });
  }

  private createIndividualGroup(): FormGroup {
    return this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      dateOfBirth: ['', [Validators.required, CustomValidators.minAge(18)]],
      email: ['', [Validators.required, Validators.email]],
      address: this.createAddressGroup(),
      aadhaarNumber: ['', [Validators.required, CustomValidators.aadhaar()]],
      aadhaarFront: [null, [Validators.required, CustomValidators.maxFileSize(5), CustomValidators.fileType(['image/jpeg', 'image/png', 'application/pdf'])]],
      aadhaarBack: [null, [Validators.required, CustomValidators.maxFileSize(5), CustomValidators.fileType(['image/jpeg', 'image/png', 'application/pdf'])]],
      panNumber: ['', [Validators.required, CustomValidators.pan()]],
      panFront: [null, [Validators.required, CustomValidators.maxFileSize(5), CustomValidators.fileType(['image/jpeg', 'image/png', 'application/pdf'])]],
      panBack: [null, [CustomValidators.maxFileSize(5), CustomValidators.fileType(['image/jpeg', 'image/png', 'application/pdf'])]]
    });
  }

  private createCorporateGroup(): FormGroup {
    return this.fb.group({
      companyName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
      companyPan: ['', [Validators.required, CustomValidators.pan()]],
      gstin: ['', [CustomValidators.gstin()]],
      registeredAddress: this.createAddressGroup(),
      authorizedSignatory: this.fb.group({
        name: ['', Validators.required],
        mobile: ['', [Validators.required, CustomValidators.indianMobile()]],
        email: ['', [Validators.required, Validators.email]],
        aadhaarFront: [null, [Validators.required, CustomValidators.maxFileSize(5), CustomValidators.fileType(['image/jpeg', 'image/png', 'application/pdf'])]],
        aadhaarBack: [null, [Validators.required, CustomValidators.maxFileSize(5), CustomValidators.fileType(['image/jpeg', 'image/png', 'application/pdf'])]],
        panFront: [null, [Validators.required, CustomValidators.maxFileSize(5), CustomValidators.fileType(['image/jpeg', 'image/png', 'application/pdf'])]],
        panBack: [null, [CustomValidators.maxFileSize(5), CustomValidators.fileType(['image/jpeg', 'image/png', 'application/pdf'])]]
      }),
      documents: this.fb.group({
        entityId: this.fb.array([], [CustomValidators.minFiles(1)]),
        addressProof: this.fb.array([], [CustomValidators.minFiles(1)]),
        mandatory: this.fb.array([], [CustomValidators.minFiles(1)])
      })
    });
  }

  private createAddressGroup(): FormGroup {
    return this.fb.group({
      line1: ['', Validators.required],
      line2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      pincode: ['', [Validators.required, CustomValidators.pincode()]]
    });
  }

  /** Call this whenever formType / customerCategory / entityType change */
  applyConditionalValidators(form: FormGroup): void {
    const formType = form.get('formType')?.value as FormType;
    const category = form.get('customerCategory')?.value as CustomerCategory;
    const entityTypeCtrl = form.get('entityType');
    const replacementGroup = form.get('replacement') as FormGroup;
    const individualGroup = form.get('individual') as FormGroup;
    const corporateGroup = form.get('corporate') as FormGroup;

    // entityType required only for CORPORATE
    if (category === 'CORPORATE') {
      entityTypeCtrl?.setValidators([Validators.required]);
      individualGroup.disable({ emitEvent: false });
      corporateGroup.enable({ emitEvent: false });
    } else {
      entityTypeCtrl?.clearValidators();
      entityTypeCtrl?.setValue(null, { emitEvent: false });
      individualGroup.enable({ emitEvent: false });
      corporateGroup.disable({ emitEvent: false });
    }
    entityTypeCtrl?.updateValueAndValidity({ emitEvent: false });

    // replacement.reason required only when formType === REPLACE
    const reasonCtrl = replacementGroup.get('reason');
    if (formType === 'REPLACE') {
      reasonCtrl?.setValidators([Validators.required]);
      replacementGroup.enable({ emitEvent: false });
    } else {
      reasonCtrl?.clearValidators();
      reasonCtrl?.setValue(null, { emitEvent: false });
      replacementGroup.disable({ emitEvent: false });
    }
    reasonCtrl?.updateValueAndValidity({ emitEvent: false });
  }

  /** Helper to get document labels for current entityType */
  getDocumentLabels(entityType: EntityType | null) {
    if (!entityType) return null;
    return ENTITY_DOCUMENT_MATRIX[entityType] || null;
  }

  /** Uppercase transform for registration number */
  transformRegistrationNumber(control: AbstractControl): void {
    if (control.value && typeof control.value === 'string') {
      const upper = control.value.toUpperCase();
      if (upper !== control.value) {
        control.setValue(upper, { emitEvent: false });
      }
    }
  }

  /** Helper to add a file to a FormArray */
  addFileToArray(array: FormArray, file: File): void {
    array.push(new FormControl(file, [
      CustomValidators.maxFileSize(5),
      CustomValidators.fileType(['image/jpeg', 'image/png', 'application/pdf'])
    ]));
  }

  removeFileFromArray(array: FormArray, index: number): void {
    array.removeAt(index);
  }
}
