#!/usr/bin/node

import { App } from '@wechot/core';
import cac from 'cac';

const cli = cac();

cli.command('start').action(() => {
  // eslint-disable-next-line no-new
  new App();
});

cli.parse();
