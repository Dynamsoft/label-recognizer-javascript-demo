import { LabelRecognizer } from "dynamsoft-label-recognizer";

LabelRecognizer.engineResourcePath = "https://cdn.jsdelivr.net/npm/dynamsoft-label-recognizer@2.2.31/dist/";

/** LICENSE ALERT - README
 * To use the library, you need to first specify a license key using the API "license" as shown below.
 */

LabelRecognizer.license = "YOUR LICENSE"; // if not entered, public trial is used by default

/**
 * You can contact Dynamsoft Support Team (https://www.dynamsoft.com/Company/Contact.aspx) to obtain a license.
 * LICENSE ALERT - THE END
 */

LabelRecognizer.loadWasm();