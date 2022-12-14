import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function forbiddenNameValidator(nameRe: string | undefined): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const forbidden = nameRe === control.value;
        return forbidden ? { forbiddenName: { value: control.value } } : null;
    };
}