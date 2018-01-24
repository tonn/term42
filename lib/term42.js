'use babel';

import Term42View from './term42-view';
import { CompositeDisposable } from 'atom';

export default {
  term42View: null,
  subscriptions: null,
  dockItem: null,

  activate(state) {
    this.term42View = new Term42View(state.term42ViewState);

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
      'term42:new': () => this.newTerm()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
    this.term42View.destroy();
    this.dockItem.destroy();
  },

  serialize() {
    return {
      term42ViewState: this.term42View.serialize()
    };
  },

  newTerm() {
    atom.workspace.open(this.dockItem).then(() => {
      this.term42View.init();
    });
  },
};
