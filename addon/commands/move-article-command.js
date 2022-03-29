export default class MoveArticleCommand {
  name = 'move-article';

  constructor(model) {
    this.model = model;
  }

  canExecute() {
    return true;
  }

  execute(controller, besluitUri, articleElement, moveUp) {
    const subjectNodes = controller.datastore
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
      this.model.change(() => {
        const articleARange = controller.rangeFactory.fromAroundNode(articleA);
        const articleBRange = controller.rangeFactory.fromAroundNode(articleB);
        console.log(articleB.boundNode.outerHTML);
        console.log(articleA.boundNode.outerHTML);
        controller.executeCommand(
          'insert-html',
          articleA.boundNode.outerHTML,
          articleBRange
        );
        controller.executeCommand(
          'insert-html',
          articleB.boundNode.outerHTML,
          articleARange
        );
        controller.executeCommand(
          'recalculate-article-numbers',
          controller,
          besluitUri
        );
        const range = controller.rangeFactory.fromInElement(articleB, 0, 0);
        controller.selection.selectRange(range);
      });
    }
  }
}
