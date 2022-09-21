export default class MoveArticleCommand {
  canExecute() {
    return true;
  }

  execute({ transaction }, { besluitUri, articleElement, moveUp }) {
    const subjectNodes = transaction
      .getCurrentDataStore()
      .match(`>${besluitUri}`, 'prov:value', null)
      .asSubjectNodes()
      .next().value;
    const besluitNode = [...subjectNodes.nodes][0];
    let articleContainerElement;
    for (let child of besluitNode.children) {
      if (child.getAttribute('property') === 'prov:value') {
        articleContainerElement = child;
      }
    }
    const articles = articleContainerElement.children.filter(
      (child) => child.modelNodeType === 'ELEMENT'
    );
    if (articles.length > 1) {
      const articleIndex = articles.findIndex(
        (article) => article === articleElement
      );
      if (moveUp && articleIndex <= 0) return;
      if (!moveUp && articleIndex >= articles.length - 1) return;
      const articleA = articles[articleIndex];
      const bIndex = moveUp ? articleIndex - 1 : articleIndex + 1;
      const articleB = articles[bIndex];

      const articleARange = transaction.rangeFactory.fromAroundNode(articleA);
      const articleBRange = transaction.rangeFactory.fromAroundNode(articleB);
      const articleAToInsert = articleA.clone();
      const articleBToInsert = articleB.clone();

      transaction.insertNodes(articleBRange, articleAToInsert);
      transaction.insertNodes(articleARange, articleBToInsert);

      transaction.commands.recalculateArticleNumbers({ besluitUri });
      const range = transaction.rangeFactory.fromInElement(
        articleAToInsert,
        0,
        0
      );
      transaction.selectRange(range);
    }
  }
}
