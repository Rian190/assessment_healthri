#!/usr/bin/env node

import { program, Option } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

program
  .name('validate-dataset')
  .description('Validate dataset metadata files to ensure they meet catalog standards')
  .version('1.0.0');

program
  .command('validate')
  .alias('v')
  .description('Validate a dataset metadata file')
  .argument('<file>', 'Path to the metadata file to validate')
  .addOption(new Option('-t, --type <type>', 'Validation profile type')
    .default('v2.0.0').choices(['v2.0.0', 'v3.Full1', 'v3.0.1.Full1']))
  .addOption(new Option('-d, --domain <domain>', 'Validation domain')
    .default('healthri').choices(['healthri', 'dcat-ap']))
  .action(async (file, options) => {
    
    console.log(chalk.blue('🔍 Validating dataset metadata...'));
    console.log(chalk.gray(`File: ${file}`));
    console.log(chalk.gray(`Profile: ${options.domain}/${options.type}`));
    console.log('');


    const apiUrl = `https://www.itb.ec.europa.eu/shacl/${options.domain}/api/validate`;
    const filePath = path.isAbsolute(file) ? file : path.resolve(process.cwd(), file);
    
    if (!fs.existsSync(filePath)) {
        console.log(chalk.red('File not found: ' + filePath));
        process.exit(1);
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');


    const payload = {
        "contentToValidate": fileContent,
        "contentSyntax": "text/turtle",
        "validationType": options.type
    }

    const response = await axios.post(apiUrl, payload, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
      },
    })

    if(response.data.result === 'SUCCESS') {
      console.log(chalk.green('✅ Validation passed! Your dataset metadata meets the required standards.'));
        process.exit(0)
        
    }

    if(response.data.result === 'FAILURE') {
      console.log(chalk.red('❌ Validation failed. Your dataset metadata has issues that need to be addressed.'));
      console.log('🔧 Issues found:');
        if (response.data.reports.error && response.data.reports.error.length > 0) {
            response.data.reports.error.forEach((error, index) => {
                console.log(chalk.red(`  ${index + 1}. ${JSON.stringify(error)}`));
            });
        }
        process.exit(1)
    }


    // something must have gone wrong
    console.log(chalk.yellow('⚠️  Validation completed with unexpected result.'));
    console.log('Response:', response.data);
    process.exit(1);

    
  });

program
  .command('info')
  .alias('i')
  .description('Show information about validation profiles and domains')
  .action(() => {
    console.log(chalk.blue('📚 Available Validation Profiles:\n'));
    
    console.log(chalk.yellow('Domains:'));
    console.log('  • healthri - For health research data catalogs');
    console.log('  • dcat-ap  - For general European data catalogs\n');
    
    console.log(chalk.yellow('Types:'));
    console.log('  • v2.0.0      - HealthRI profile version 2.0.0');
    console.log('  • v3.Full1    - DCAT-AP profile version 3 Full Level 1');
    console.log('  • v3.0.1.Full1- DCAT-AP profile version 3.0.1 Full\n');

  });

// Handle unknown commands
program.on('command:*', () => {
  console.error(chalk.red('Invalid command. Use --help to see available commands.'));
  process.exit(1);
});


program.parse();




