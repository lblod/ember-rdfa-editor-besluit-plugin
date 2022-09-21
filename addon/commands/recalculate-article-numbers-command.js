export default class RecalculateArticleNumbersCommand {
  canExecute() {
    return true;
  }

  execute({ transaction }, { besluitUri }) {
    const besluitSubjectNodes = transaction
      .getCurrentDataStore()
      .match(`>${besluitUri}`, null, null)
      .asSubjectNodes()
      .next().value;
    const besluit = [...besluitSubjectNodes.nodes][0];
    const articles = transaction
      .getCurrentDataStore()
      .limitToRange(
        transaction.rangeFactory.fromAroundNode(besluit),
        'rangeContains'
      )
      .match(null, 'a', '>http://data.vlaanderen.be/ns/besluit#Artikel')
      .asPredicateNodes()
      .next().value;
    if (articles) {
      const articlesArray = [...articles.nodes];
      for (let i = 0; i < articlesArray.length; i++) {
        const article = articlesArray[i];
        this.replaceNumberIfNeeded(transaction, article, i);
      }
    }
  }

  replaceNumberIfNeeded(transaction, article, index) {
    const articleNumberObjectNode = transaction
      .getCurrentDataStore()
      .match(
        `>${article.getAttribute('resource')}`,
        '>http://data.europa.eu/eli/ontology#number',
        null
      )
      .asObjectNodes()
      .next().value;
    const articleNumber = Number(articleNumberObjectNode.object.value);
    const articleNumberElement = [...articleNumberObjectNode.nodes][0];
    const articleNumberExpected = index + 1;
    if (articleNumber !== articleNumberExpected) {
      transaction.commands.insertText({
        text: String(articleNumberExpected),
        range: transaction.rangeFactory.fromInNode(
          articleNumberElement,
          0,
          articleNumberElement.getMaxOffset()
        ),
      });
    }
  }
}
