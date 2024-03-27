import { ParsedResultItem } from "dynamsoft-code-parser";

const handleMrzParseResult = (result: ParsedResultItem) => {
    const parseResultInfo: any = {};
    if (!(result as any).exception) {
        let type = result.getFieldValue("documentCode");
        parseResultInfo['Document Type :'] = JSON.parse(result.jsonString).CodeType;
        let nation = result.getFieldValue("issuingState");
        parseResultInfo['Issuing State :'] = nation;
        let surName = result.getFieldValue("primaryIdentifier");
        parseResultInfo['Surname :'] = surName;
        let givenName = result.getFieldValue("secondaryIdentifier");
        parseResultInfo['Given Name :'] = givenName;
        let passportNumber = type === "P" ? result.getFieldValue("passportNumber") : result.getFieldValue("documentNumber");
        parseResultInfo['Passport Number :'] = passportNumber;
        let nationality = result.getFieldValue("nationality");
        parseResultInfo['Nationality :'] = nationality;
        let gender = result.getFieldValue("sex");
        parseResultInfo["Gender :"] = gender;
        let birthYear = result.getFieldValue("birthYear");
        let birthMonth = result.getFieldValue("birthMonth");
        let birthDay = result.getFieldValue("birthDay");
        if (parseInt(birthYear) > (new Date().getFullYear() % 100)) {
            birthYear = "19" + birthYear;
        } else {
            birthYear = "20" + birthYear;
        }
        parseResultInfo['Date of Birth (YYYY-MM-DD) :'] = birthYear + "-" + birthMonth + "-" + birthDay
        let expiryYear = result.getFieldValue("expiryYear");
        let expiryMonth = result.getFieldValue("expiryMonth");
        let expiryDay = result.getFieldValue("expiryDay");
        if (parseInt(expiryYear) >= 60) {
            expiryYear = "19" + expiryYear;
        } else {
            expiryYear = "20" + expiryYear;
        }
        parseResultInfo["Date of Expiry (YYYY-MM-DD) :"] = expiryYear + "-" + expiryMonth + "-" + expiryDay;
    }
    return parseResultInfo;
}

const handleVinParseResult = (result: ParsedResultItem) => {
    const parseResultInfo: any = {};
    if (!(result as any).exception) {
        let region = result.getFieldValue("region");
        parseResultInfo['Region :'] = region;
        let checkDigit = result.getFieldValue("checkDigit");
        parseResultInfo['Check Digit :'] = checkDigit;
        let modelYear = result.getFieldValue("modelYear");
        parseResultInfo['Model Year :'] = modelYear;
        let plantCode = result.getFieldValue("plantCode");
        parseResultInfo['Plant Code :'] = plantCode;
        let vis = result.getFieldValue("VIS");
        parseResultInfo['VIS :'] = vis;
    }
    return parseResultInfo;
}

export function handleParseReuslt(result: ParsedResultItem, type: string) {
    return type === "mrz" ? handleMrzParseResult(result) : handleVinParseResult(result);
}