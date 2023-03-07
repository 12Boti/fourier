export class Complex {
    re: number;
    im: number;
    constructor(a: number, b: number) {
      this.re = a;
      this.im = b;
    }
  
    static add(a : Complex, b : Complex) {
  
      return(new Complex(a.re+b.re, a.im + b.im));
    }
  
    static mult(a : Complex, b : Complex) {
      return new Complex(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
    }

    modulus() {
      return Math.sqrt(this.re * this.re + this.im * this.im);
    }

    argument(){
      return  Math.atan2(this.im, this.re);
    }
  }