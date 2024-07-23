/* eslint-disable @typescript-eslint/no-var-requires */
/*
For connecting you need to add all env variables to your application using .env

BACKEND_API = api for connecting to nestjs with port
MAP_STYLE_API = api for connecting to mapbox with style
MAP_STYLE_JSON = api for connecting to mapbox with style json

JWT_TOKEN = token for signing
MONGO_URI = mongodb uri
GOOGLE_PLACES_API = google places api
MAILER_USER = email for sending emails
MAILER_PASS = password for sending emails - you need to create a app password it is older then normal password ( Security Settings ) you need to have 2FA
*/

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
    GOOGLE_PLACES_API: '${process.env["GOOGLE_PLACES_API"] || ''}',
    MAILER_USER: '${process.env["MAILER_USER"] || ''}',
    MAILER_PASS: '${process.env["MAILER_PASS"] || ''}',
  };
  `;
  console.log(
    colors.magenta(
      'The file `environment.ts` will be written with the following content: \n'
    )
  );
  writeFile(ClientSide, envConfigFileClient, (err: string) => {
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
  writeFile(BackendSide, envConfigFileBackend, (err: string) => {
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
