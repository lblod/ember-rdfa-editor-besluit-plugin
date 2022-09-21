import InsertArticleCommand from './commands/insert-article-command';
import InsertTitleCommand from './commands/insert-title-command';
import MoveArticleCommand from './commands/move-article-command';
import RecalculateArticleNumbersCommand from './commands/recalculate-article-numbers-command';
/**
 * Entry point for BesluitPlugin
 *
 * @module ember-rdfa-editor-besluit-plugin
 * @class BesluitPlugin
 * @constructor
 * @extends EmberService
 */
export default class BesluitPlugin {
  /**
   * Handles the incoming events from the editor dispatcher.  Responsible for generating hint cards.
   *
   * @method execute
   *
   * @param {string} hrId Unique identifier of the state in the HintsRegistry.  Allows the
   * HintsRegistry to update absolute selected regions based on what a user has entered in between.
   * @param {Array} rdfaBlocks Set of logical blobs of content which may have changed.  Each blob is
   * either has a different semantic meaning, or is logically separated (eg: a separate list item).
   * @param {Object} hintsRegistry Keeps track of where hints are positioned in the editor.
   * @param {Object} editor Your public interface through which you can alter the document.
   *
   * @public
   */
  controller;

  get name() {
    return 'besluit';
  }

  initialize(controller) {
    this.controller = controller;
    this.controller.perform((tr) => {
      tr.registerCommand('insertArticle', new InsertArticleCommand());
      tr.registerCommand('insertTitle', new InsertTitleCommand());
      tr.registerCommand('moveArticle', new MoveArticleCommand());
      tr.registerCommand(
        'recalculateArticleNumbers',
        new RecalculateArticleNumbersCommand()
      );
    });
    controller.registerWidget({
      componentName: 'besluit-plugin-card',
      identifier: 'besluit-plugin/card',
      desiredLocation: 'insertSidebar',
    });
    controller.registerWidget({
      componentName: 'besluit-context-card',
      identifier: 'besluit-context-plugin/card',
      desiredLocation: 'sidebar',
    });
  }
}
