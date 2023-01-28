import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormArray, FormControl, FormGroup, FormGroupDirective, Validators} from "@angular/forms"
import {Invoice} from './invoice';

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'Invoice';
  total = 0;


  form = new FormGroup({
    Name: new FormControl('', [Validators.required, Validators.minLength(5), Validators.pattern('[a-zA-Z]*'),]),
    Email: new FormControl('', [Validators.required,
      Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]),
    Address: new FormControl('', [Validators.required
    ]),
    Contact: new FormControl('', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]),

    Products: new FormArray([
      new FormGroup({
        ProductName: new FormControl('', [Validators.required, Validators.minLength(5), Validators.pattern('[a-zA-Z]*')]),
        ProductPrice: new FormControl('', [Validators.required, Validators.pattern('[0-9]*')]),
        ProductQuntity: new FormControl('', [Validators.required, Validators.pattern('[0-9]*')])
      })
    ]),
    Discount: new FormControl('', [Validators.required, Validators.min(0), Validators.max(100), Validators.pattern('[0-9]*')])
  })


  get Discount(): any {
    return this.form.get('Discount');
  }

  submit(form: FormGroupDirective) {

    if (form.valid) {
      console.warn(JSON.stringify(form.value))
    }
  }

  get Products(): any {
    return this.form.get('Products') as FormArray
  }

  CreateProductGroup() {
    return new FormGroup({
      ProductName: new FormControl('', []),
      ProductPrice: new FormControl('', []),
      ProductQuntity: new FormControl('', [])
    })
  }

  addOption() {
    alert(1)
    this.Products.push(this.CreateProductGroup())
    this.subtotal();
  }

  DeleteOption(index: number) {
    if (this.Products.length > 1) {
      this.Products.removeAt(index)

    }
    this.subtotal();
  }

  calculateTotal(index: number) {
    const Product = this.Products.at(index);
    const total = Product.get("ProductPrice")?.value * Product.get("ProductQuntity")?.value


    return total;
  }

  TotalAMount = 0

  subtotal(): any {
    let subtotal = 0;
    for (let i = 0; i < this.form.controls.Products.length; i++) {
      let product = this.form.controls.Products.controls[i];
      subtotal += +(product.controls.ProductPrice.value || 0) * +(product.controls.ProductQuntity.value || 0)
    }

    this.TotalAMount = subtotal;
  }

  discountvalue() {
    this.subtotal();

    const subDiscount = this.Discount?.value / 100 * this.TotalAMount
    return subDiscount
  }

  Rate = 18

  TaxTotal() {
    let tak = 0
    tak += this.TotalAMount * 0.18
    if (this.TotalAMount - this.discountvalue() === 0) {
      return 0
    }
    return tak
  }

  grandtotal() {
    let grandtotal = 0
    grandtotal += this.TotalAMount - this.discountvalue() + this.TaxTotal()
    if (this.TotalAMount - this.discountvalue() === 0) {
      grandtotal = 0
      return grandtotal
    }
    return grandtotal
  }


//   pdf create part
  invoice: Invoice;

  constructor() {
    this.invoice = new Invoice();
  }

  public saveInvoice() {

    const doc = new jsPDF();
    autoTable(doc, {
      body: [
        [
          {
            content: 'VAIBHAV BILL',
            styles: {
              halign: 'left',
              fontSize: 20,
              textColor: '#ffffff'
            }
          },
          {
            content: 'Invoice',
            styles: {
              halign: 'right',
              fontSize: 20,
              textColor: '#ffffff'
            }
          }
        ],
      ],
      theme: 'plain',
      styles: {
        fillColor: '#3366ff'
      }
    });

    autoTable(doc, {
      body: [
        [
          {
            content: 'Reference: #INV0001'
              + '\nDate: 2022-01-27'
              + '\nInvoice number: 123456',
            styles: {
              halign: 'right'
            }
          }
        ],
      ],
      theme: 'plain'
    });

    autoTable(doc, {
      body: [
        [
          {
            content: 'Billed to:'
              +   `Name:\n${this.invoice.Name}`
              + `Name:\n${this.invoice.Email}`
              + `Contact:\n${this.invoice.Contact}`
              + `Address:\n${this.invoice.Address}`
              ,
            styles: {
              halign: 'left'
            }
          },
          {
            content: 'Shipping address:'
              + '\nVaibhav Bhanderi'
              + '\n Rajkot,Gujarat '
              + '\n New Radhika Hostel MavdiChock  '
              + '\n360004'
              + '\nIndia',
            styles: {
              halign: 'left'
            }
          },
          {
            content: 'From:'
              + '\nGhanshyam Digital LLP '
              + '\n107,21st century business centre, Ring Rd,'
              + '\n nr. World trade centre, Surat'
              + '\nGujarat 395002'
              + '\nIndia',
            styles: {
              halign: 'right'
            }
          }
        ],
      ],
      theme: 'plain'
    });

    autoTable(doc, {
      body: [
        [
          {
            content: 'Amount due:',
            styles: {
              halign: 'right',
              fontSize: 14
            }
          }
        ],
        [
          {
            content: `${this.invoice.grandtotal}`,
            styles: {
              halign: 'right',
              fontSize: 20,
              textColor: '#3366ff'
            }
          }
        ],
        [
          {
            content: 'Due date: 2022-02-01',
            styles: {
              halign: 'right'
            }
          }
        ]
      ],
      theme: 'plain'
    });

    autoTable(doc, {
      body: [
        [
          {
            content: 'Products & Services',
            styles: {
              halign: 'left',
              fontSize: 14
            }
          }
        ]
      ],
      theme: 'plain'
    });

    autoTable(doc, {
      head: [['Items', 'Category', 'Quantity', 'Price', 'Tax', 'Amount']],
      body: [
        ['Product or service name', 'Category', '2', '$450', '$50', '$1000'],
        ['Product or service name', 'Category', '2', '$450', '$50', '$1000'],
        ['Product or service name', 'Category', '2', '$450', '$50', '$1000'],
        ['Product or service name', 'Category', '2', '$450', '$50', '$1000']
      ],
      theme: 'striped',
      headStyles: {
        fillColor: '#343a40'
      }
    });

    autoTable(doc, {
      body: [
        [
          {
            content: 'Subtotal:',
            styles: {
              halign: 'right'
            }
          },
          {
            content: '$3600',
            styles: {
              halign: 'right'
            }
          },
        ],
        [
          {
            content: 'Total tax:',
            styles: {
              halign: 'right'
            }
          },
          {
            content: '$400',
            styles: {
              halign: 'right'
            }
          },
        ],
        [
          {
            content: 'Total amount:',
            styles: {
              halign: 'right'
            }
          },
          {
            content: '$4000',
            styles: {
              halign: 'right'
            }
          },
        ],
      ],
      theme: 'plain'
    });

    autoTable(doc, {
      body: [
        [
          {
            content: 'Terms & notes',
            styles: {
              halign: 'left',
              fontSize: 14
            }
          }
        ],
        [
          {
            content: 'orem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia'
              + 'molestiae quas vel sint commodi repudiandae consequuntur voluptatum laborum'
              + 'numquam blanditiis harum quisquam eius sed odit fugiat iusto fuga praesentium',
            styles: {
              halign: 'left'
            }
          }
        ],
      ],
      theme: "plain"
    });

    autoTable(doc, {
      body: [
        [
          {
            content: 'This is a centered footer',
            styles: {
              halign: 'center'
            }
          }
        ]
      ],
      theme: "plain"
    });

    return doc.save("invoice");

  }


}

