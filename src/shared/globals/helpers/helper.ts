export class Helpers {
    static firstLetterUppercase(str: string): string {

        const valueString = str.toLowerCase();
        return valueString.charAt(0).toUpperCase() + valueString.slice(1);
        
    }
}