'use babel';

import { Terminal } from 'xterm';
import * as attach from 'xterm/dist/addons/attach/attach';
import * as fit from 'xterm/dist/addons/fit/fit';
import * as fullscreen from 'xterm/dist/addons/fullscreen/fullscreen';
import * as search from 'xterm/dist/addons/search/search';
import * as winptyCompat from 'xterm/dist/addons/winptyCompat/winptyCompat';
import * as pty from 'pty.js';

Terminal.applyAddon(attach);
Terminal.applyAddon(fit);
Terminal.applyAddon(fullscreen);
Terminal.applyAddon(search);
Terminal.applyAddon(winptyCompat);

export default class Term42View {
  constructor(serializedState) {
    this.element = document.createElement('div');
    this.element.classList.add('term42');
  }

  init() {
    const term = this.term = new Terminal();
    term.open(this.element);
    term.fit();
    term.focus();

    this.element.addEventListener('resize', () => {
      term.fit();
    });

    const home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];

    const ptyProcess = this.ptyProcess = pty.fork('powershell.exe', [], { cwd: home, env: process.env, name: 'term42' });

    this.ptyProcess.on('data', data => term.write(data));

    term.on('key', function (key, ev) {
      var printable = (
        !ev.altKey && !ev.altGraphKey && !ev.ctrlKey && !ev.metaKey
      );

      if (ev.keyCode == 13) {
        ptyProcess.write('\r');
      } else if (ev.keyCode == 8) {
        ptyProcess.write('\b');
      } else if (printable) {
        ptyProcess.write(key);
      } else {
        ptyProcess.write(key);
      }
    });

    term.on('paste', function (data, ev) {
      this.ptyProcess.write(data);
    });


    process.on('message', ({ event, cols, rows, text } = {}) => {
      if (event === 'input')
        this.ptyProcess.write(text);
    });
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  write(data) {
    const term = this.term;

    term.write(data);
  }
}
