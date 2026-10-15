import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormArray
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { FormService } from './services/form.service';
import {
  FormType,
  CustomerCategory,
  EntityType,
  VehicleType,
  Bank,
  Plan,
  ReplacementReason
} from './models/form.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  submitted = false;
  private subs = new Subscription();

  // Enums for template
  formTypes: FormType[] = ['APPLY', 'KYC', 'REPLACE'];
  customerCategories: CustomerCategory[] = ['INDIVIDUAL', 'CORPORATE'];
  entityTypes: EntityType[] = ['PRIVATE_LIMITED', 'PARTNERSHIP', 'LLP', 'PROPRIETORSHIP', 'HUF'];
  vehicleTypes: VehicleType[] = ['PRIVATE', 'COMMERCIAL'];
  banks: Bank[] = ['IDFC', 'SBI'];
  plans: Plan[] = ['REGULAR', 'MAX'];
  replacementReasons: ReplacementReason[] = ['DAMAGED', 'LOST', 'BLACKLISTED', 'OTHER'];

  indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh'
  ];

  constructor(private formService: FormService) {}

  ngOnInit(): void {
    this.form = this.formService.createForm();
    this.formService.applyConditionalValidators(this.form);

    // Watch for changes that affect conditional logic
    this.subs.add(
      this.form.get('formType')!.valueChanges.subscribe(() => {
        this.formService.applyConditionalValidators(this.form);
      })
    );
    this.subs.add(
      this.form.get('customerCategory')!.valueChanges.subscribe(() => {
        this.formService.applyConditionalValidators(this.form);
      })
    );

    // Auto-uppercase registration number
    this.subs.add(
      this.form.get('vehicle.registrationNumber')!.valueChanges.subscribe(() => {
        this.formService.transformRegistrationNumber(
          this.form.get('vehicle.registrationNumber')!
        );
      })
    );

    // Auto-uppercase PAN fields
    ['individual.panNumber', 'corporate.companyPan'].forEach(path => {
      const ctrl = this.form.get(path);
      if (ctrl) {
        this.subs.add(
          ctrl.valueChanges.subscribe(val => {
            if (val && typeof val === 'string') {
              const upper = val.toUpperCase();
              if (upper !== val) ctrl.setValue(upper, { emitEvent: false });
            }
          })
        );
      }
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // ---------- helpers for template ----------
  get f() {
    return this.form.controls;
  }

  get auth() {
    return (this.form.get('authentication') as FormGroup).controls;
  }

  get individual() {
    return (this.form.get('individual') as FormGroup).controls;
  }

  get individualAddress() {
    return (this.form.get('individual.address') as FormGroup).controls;
  }

  get corporate() {
    return (this.form.get('corporate') as FormGroup).controls;
  }

  get corporateAddress() {
    return (this.form.get('corporate.registeredAddress') as FormGroup).controls;
  }

  get signatory() {
    return (this.form.get('corporate.authorizedSignatory') as FormGroup).controls;
  }

  get vehicle() {
    return (this.form.get('vehicle') as FormGroup).controls;
  }

  get product() {
    return (this.form.get('product') as FormGroup).controls;
  }

  get replacement() {
    return (this.form.get('replacement') as FormGroup).controls;
  }

  get declarations() {
    return (this.form.get('declarations') as FormGroup).controls;
  }

  get entityIdFiles(): FormArray {
    return this.form.get('corporate.documents.entityId') as FormArray;
  }
  get addressProofFiles(): FormArray {
    return this.form.get('corporate.documents.addressProof') as FormArray;
  }
  get mandatoryFiles(): FormArray {
    return this.form.get('corporate.documents.mandatory') as FormArray;
  }

  get isIndividual(): boolean {
    return this.form.get('customerCategory')?.value === 'INDIVIDUAL';
  }

  get isCorporate(): boolean {
    return this.form.get('customerCategory')?.value === 'CORPORATE';
  }

  get isReplace(): boolean {
    return this.form.get('formType')?.value === 'REPLACE';
  }

  get documentLabels() {
    const et = this.form.get('entityType')?.value as EntityType | null;
    return this.formService.getDocumentLabels(et);
  }

  // ---------- file handlers ----------
  onSingleFileChange(event: Event, controlPath: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.form.get(controlPath)?.setValue(file);
      this.form.get(controlPath)?.markAsTouched();
    }
  }

  onMultiFileChange(event: Event, array: FormArray): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach(file => {
        this.formService.addFileToArray(array, file);
      });
      array.markAsTouched();
    }
  }

  removeFile(array: FormArray, index: number): void {
    this.formService.removeFileFromArray(array, index);
  }

  getFileName(control: any): string {
    const val = control?.value;
    return val instanceof File ? val.name : '';
  }

  // ---------- submit ----------
  onSubmit(): void {
    this.submitted = true;
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      console.warn('Form is invalid', this.getFormValidationErrors());
      this.scrollToFirstError();
      return;
    }

    // Build payload (files stay as File objects – send via FormData in real app)
    const raw = this.form.getRawValue();
    console.log('✅ Form submitted successfully', raw);

    alert('Form submitted successfully! Check console for payload.');
  }

  private getFormValidationErrors(): any {
    const errors: any = {};
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  private scrollToFirstError(): void {
    const firstInvalid = document.querySelector('.ng-invalid.ng-touched');
    if (firstInvalid) {
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // Utility to show validation error messages
  hasError(control: any, errorCode: string): boolean {
    return control?.touched && control?.hasError(errorCode);
  }

  showError(control: any): boolean {
    return control?.invalid && (control?.touched || this.submitted);
  }
}
