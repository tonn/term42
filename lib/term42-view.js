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
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('term42');

    // Create message element
    // const message = document.createElement('div');
    // message.textContent = 'The Term42 package is Alive! It\'s ALIVE!';
    // message.classList.add('message');
    // this.element.appendChild(message);
  }

  init() {
    const term = this.term = new Terminal();
    term.open(this.element);
    term.winptyCompatInit();
    term.fit();
    term.focus();
    //this.runFakeTerminal();

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

  runFakeTerminal() {
    const term = this.term;

    if (term._initialized) {
      return;
    }

    term._initialized = true;

    var shellprompt = '$ ';

    term.prompt = function () {
      term.write('\r\n' + shellprompt);
    };

    term.writeln('Welcome to xterm.js');
    term.writeln('This is a local terminal emulation, without a real terminal in the back-end.');
    term.writeln('Type some keys and commands to play around.');
    term.writeln('');
    term.prompt();

    term.on('key', function (key, ev) {
      var printable = (
        !ev.altKey && !ev.altGraphKey && !ev.ctrlKey && !ev.metaKey
      );

      if (ev.keyCode == 13) {
        term.prompt();
      } else if (ev.keyCode == 8) {
       // Do not delete the prompt
        if (term.x > 2) {
          term.write('\b \b');
        }
      } else if (printable) {
        term.write(key);
      }
    });

    term.on('paste', function (data, ev) {
      term.write(data);
    });
  }

  attach() {

  }

  write(data) {
    const term = this.term;

    term.write(data);
  }
}
