# Dynamsoft Label Recognizer JavaScript Edition Demo

This repository contains the source code for the demo of Dynamsoft Label Recognizer JavaScript Edition (DLRJS). You can try out the demo from this link:
https://demo.dynamsoft.com/label-recognizer-js/mrz-scanner.html

> NOTE
>
> A big part of the source code is dedicated to making a better UI or creating better user experience for demoing purposes, which might be distracting if you intend to learn about the SDK and its basic usage.
>
> We recommend that you try out the samples in the DLRJS samples repository https://github.com/Dynamsoft/label-recognizer-javascript-samples. 
>
> The demo itself is based on Vue, you can find a simple Vue sample at https://github.com/Dynamsoft/label-recognizer-javascript-samples/tree/main/1.hello-world/5.read-video-vue.

If you would like to get this demo project running, you can follow the steps below:

## Try the project

1. Set up

    ```cmd
    yarn install
    ```

2. Add a license key

    Open "dlr.ts" and input your license key in this line:

    ```ts
    LabelRecognizer.license = 'YOUR LICENSE';
    ```

3. Compiles and hot-reloads for development

    ```cmd
    yarn serve
    ```

4. Compiles and minifies for production

    ```cmd
    yarn build
    ```

## Contact Us

If you have any questions with these samples, feel free to submit an issue or [contact us](https://www.dynamsoft.com/company/contact/).