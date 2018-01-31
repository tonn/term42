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
    const that = this;

    that.element = document.createElement('div');
    that.element.classList.add('term42');

    that.dockItem = {
      element: that.element,
      getTitle: () => 'term42',
      getURI: () => 'atom://term42/my-item',
      getDefaultLocation: () => 'bottom'
    };

    const homePath = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
    let projectPath;

    const editor = atom.workspace.getActiveTextEditor(); // do before atom.workspace.open

    if (editor) {
      const filePath = editor.getPath();

      if (filePath) {
        const projectsPaths = atom.project.getPaths();

        projectPath = projectsPaths.find(p => filePath.startsWith(p));
      }
    }

    this.cwd = projectPath || homePath;

    atom.workspace.open(that.dockItem).then(() => {
      that.init();

      atom.workspace.onDidDestroyPaneItem(event => {
        if (event.item === that.dockItem) {
          that.term.destroy();
          that.ptyProcess.destroy();
        }
      });
    });
  }

  init() {
    const term = this.term = new Terminal();
    term.open(this.element);
    term.fit();
    term.focus();

    new ResizeObserver(() => {
      term.fit();
    }).observe(this.element);

    const ptyProcess = this.ptyProcess = pty.fork('powershell.exe', [], { cwd: this.cwd, env: process.env, name: 'term42' });

    this.ptyProcess.on('data', data => term.write(data));

    term.on('key', function (key, ev) {
      ptyProcess.write(key);
    });

    term.on('paste', function (data, ev) {
      this.ptyProcess.write(data);
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
