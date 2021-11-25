import createElement from "../../utils/createElement";

export default class Button extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow( {mode: "closed"} );
    console.log(this)
    const templateElem = createElement('div', {
      className: "antw-button-wrap", 
      innerText: this.innerHTML
    })
    this.innerHTML = '';
    const styles = createElement('style', {innerHTML: (`
      .antw-button-wrap {
        width: 100px;
        height: 46px;
        background: aqua;
        text-align: center;
        line-height: 46px;
      }
    `)})
    shadow.appendChild(styles);
    shadow.appendChild(templateElem);
  }

}