import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class EditorPluginsTemplateVariableCardComponent extends Component {
  @tracked showCard = false;
  @tracked hasTitle = true;

  constructor() {
    super(...arguments);
    this.args.controller.onEvent(
      'contentChanged',
      this.modelWrittenHandler.bind(this)
    );
  }

  @action
  insertArticle() {
    this.args.controller.executeCommand('insert-article', this.args.controller);
  }

  @action
  insertTitle() {
    this.args.controller.executeCommand('insert-title', this.args.controller);
  }

  @action
  modelWrittenHandler() {
    const limitedDatastore = this.args.controller.datastore.limitToRange(
      this.args.controller.selection.lastRange,
      'rangeIsInside'
    );
    const besluit = limitedDatastore
      .match(null, 'a', '>http://data.vlaanderen.be/ns/besluit#Besluit')
      .asQuads()
      .next().value;
    if (besluit) {
      const hasTitle = Boolean(
        this.getTitle(besluit.subject.value, limitedDatastore)
      );
      this.hasTitle = hasTitle;
      this.showCard = true;
      this.besluitUri = besluit.subject.value;
    } else {
      this.showCard = false;
      this.hasTitle = true;
    }
  }
  getTitle(besluitUri, limitedDatastore) {
    const title = limitedDatastore
      .match(
        `>${besluitUri}`,
        '>http://data.europa.eu/eli/ontology#title',
        null
      )
      .asQuads()
      .next().value;
    if (title && title.object && title.object.value) {
      return title.object.value;
    } else {
      return;
    }
  }
}
