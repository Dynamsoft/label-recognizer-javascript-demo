import { CoreModule } from "dynamsoft-core";
import { CodeParserModule } from 'dynamsoft-code-parser';
import { LicenseManager } from "dynamsoft-license";

/** LICENSE ALERT - README
 * To use the library, you need to first specify a license key using the API "license" as shown below.
 */

LicenseManager.initLicense('YOUR LICENSE');  // if not entered, public trial is used by default

/**
 * You can contact Dynamsoft Support Team (https://www.dynamsoft.com/Company/Contact.aspx) to obtain a license.
 * LICENSE ALERT - THE END
 */

CoreModule.engineResourcePaths = {
    std: "https://cdn.jsdelivr.net/npm/dynamsoft-capture-vision-std@1.0.0/dist/",
    core: "https://cdn.jsdelivr.net/npm/dynamsoft-core@3.0.33/dist/",
    license: "https://cdn.jsdelivr.net/npm/dynamsoft-license@3.0.40/dist/",
    dcp: 'https://cdn.jsdelivr.net/npm/dynamsoft-code-parser@2.0.20/dist/'
}

CoreModule.loadWasm("dcp");

CodeParserModule.loadSpec("MRTD_TD1_ID");
CodeParserModule.loadSpec("MRTD_TD2_FRENCH_ID");
CodeParserModule.loadSpec("MRTD_TD2_ID");
CodeParserModule.loadSpec("MRTD_TD2_VISA");
CodeParserModule.loadSpec("MRTD_TD3_PASSPORT");
CodeParserModule.loadSpec("MRTD_TD3_VISA");
CodeParserModule.loadSpec("VIN");