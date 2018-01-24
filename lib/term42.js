'use babel';

import Term42View from './term42-view';
import { CompositeDisposable } from 'atom';

export default {
  subscriptions: null,
  terms: [],

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'term42:new': () => this.newTerm()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
    this.terms.forEach(term => term.destroy());
  },

  serialize() {
    return { };
  },

  newTerm() {
    this.terms.push(new Term42View());
  },
};
