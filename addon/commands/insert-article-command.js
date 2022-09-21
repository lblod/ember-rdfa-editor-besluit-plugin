import { v4 as uuid } from 'uuid';

export default class InsertArticleCommand {
  canExecute() {
    return true;
  }

  execute({ transaction }, { articleContent, articleNumber }) {
    const limitedDatastore = transaction
      .getCurrentDataStore()
      .limitToRange(transaction.currentSelection.lastRange, 'rangeIsInside');
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
    const range = transaction.rangeFactory.fromInNode(
      articleContainerNode,
      articleContainerNode.getMaxOffset(),
      articleContainerNode.getMaxOffset()
    );
    const articleUri = `http://data.lblod.info/artikels/${uuid()}`;
    const articleHtml = `
      <div property="eli:has_part" prefix="mobiliteit: https://data.vlaanderen.be/ns/mobiliteit#" typeof="besluit:Artikel" resource="${articleUri}">
        <div>
          Artikel
          <span property="eli:number" datatype="xsd:string">
            ${
              articleNumber
                ? articleNumber
                : this.generateArticleNumber(transaction)
            }
          </span></div>
        <span style="display:none;" property="eli:language" resource="http://publications.europa.eu/resource/authority/language/NLD" typeof="skos:Concept">&nbsp;</span>
        <div property="prov:value" datatype="xsd:string">
        ${
          articleContent
            ? articleContent
            : '<span class="mark-highlight-manual">Voer inhoud in</span>'
        }
        </div>
      </div>
    `;
    transaction.commands.insertHtml({ htmlString: articleHtml, range });
    const newArticleElementSubjectNodes = transaction
      .getCurrentDataStore()
      .match(`>${articleUri}`, null, null)
      .asSubjectNodes()
      .next().value;
    if (newArticleElementSubjectNodes) {
      const newArticleElement = [...newArticleElementSubjectNodes.nodes][0];
      console.log(newArticleElement.toXml());
      const range = transaction.rangeFactory.fromInElement(
        newArticleElement,
        0,
        0
      );
      console.log('will select range');
      transaction.selectRange(range);
    }
  }

  generateArticleNumber(transaction) {
    const numberQuads = [
      ...transaction
        .getCurrentDataStore()
        .match(null, '>http://data.europa.eu/eli/ontology#number', null)
        .asQuads(),
    ];
    let biggerNumber;
    for (let numberQuad of numberQuads) {
      const number = Number(this.removeZeroWidthSpace(numberQuad.object.value));
      if (!Number.isNaN(number) && (number > biggerNumber || !biggerNumber)) {
        biggerNumber = number;
      }
    }
    if (biggerNumber) {
      return biggerNumber + 1;
    } else {
      return '<span class="mark-highlight-manual">nummer</span>';
    }
  }

  removeZeroWidthSpace(text) {
    return text.replace(/[\u200B-\u200D\uFEFF]/g, '');
  }
}
