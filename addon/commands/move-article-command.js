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
      if (moveUp) {
        if (articleIndex > 0) {
          const temporalVariable = articles[articleIndex - 1];
          articles[articleIndex - 1] = articles[articleIndex];
          articles[articleIndex] = temporalVariable;
          this.model.change(() => {
            this.replaceArticles(
              controller,
              articleContainerElement,
              articles,
              articleElement
            );
          });
        }
      } else {
        if (articleIndex < articles.length - 1) {
          const temporalVariable = articles[articleIndex + 1];
          articles[articleIndex + 1] = articles[articleIndex];
          articles[articleIndex] = temporalVariable;
          this.model.change(() => {
            this.replaceArticles(
              controller,
              articleContainerElement,
              articles,
              articleElement
            );
          });
        }
      }
    }
  }
  replaceArticles(
    controller,
    articleContainerElement,
    articles,
    articleElement
  ) {
    const range = controller.rangeFactory.fromInNode(
      articleContainerElement,
      0,
      articleContainerElement.getMaxOffset()
    );
    const articleHtml = articles.reduce(
      (html, article) => (html += article.boundNode.outerHTML),
      ''
    );
    controller.executeCommand('insert-html', articleHtml, range);
    const articleUri = articleElement.getAttribute('resource');
    const newArticleElementSubjectNodes = controller.datastore
      .match(`>${articleUri}`, null, null)
      .asSubjectNodes()
      .next().value;
    if (newArticleElementSubjectNodes) {
      const newArticleElement = [...newArticleElementSubjectNodes.nodes][0];
      const range = controller.rangeFactory.fromInElement(
        newArticleElement,
        0,
        0
      );
      controller.selection.selectRange(range);
    }
  }
}
