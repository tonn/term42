'use babel';

import Term42View from './term42-view';
import { CompositeDisposable } from 'atom';
import * as os from 'os';
import { Pty } from './pty';

export default {

  term42View: null,
  modalPanel: null,
  subscriptions: null,
  dockItem: null,

  activate(state) {
    this.term42View = new Term42View(state.term42ViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.term42View.getElement(),
      visible: false
    });

    this.dockItem = {
      element: this.term42View.getElement(),
      getTitle: () => 'My Awesome Item',
      getURI: () => 'atom://my-package/my-item',
      getDefaultLocation: () => 'bottom'
    };

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'term42:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.term42View.destroy();
    this.dockItem.destroy();
  },

  serialize() {
    return {
      term42ViewState: this.term42View.serialize()
    };
  },

  toggle() {
    console.log('Term42 was toggled!');
    atom.workspace.open(this.dockItem).then(() => {
      this.term42View.init();
    });
  },

  initPty() {
    const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

    this.pty = new Pty(process.env.HOME, shell);
  }
};
