export default class RecalculateArticleNumbersCommand {
  name = 'recalculate-article-numbers';

  constructor(model) {
    this.model = model;
  }

  canExecute() {
    return true;
  }

  execute(controller, besluitUri) {
    //TODO: make the query compatible with multiple besluits
    const articles = controller.datastore
      /*.match(
        `>${besluitUri}`,
        '>http://data.europa.eu/eli/ontology#has_part',
        null
      )*/
      .match(null, 'a', '>http://data.vlaanderen.be/ns/besluit#Artikel')
      .asSubjectNodes();
    const articlesArray = [...articles];
    console.log(articlesArray);
    for (let i = 0; i < articlesArray.length; i++) {
      const article = [...articlesArray[i].nodes][0];
      this.replaceNumberIfNeeded(controller, article, i);
    }
  }
  replaceNumberIfNeeded(controller, article, index) {
    const articleNumberObjectNode = controller.datastore
      .match(
        `>${article.getAttribute('resource')}`,
        '>http://data.europa.eu/eli/ontology#number',
        null
      )
      .asObjectNodes()
      .next().value;
    const articleNumber = Number(articleNumberObjectNode.object.value);
    console.log(articleNumberObjectNode.nodes);
    const articleNumberElement = [...articleNumberObjectNode.nodes][0];
    const articleNumberExpected = index + 1;
    if (articleNumber !== articleNumberExpected) {
      console.log(article.getAttribute('resource'))
      console.log(articleNumber);
      console.log(articleNumberExpected);
      console.log('replacing article numbers')
      console.log(articleNumberElement);
      controller.executeCommand(
        'insert-text',
        String(articleNumberExpected),
        controller.rangeFactory.fromInNode(
          articleNumberElement,
          0,
          articleNumberElement.getMaxOffset()
        )
      );
    }
  }
}
