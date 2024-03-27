export function formatModeName(str: string): string {
    if (str === 'vin') {
        return 'VIN (beta)'
    } else {
        return str.replace(str[0], str[0].toUpperCase())
    }
}

export function getDate(): string {
    const date = new Date();
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export function linkToDynamsoftHomePage(): void {
    const a = document.querySelector("a");
    a!.href = "https://www.dynamsoft.com/";
    a!.target = "_blank";
    a!.click();
}