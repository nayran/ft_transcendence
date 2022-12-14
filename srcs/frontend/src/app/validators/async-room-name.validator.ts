import { AbstractControl, AsyncValidatorFn, ValidationErrors } from "@angular/forms";
import { map, Observable } from "rxjs";
import { ChatService } from "../components/chat/chat.service";

export function isRoomNameTaken(roomService: ChatService): AsyncValidatorFn {

    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        return roomService.checkRoomNameNotTaken(control.value).pipe(
            map(result => {
                if (result.valueOf() === true) {
                    return { "roomNameTaken": true };;
                }
                else {
                    return null
                }
            })
        )
    }
}
