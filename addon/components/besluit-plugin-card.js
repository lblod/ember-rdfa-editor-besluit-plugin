import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { getTitleForDecision } from '../utils/get-title-for-decision';

export default class EditorPluginsTemplateVariableCardComponent extends Component {
  @tracked hasTitle = true;
  @tracked disableArticleInsert = true;

  constructor() {
    super(...arguments);
    this.args.controller.addTransactionStepListener(
      this.onTransactionStepUpdate
    );
  }

  @action
  insertArticle() {
    this.args.controller.perform((tr) => {
      tr.commands.insertArticle({});
    });
  }

  @action
  insertTitle() {
    this.args.controller.perform((tr) => {
      tr.commands.insertTitle({});
    });
  }

  modifiesSelection(steps) {
    return steps.some(
      (step) => step.type === 'selection-step' || step.type === 'operation-step'
    );
  }

  @action
  onTransactionStepUpdate(transaction, steps) {
    if (this.modifiesSelection(steps)) {
      const limitedDatastore = transaction
        .getCurrentDataStore()
        .limitToRange(transaction.currentSelection.lastRange, 'rangeIsInside');
      const besluit = limitedDatastore
        .match(null, 'a', '>http://data.vlaanderen.be/ns/besluit#Besluit')
        .asQuads()
        .next().value;
      if (besluit) {
        this.disableArticleInsert = false;
        this.hasTitle = Boolean(
          getTitleForDecision(
            besluit.subject.value,
            transaction.getCurrentDataStore()
          )
        );
        this.besluitUri = besluit.subject.value;
      } else {
        this.disableArticleInsert = true;
        this.hasTitle = true;
      }
    }
  }
}
