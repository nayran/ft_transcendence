import { AbstractControl, AsyncValidatorFn, FormControl, ValidationErrors } from "@angular/forms";
import { map, Observable } from "rxjs";
import { UserService } from "../services/user.service";


export function isUsernameTaken(userService: UserService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        return userService.checkUsernameNotTaken(control.value).pipe(
            map(result => {
                if (result.valueOf() === true) {
                    return { "usernameTaken": true };;
                }
                else {
                    return null
                }
            })
        )
    }
}
