import { v4 as uuid } from 'uuid';

export default class InsertArticleCommand {
  name = 'insert-article';

  constructor(model) {
    this.model = model;
  }

  canExecute() {
    return true;
  }

  execute(controller) {
    const limitedDatastore = controller.datastore.limitToRange(
      controller.selection.lastRange,
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
    const range = controller.rangeFactory.fromInNode(
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
    controller.executeCommand('insert-html', articleHtml, range);
  }
}
