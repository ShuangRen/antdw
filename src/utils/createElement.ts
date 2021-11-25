interface ICreate {
  el: string;
  attr: Record<string, string | number> | null;
  children? : ICreate[];
}
export default function createElement (el: ICreate["el"], attr: ICreate["attr"], children?: ICreate["children"]) {
  const elDom = document.createElement(el);
  if(attr) {
    for(let item in attr) {
      if (attr[item]) {
        // @ts-ignore
        elDom[item] = attr[item];
      }
    } 
  }

  if(children && children.length) {
    children.forEach(item => {
      const childrenElDom = createElement(item.el, item.attr, item.children || undefined);
      elDom.appendChild(childrenElDom);
    })
  }
  return elDom;
}