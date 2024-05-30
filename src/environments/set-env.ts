const setEnv = () => {
    const fs = require('fs');
    const writeFile = fs.writeFile;

    const targetPath = './src/environments/environment.ts';

    const colors = require('colors');
    const appVersion = require('../../package.json').version;
    require('dotenv').config({
      path: 'src/environments/.env'
    });
  // `environment.ts` file structure
    const envConfigFile = `export const environment = {
    jwtToken: '${process.env["JWT_TOKEN"]}',
    appVersion: '${appVersion}',
    production: true,
  };
  `;
    console.log(colors.magenta('The file `environment.ts` will be written with the following content: \n'));
    writeFile(targetPath, envConfigFile, (err: any) => {
      if (err) {
        console.error(err);
        throw err;
      } else {
        console.log(colors.magenta(`Angular environment.ts file generated correctly at ${targetPath} \n`));
      }
    });
  };
  
  setEnv();
  