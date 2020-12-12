import { Node } from 'unist';

const ATTR_MAPPING = {
  hideactions: 'hideActions',
  defaultshowcode: 'defaultShowCode',
};

/**
 * parse custome HTML element attributes to properties
 * @note  1. empty attribute will convert to true
 *        2. JSON-like string will convert to JSON
 *        3. workaround for restore property to camlCase that caused by hast-util-raw
 * @param   attrs   original attributes
 * @return  parsed properties
 */
export const parseElmAttrToProps = (attrs: { [key: string]: string }) => {
  const parsed: { [key: string]: any } = Object.assign({}, attrs);

  // restore camelCase attrs, because hast-util-raw will transform camlCase to lowercase
  Object.entries(ATTR_MAPPING).forEach(([mark, attr]) => {
    if (parsed[mark] !== undefined) {
      parsed[attr] = parsed[mark];
      delete parsed[mark];
    }
  });

  // convert empty string to boolean
  Object.keys(parsed).forEach(attr => {
    if (parsed[attr] === '') {
      parsed[attr] = true;
    }
  });

  // try to parse JSON field value
  Object.keys(parsed).forEach(attr => {
    if (/^(\[|{)[^]*(]|})$/.test(parsed[attr])) {
      try {
        parsed[attr] = JSON.parse(parsed[attr]);
      } catch (err) {
        /* nothing */
      }
    }
  });

  return parsed;
};

/**
 * use to replace node in n ary tree
 * @param node {Node} ast node
 * @param find {Node} target node
 * @param replace {Node} new node
 */
export function replaceNode<N extends Node & { children?: N[] }>(
  node: N,
  find: N,
  ...replace: N[]
) {
  function preorder(root: N, index: number, parent: N | null) {
    if (root === find && parent && Array.isArray(parent.children)) {
      parent.children.splice(index, 1, ...replace);
    }
    if (Array.isArray(root.children)) {
      root.children.forEach((child, idx) => preorder(child, idx, root));
    }
  }
  preorder(node, 0, null);
  return node;
}
