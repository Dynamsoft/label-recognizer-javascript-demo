# Dynamsoft JavaScript MRZ Scanner Demo

This repository contains the source code of the [web MRZ scanner online demo](https://demo.dynamsoft.com/label-recognizer-js/mrz-scanner.html) and [web VIN scanner online demo](https://demo.dynamsoft.com/label-recognizer-js/vin.html) which use the JavaScript Edition of [Dynamsoft Label Recognizer SDK](https://www.dynamsoft.com/label-recognition/overview/), an OCR SDK that reads alphanumeric characters and standard symbols from images of varying background colour, font, or text size.

> NOTE:
>
> This project includes a big part of UI-related source code for demoing purposes. 
>
> To create your own MRZ or VIN scanner application, you may start with the simple samples in the [Dynamsoft Label Recognizer JS samples repository](https://github.com/Dynamsoft/label-recognizer-javascript-samples).

## Preparation

Make sure you have [node](https://nodejs.org/), [yarn](https://yarnpkg.com/cli/install) and [Vue CLI](https://cli.vuejs.org/) installed. `node 14.16.0` , `yarn 1.22.10` and `@vue/cli 4.5.13` are used in the example below. 

## Run the project

1. Set up

    ```cmd
    npm install
    ```

2. Add license

    A default license is included which allows you to test the demo for up to 24 hours. You can [request a trial license](https://www.dynamsoft.com/customer/license/trialLicense?product=dlr) via Dynamsoft customer portal to evaluate further.

    Open `src/dlr.ts` and input your license key in this line:

    ```ts
    LabelRecognizer.license = 'YOUR LICENSE';
    ```

    Open `src/dcp.ts` and input your license key in this line:
    
    ```ts
    LicenseManager.initLicense('YOUR LICENSE');
    ```

3. Compiles and hot-reloads for development

    ```cmd
    npm run serve
    ```

## Contact Us

If you have any questions with these samples, feel free to submit an issue or [contact us](https://www.dynamsoft.com/company/contact/).