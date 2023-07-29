export class Helpers {
  static firstLetterUppercase(str: string): string {
    const valueString = str.toLowerCase();
    return valueString.charAt(0).toUpperCase() + valueString.slice(1);
  }

  static generateRandomIntegers(integerLength: number): number {
    const characters = "0123456789";
    let result = " ";
    const charactersLength = characters.length;
    for (let i = 0; i < integerLength; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return parseInt(result, 10);
  }

  static parseJson(prop: string): any {
    try {
      return JSON.parse(prop);
    } catch (err:any) {
      console.log("_________________________________LOG PARSE JSON ", prop);
      
      return prop;
    }
  }
}
