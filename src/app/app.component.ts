import {Component} from '@angular/core';
import {FormArray, FormControl, FormGroup, FormGroupDirective, Validators} from "@angular/forms"
import * as pdfMake from 'pdfmake/build/pdfmake';
import *as pdfFonts from 'pdfmake/build/vfs_fonts';

class Product{
  ProductName: string='';
  ProductPrice: number=0;
  ProductQuntity: number=0;
}
class Invoice{
  Name: string='';
  Email: string='';
  Address: number=0;
  Contact: string='';

  Products: Product[] = [];


  constructor(){
    // Initially one empty product row we will show
    (window as any).pdfMake.vfs = pdfFonts.pdfMake.vfs;
    this.Products.push(new Product());
  }
}

@Component({
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
    alert(0)
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

  invoice = new Invoice();



  pdfContent:any = {
    content: [
      {
        text: 'ELECTRONIC SHOP',
        fontSize: 16,
        alignment: 'center',
        color: '#047886'
      },
      {
        text: 'INVOICE',
        fontSize: 20,
        bold: true,
        alignment: 'center',
        decoration: 'underline',
        color: 'skyblue'
      },
      {
        text: 'Customer Details',
        style: 'sectionHeader'
      },
      {
        columns: [
          [
            {
              text: this.invoice.Name,
              bold: true
            },
            {text: this.invoice.Address},
            {text: this.invoice.Email},
            {text: this.invoice.Contact}
          ],
          [
            {
              text: `Date: ${new Date().toLocaleString()}`,
              alignment: 'right'
            },
            {
              text: `Bill No : ${((Math.random() * 1000).toFixed(0))}`,
              alignment: 'right'
            }
          ]
        ]
      },
      {
        text: 'Order Details',
        style: 'sectionHeader'
      },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto'],
          body: [
            ['Product', 'Price', 'Quantity', 'Amount'],
            ...this.invoice.Products.map(p => ([p.ProductName, p.ProductPrice, p.ProductQuntity, (p.ProductPrice * p.ProductQuntity).toFixed(2)])),
            [{
              text: 'Total Amount',
              colSpan: 3
            }, {}, {}, this.invoice.Products.reduce((sum, p) => sum + (p.ProductQuntity * p.ProductPrice), 0).toFixed(2)]
          ]
        }
      },
      // {
      //   text: 'Additional Details',
      //   style: 'sectionHeader'
      // },
      // {
      //   text: this.invoice.Name,
      //   margin: [0, 0, 0, 15]
      // },
      // {
      //   columns: [
      //     [{qr: `${this.invoice.Name}`, fit: '50'}],
      //     [{text: 'Signature', alignment: 'right', italics: true}],
      //   ]
      // },
      {
        text: 'Terms and Conditions',
        style: 'sectionHeader'
      },
      {
        ul: [
          'Order can be return in max 10 days.',
          'Warrenty of the product will be subject to the manufacturer terms and conditions.',
          'This is system generated invoice.',
        ],
      }
    ],
    styles: {
      sectionHeader: {
        bold: true,
        decoration: 'underline',
        fontSize: 14,
        margin: [0, 15, 0, 15]
      }
    }
  };


    // else if(action === 'print'){
    //   pdfMake.createPdf(docDefinition).print();
    // }else{
    //   pdfMake.createPdf(docDefinition).open();
    // }

  function1(){
    let pdf = pdfMake.createPdf(this.pdfContent);
    pdf.download();

  }


}
