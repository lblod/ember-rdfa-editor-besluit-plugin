export default class InsertArticleCommand {
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
          this.replaceArticles(controller, articleContainerElement, articles);
        }
      } else {
        if (articleIndex < articles.length - 1) {
          const temporalVariable = articles[articleIndex + 1];
          articles[articleIndex + 1] = articles[articleIndex];
          articles[articleIndex] = temporalVariable;
          this.replaceArticles(controller, articleContainerElement, articles);
        }
      }
    }
  }
  replaceArticles(controller, articleContainerElement, articles) {
    const range = controller.rangeFactory.fromInNode(
      articleContainerElement, 
      0, 
      articleContainerElement.getMaxOffset()
    );
    const articleHtml = articles.reduce((html, article) => (html += article.boundNode.outerHTML), '');
    controller.executeCommand('insert-html', articleHtml, range);
  }
}
