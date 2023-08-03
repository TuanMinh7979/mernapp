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
    } catch (err: any) {
      console.log("_________________________________LOG PARSE JSON ", prop);

      return prop;
    }
  }

  static isDataURL(value: string): boolean {
    const dataUrlRegex =
      /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\\/?%\s]*)\s*$/i;
    return dataUrlRegex.test(value);
  }

  static shuffle(list: string[]): string[] {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }

  static escapeRegex(text: string): string {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  }
}
