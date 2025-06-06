

export class Product {
  constructor(
    public id: string,
    public name: string,
    public price: number,
    public description: string = "",
    public available: boolean = true,
    public qty: number = 0
  ) {}
}
