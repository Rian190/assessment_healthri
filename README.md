
## For local testing

This project assumes nodejs is installed on the computer. I have developed and tested on node 23.11.1 on Ubuntu 24.04

## Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd healthri
1. `npm install`
1. `chmod +x cli.js`

### Success:
1. `node cli.js validate examples/valid_dcat-ap.ttl -t v3.Full1 -d dcat-ap`
1. `node cli.js validate examples/valid_healthri.ttl -t v2.0.0 -d healthri`

### Failure
1. `node cli.js validate examples/invalid_healthri.ttl -t v2.0.0 -d healthri`
1. `node cli.js validate examples/invalid_dcat-ap.ttl -t v3.Full1 -d dcat-ap`


## Considerations I made
- I used axios over fetch because this provides a more developer friendly api
- I used commander over other CLI tools because it is the most used. And it provides a better developer experience
- Using a cdn for importing dependencies doesn't natively work in node. Therefore I used npm to install the dependencies
- I have not assumed the OS of the user. Because we can have many users with all their own preferences I choice for a project which can run on most Linux, Windows and MacOs computers. 

### Shipping

This project is intended to be used by the UMC. We don't want to concern the user with developer logic like `npm install`. 

To prevent this, the project could be build with `esbuild` and then packed with a tool like `pkg`. This way we only ship one file which contains all needed to be run on most OS.

## Testing

First of all, the most important validation logic is part of an external API. I'm convinced we should not test the world. Therefore I will go with the assumption the SHACL Validator REST API is functioning correctly.

I would propose the following test-layers:

## 1. Unit tests
Given the size of this project I would omit unit tests if favour of black-box testing. This will also tell us if the project is working as expected and allows for more flexibility when it comes to which OS to run on.



## 2. Black box test
A testsuite running the code with a specific file as input asuming a certain output will give us the confidence we need this code works!

I would write a number of tests for the example files. They should cover all basic scenario's. 

In addition I would add a few a number of edge cases. 
- Missing file
- Large file
- Empty file
- File encoding issues. What if the files are not UTF8 encoded?
- Special characters like umlaut or accents
- No internet connection

## 3. Run the tests again after build
Because we don't know which OS we will be shipping to, I would prefer to run the tests in the pipeline again on different operating systems before making the final release.

The pipeline would look like:
build -> test -> release/deploy

The following example is writen in some psuedo code outlines
### Build
 - `npm install`
 - `npx esbuild cli.js --bundle --platform=node --outfile=cli-bundled.js`
 - `npx pkg cli-bundled.js --targets node18-linux-x64,node18-macos-x64,node18-win-x64 --output validate-dataset`

### Test
- Run test on each OS
- This validates it is working regardless the OS

### release/deploy
When the tests succeed we can publish the new version! As the package will be used on the users computer, I would suggest the package to be published on a nice spot where the user can download the latests version. 
 
