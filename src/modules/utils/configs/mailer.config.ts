import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as path from 'path';

const EMAIL = process.env.MAILER_EMAIL;
const PASSWORD = process.env.MAILER_PASSWORD;
const DOMAIN = process.env.MAILER_DOMAIN;

const templatesDir = path.join(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  'modules',
  'utils',
  'templates',
);

export const mailerConfig: MailerOptions = {
  template: {
    dir: templatesDir,
    adapter: new HandlebarsAdapter(),
    options: {
      extName: '.hbs',
      layoutsDir: path.resolve(__dirname, '..', 'templates'),
    },
  },
  transport: `smtps://${EMAIL}:${PASSWORD}@smtp.${DOMAIN}`,
};
