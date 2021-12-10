import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { v4 as uuid } from 'uuid';

export default class EditorPluginsTemplateVariableCardComponent extends Component {
  @tracked showCard = false;

  constructor() {
    super(...arguments);
    this.args.controller.onEvent('contentChanged', this.modelWrittenHandler);
  }

  @action
  insertArticle() {
    const limitedDatastore = this.args.controller.datastore.limitToRange(
      this.args.controller.selection.lastRange,
      'rangeIsInside'
    );
    const besluit = limitedDatastore
      .match(null, 'a', '>http://data.vlaanderen.be/ns/besluit#Besluit')
      .asSubjectNodes()
      .next().value;
    const besluitNode = [...besluit.nodes][0];
    let articleContainerNode;
    for (let child of besluitNode.children) {
      if (child.attributeMap.get('property') === 'prov:value') {
        articleContainerNode = child;
        break;
      }
    }
    const range = this.args.controller.rangeFactory.fromInNode(
      articleContainerNode,
      articleContainerNode.getMaxOffset(),
      articleContainerNode.getMaxOffset()
    );

    const articleHtml = `
      <div property="eli:has_part" prefix="mobiliteit: https://data.vlaanderen.be/ns/mobiliteit#" typeof="besluit:Artikel" resource="http://data.lblod.info/artikels/${uuid()}">
        <div property="eli:number" datatype="xsd:string">Artikel <span class="mark-highlight-manual">nummer</span></div>
        <span style="display:none;" property="eli:language" resource="http://publications.europa.eu/resource/authority/language/NLD" typeof="skos:Concept">&nbsp;</span>
        <div propert="prov:value" datatype="xsd:string">
          <span class="mark-highlight-manual">Voer inhoud in</span>
        </div>
      </div>
    `;
    this.args.controller.executeCommand('insert-html', articleHtml, range);
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
      this.showCard = true;
      this.besluitUri = besluit.subject.value;
    } else {
      this.showCard = false;
    }
  }
}
