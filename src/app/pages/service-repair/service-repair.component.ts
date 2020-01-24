import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Service } from 'src/app/models/service.model';
import { SessionService } from 'src/app/shared/services/session.service';
import { InvoiceSummaryDialogComponent } from 'src/app/shared/invoice-summary-dialog/invoice-summary-dialog';

@Component({
  selector: 'app-service-repair',
  templateUrl: './service-repair.component.html',
  styleUrls: ['./service-repair.component.css']
})
export class ServiceRepairComponent implements OnInit {
  form: FormGroup;
  username: string;
  serviceOfferings: Service[];
  get serviceControls() {
    return this.form.controls.services as FormArray;
  }

  constructor(
    private http: HttpClient,
    private sessionService: SessionService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router) {

    // get the username
    this.username = this.sessionService.getUsername();
  }


  ngOnInit() {

    this.form = this.fb.group({
      parts: [null, Validators.compose([Validators.required])],
      labor: [null, Validators.compose([Validators.required])],
      alternator: [null, null],
      services: new FormArray([])
    });

    this.http.get<Service[]>(`/api/services/`).subscribe((services) => {
      this.serviceOfferings = services;
      console.log(this.serviceOfferings);
      this.initForm();
    }, (err) => {
      console.log(err);
    }, () => {
      // create the form controls mapping the product into a control
      const formArray = this.form.controls.services as FormArray;
      this.serviceOfferings.forEach((x) => formArray.push(new FormControl(false)));
      console.log(this.form);

    });


    console.log(this.username);
  }

  initForm() {

  }

  submit(form) {
    console.log(form);

    const lineItems = [];
    this.serviceControls.controls.forEach((x, i) => {
      if (x.value) {
        const service = this.serviceOfferings[i];
        lineItems.push({
          service: {
            description: service.description,
            price: service.price
          },
          itemTotal: service.price,
          quantity: 1});
      }
    });

    const partsAmount = parseFloat(this.form.controls.parts.value);
    const laborAmount = this.form.controls.labor.value * 50;
    const lineItemTotal = lineItems.reduce((prev, cur) => prev + cur.itemTotal, 0);
    console.log(lineItemTotal);
    const total = partsAmount + laborAmount + lineItemTotal;

    const invoice = {
      lineItems,
      partsAmount,
      laborAmount,
      lineItemTotal,
      total,
      username: this.username,
      orderDate: new Date()
    };

    console.log(invoice);

    const dialogRef = this.dialog.open( InvoiceSummaryDialogComponent, {
      data: {
        invoice: invoice
      },
      disableClose: true,
      width: '800px'
    });

  dialogRef.afterClosed().subscribe(result => {
    if(result === 'confirm') {
      console.log('Invoice Saved');

      this.http.post('/api/invoices/' + invoice.username, {
        lineItems: invoice.lineItems,
        partsAmount: invoice.partsAmount,
        laborAmount: invoice.laborAmount,
        lineItemTotal: invoice.lineItemTotal,
        total: invoice.total,
        orderDate: invoice.orderDate
      }).subscribe(res => {
        this.router.navigate(['/']);
      }, err => {
        console.log(err);
      });
    }
  });

}
}