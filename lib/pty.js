'use babel';

import * as pty from 'pty.js';

export class Pty {
  constructor(pwd, command, args) {
    this.ptyProcess = pty.fork(command, args, { cwd: pwd, env: process.env, name: 'term42' });

    this.ptyProcess.on('data', data => emit('term42:data', data));

    process.on('message', ({ event, cols, rows, text } = {}) => {
      if (event === 'input')
        this.ptyProcess.write(text);
    });
  }
}
