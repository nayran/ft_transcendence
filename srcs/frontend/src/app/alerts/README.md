#yeyy, Alert is working.

To implement it:

1. to give a component the ability to create an alert (for itself or before redirecting to another route):


>add the service to the component

```		private alertservice: AlertsService```

>generate the alert on the proper function

```		this.alertservice.danger('wow3')````


2. to give a component the ability to display an alert

> just add it to the component's html

```
	<app-alerts></app-alerts>
```
