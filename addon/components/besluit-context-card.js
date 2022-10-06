import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class BesluitContextCardComponent extends Component {
  @tracked articleElement;

  constructor() {
    super(...arguments);
    this.args.controller.addTransactionStepListener(
      this.onTransactionStepUpdate
    );
  }

  @action
  deleteArticle() {
    this.args.controller.perform((tr) => {
      const range = tr.rangeFactory.fromAroundNode(this.articleElement);
      tr.selectRange(range);
      tr.commands.deleteSelection({});
      tr.commands.recalculateArticleNumbers({
        besluitUri: this.besluitUri,
      });
    });
  }

  @action
  moveUpArticle() {
    this.args.controller.perform((tr) => {
      tr.commands.moveArticle({
        besluitUri: this.besluitUri,
        articleElement: this.articleElement,
        moveUp: true,
      });
    });
  }

  @action
  moveDownArticle() {
    this.args.controller.perform((tr) => {
      tr.commands.moveArticle({
        besluitUri: this.besluitUri,
        articleElement: this.articleElement,
        moveUp: false,
      });
    });
  }

  @action
  selectionChangedHandler() {
    this.articleElement = undefined;
    const selectedRange = this.args.controller.lastRange;
    if (!selectedRange) {
      return;
    }
    const limitedDatastore = this.args.controller.datastore.limitToRange(
      selectedRange,
      'rangeIsInside'
    );
    const besluit = limitedDatastore
      .match(null, 'a', '>http://data.vlaanderen.be/ns/besluit#Besluit')
      .asQuads()
      .next().value;
    if (besluit) {
      const articleSubjectNodes = limitedDatastore
        .match(null, 'a', '>http://data.vlaanderen.be/ns/besluit#Artikel')
        .asSubjectNodes()
        .next().value;
      if (articleSubjectNodes) {
        this.articleElement = [...articleSubjectNodes.nodes][0];
      }
      this.besluitUri = besluit.subject.value;
    }
  }

  modifiesSelection(steps) {
    return steps.some(
      (step) => step.type === 'selection-step' || step.type === 'operation-step'
    );
  }

  @action
  onTransactionStepUpdate(transaction, steps) {
    if (this.modifiesSelection(steps)) {
      this.articleElement = undefined;
      const limitedDatastore = transaction
        .getCurrentDataStore()
        .limitToRange(transaction.currentSelection.lastRange, 'rangeIsInside');
      const besluit = limitedDatastore
        .match(null, 'a', '>http://data.vlaanderen.be/ns/besluit#Besluit')
        .asQuads()
        .next().value;
      if (besluit) {
        const articleSubjectNodes = limitedDatastore
          .match(null, 'a', '>http://data.vlaanderen.be/ns/besluit#Artikel')
          .asSubjectNodes()
          .next().value;
        if (articleSubjectNodes) {
          this.articleElement = [...articleSubjectNodes.nodes][0];
        }
        this.besluitUri = besluit.subject.value;
      }
    }
  }
}
