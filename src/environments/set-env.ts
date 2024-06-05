const setEnv = () => {
  const fs = require('fs');
  const writeFile = fs.writeFile;

  const ClientSide = './src/environments/environment.ts';
  const BackendSide = './backend/src/environments/environment.ts';

  const colors = require('colors');
  require('dotenv').config({
    path: 'src/environments/.env',
  });
  // `environment.ts` file structure
  const envConfigFileClient = `export const environment = {
    BACKEND_API: '${process.env["BACKEND_API"] || ''}',
    MAP_STYLE_API: '${process.env["MAP_STYLE_API"] || ''}',
    MAP_STYLE_JSON: '${process.env["MAP_STYLE_JSON"] || ''}',
  };
  `;

  const envConfigFileBackend = `export const environment = {
    JWT_TOKEN: '${process.env["JWT_TOKEN"] || ''}',
    MONGO_URI: '${process.env["MONGO_URI"] || ''}',
  };
  `;
  console.log(
    colors.magenta(
      'The file `environment.ts` will be written with the following content: \n'
    )
  );
  writeFile(ClientSide, envConfigFileClient, (err: any) => {
    if (err) {
      console.error(err);
      throw err;
    } else {
      console.log(
        colors.magenta(
          `Angular environment.ts file generated correctly at ${ClientSide} \n`
        )
      );
    }
  });
  writeFile(BackendSide, envConfigFileBackend, (err: any) => {
    if (err) {
      console.error(err);
      throw err;
    } else {
      console.log(
        colors.magenta(
          `NestJS environment.ts file generated correctly at ${BackendSide} \n`
        )
      );
    }
  });
};

setEnv();
