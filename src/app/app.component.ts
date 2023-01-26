import { Component } from '@angular/core';
import {FormArray,  FormControl, FormGroup, FormGroupDirective} from "@angular/forms";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Invoice';
  total=0;
  Discount: any = [5, 10, 15, 20];
  form=new FormGroup({
    Name:new FormControl('',[]),
    Email:new FormControl('',[]),
    Address:new FormControl('',[]),
    Contact:new FormControl('',[]),
    Products:new FormArray([
      new FormGroup({
        ProductName:new FormControl('',[]),
        ProductPrice:new FormControl('',[]),
        ProductQuntity:new FormControl('',[])
      })
    ])
  })

  changeDISCOUNT(e: any) {
    this.Discount?.setValue(e.target.value, {
      onlySelf: true,
    });
  }



  submit(form: FormGroupDirective) {
    if (form.valid) {
      console.warn(JSON.stringify(form.value))
    }
  }
  get Products() {
    return this.form.get('Products') as FormArray
  }
  CreateProductGroup(){
    return  new FormGroup({
      ProductName:new FormControl('',[]),
      ProductPrice:new FormControl('',[]),
      ProductQuntity:new FormControl('',[])
    })
  }
  addOption(){
    this.Products.push(this.CreateProductGroup())
  }
  DeleteOption(index:number){
    if(this.Products.length>1){
      this.Products.removeAt(index)

    }

  }
  calculateTotal(index: number) {
    const Product = this.Products.at(index);
    const total =Product.get("ProductPrice")?.value* Product.get("ProductQuntity")?.value
    return total;
  }

}
