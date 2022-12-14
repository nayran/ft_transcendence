import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AcceptableButton, AlertModel } from './alerts.model';

@Injectable({
  providedIn: 'root'
})
export class AlertsService {

  constructor() { }

  alertsSubject: BehaviorSubject<AlertModel[]> = new BehaviorSubject<AlertModel[]>([]);

  private async alert(newAlert: AlertModel) {
    let add = await this.canAdd(newAlert)
    if (add)
      this.alertsSubject.next([...this.alertsSubject.getValue(), newAlert]);
  }

  async canAdd(newAlert: AlertModel) {
    let alerts$ = this.alertsSubject.getValue();
    for (let index = 0; index < alerts$.length; index++) {
      if (newAlert.challenger && (newAlert.challenger == alerts$[index].challenger))
        return false;
    }
    return true;
  }

  getAlerts(): Observable<AlertModel[]> {
    return this.alertsSubject;
  }

  danger(message: string) {
    this.clear();
    this.alert(new AlertModel({ type: 'danger', msg: message }));
  }

  info(message: string) {
    this.alert(new AlertModel({ type: 'info', msg: message }));
  }

  warning(message: string) {
    this.alert(new AlertModel({ type: 'warning', msg: message }));
  }

  success(message: string) {
    this.alert(new AlertModel({ type: 'success', msg: message }));
  }

  clear() {
    this.alertsSubject.next([]);
  }

  remove(removedAlert: any): void {
    let alerts: AlertModel[] = this.alertsSubject.value;
    alerts = alerts.filter(alert => alert !== removedAlert);
    this.alertsSubject.next(alerts);
  }

  challenge(challenger: any, buttons: AcceptableButton = new AcceptableButton()) {
    let msg = challenger + ' challenged you';
    this.alert(AlertModel.fromChallenge(challenger, msg, buttons));
  }

  cancelChallenge(challenger: any) {
    let alerts: AlertModel[] = this.alertsSubject.value;
    alerts.forEach((item, index) => {
      if (item.challenger === challenger) {
        alerts.splice(index, 1);
      };
    });
    this.alertsSubject.next(alerts);
  }
}