
export class TypeaheadMatch {

  public constructor(readonly item:any, readonly value:string = item, private header:boolean = false) {
  }

  public isHeader():boolean {
    return this.header;
  }

  public toString():string {
    return this.value;
  }
}
