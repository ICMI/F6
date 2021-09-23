import cssParse from '../om/css';
import { parseAttr } from '../parser/attrParser';

const defaultStyle = {
  'font-family': 'serif',
};

const inheritAttr = [
  'font',
  'fontFamily',
  'fontWeight',
  'fontSize',
  'fontVariant',
  'fontStretch',
  'textIndent',
  'textAlign',
  'textShadow',
  'lineHeight',
  'color',
  'direction',
  'wordSpacing',
  'letterSpacing',
  'textTransform',
  'captionSide',
  'borderCollapse',
  'emptyCells',
  'listStyleType',
  'listStyleImage',
  'listStylePosition',
  'listStyle',
  'visibility',
  'cursor',
];

// 生成特殊性
function genSpecificity(selector) {
  const idCount = selector.match(/#\w+/g)?.length || 0;
  const classCount = selector.match(/\.\w+/g)?.length || 0;
  const arr = selector.split(/\s+|#|\./).filter((s) => s !== '');
  const tagCount = arr.length - idCount - classCount;
  return idCount * 100 + classCount * 10 + tagCount;
}

// rule转对象
function genStyleFromRule(rule) {
  const style = {};
  rule?.declarations.forEach((dn) => {
    let value = dn.value;
    style[dn.property] = String(value).toLocaleLowerCase();
  });
  return style;
}

// css -> rulehash
export function parseRulesHash(cssString) {
  const rules = cssParse(cssString);
  const rulesHash = {
    ids: {},
    classes: {},
    tagNames: {},
  };
  for (let rule of rules.stylesheet.rules) {
    // 处理keyframe等
    if (rule.type !== 'rule') continue;
    for (let selector of rule.selectors) {
      const keySeletor = genKeySelector(selector);
      switch (keySeletor[0]) {
        case '#':
          const key = keySeletor.slice(1);
          rulesHash.ids[key] = [
            ...(rulesHash.ids[key] || []),
            {
              selector,
              specificity: genSpecificity(selector),
              style: genStyleFromRule(rule),
            },
          ];
          break;
        case '.':
          const classKey = keySeletor.slice(1);
          rulesHash.classes[classKey] = [
            ...(rulesHash.classes[classKey] || []),
            {
              selector,
              specificity: genSpecificity(selector),
              style: genStyleFromRule(rule),
            },
          ];
          break;
        default:
          rulesHash.tagNames[keySeletor] = [
            ...(rulesHash.tagNames[keySeletor] || []),
            {
              selector,
              specificity: genSpecificity(selector),
              style: genStyleFromRule(rule),
            },
          ];
          break;
      }
    }
  }
  return rulesHash;
}

// 遍历dom
export function walkDomSelector(dom, fn) {
  if (!dom || !fn) return;
  if (dom.attrs.id) {
    fn('id', dom.attrs.id);
  }
  if (dom.attrs.class) {
    selectorToArr(dom.attrs.class, /\s+/g).forEach((className) => fn('class', className));
  }
  fn('tagName', dom.tagName);
}

export function selectorToArr(selector, rex) {
  if (!rex) return [selector];
  return selector.split(rex).filter((s) => s != '');
}

export function isSelectorMatchDom(dom, selector) {
  if (!dom || !selector) {
    return false;
  }
  const tags = selector.match(/(^[^\.#]+)/g);
  const ids = selector.match(/#[^\.#]+/g);
  const classes = selector.match(/\.[^\.#]+/g);

  const parts = [...(tags || []), ...(ids || []), ...(classes || [])];

  const domSels = {};

  walkDomSelector(dom, (key, sel) => {
    switch (key) {
      case 'id':
        domSels[`#${sel}`] = 1;
        break;
      case 'class':
        domSels[`.${sel}`] = 1;
        break;
      case 'tagName':
        domSels[`${sel}`] = 1;
        break;
    }
  });

  for (const part of parts) {
    // 对比dom的id/class等是否和selector匹配上的
    if (!domSels[part]) return false;
  }
  return true;
}

function genKeySelector(ruleSel) {
  const selector = selectorToArr(ruleSel, /\s/).pop();

  let matchs = selector.match(/(#[^\.#]+)/);
  if (matchs?.length > 0) return matchs[0];

  matchs = selector.match(/\.[^\.#]+/);
  if (matchs?.length > 0) return matchs[0];

  return selector;
}

export function computeCSS(uiNode, path, parentStyle, ruleHashs) {
  // 从hash表中拿到匹配的rules
  const filteredRules = [];
  ruleHashs.forEach((rulesHash) => {
    walkDomSelector(uiNode.dom, (keyName, selector) => {
      switch (keyName) {
        case 'id':
          filteredRules.push(...(rulesHash.ids[selector] || []));
          break;
        case 'class':
          filteredRules.push(...(rulesHash.classes[selector] || []));
          break;
        case 'tagName':
          filteredRules.push(...(rulesHash.tagNames[selector] || []));
        default:
          break;
      }
    });
  });

  // 再根据路径筛选一次, 每条rule和dom的path去对比
  const finaleRules = filteredRules.filter((rule) => {
    // 判断selector是否和路径匹配，
    const ruleSelectors = selectorToArr(rule.selector, /\s+/g);
    // 逆序判断每个子选择器
    let lastSelMatch = ruleSelectors.length - 2;
    let lastDomMatch = path.length - 1;

    let result = true;
    for (; lastSelMatch > -1; lastSelMatch--) {
      let isMatch = false;
      for (; lastDomMatch > -1; lastDomMatch--) {
        // 不断取节点去匹配选择器
        const dom = path[lastDomMatch].dom;
        // 路径中该节点匹配命中，准备匹配下个
        if (isSelectorMatchDom(dom, ruleSelectors[lastSelMatch])) {
          isMatch = true;
          break;
        }
      }
      if (!isMatch) {
        result = false;
        break;
      }
    }
    return result;
  });

  // 根据优先级排序
  finaleRules.sort((a, b) => a.specificity - b.specificity);

  // 按顺序合并style，高优先级覆盖
  const finalStyle = finaleRules.reduce((prev, cur) => Object.assign(prev, cur.style), {
    ...defaultStyle,
  });

  // 解析属性值/属性转驼峰
  let jsStyle = {};
  for (let [key, value] of Object.entries(finalStyle)) {
    const camel = key
      .split('-')
      .map((s, index) => {
        if (index > 0) {
          return `${s[0].toUpperCase()}${s.slice(1)}`;
        }
        return s;
      })
      .join('');

    const parsedValue = parseAttr(key, value);
    if (typeof parsedValue === 'object') {
      jsStyle = { ...jsStyle, ...parsedValue };
    } else {
      jsStyle[camel] = parsedValue;
    }
  }
  const inherits = {};
  const other = {};
  if (parentStyle) {
    for (let [key, value] of Object.entries(jsStyle)) {
      if (value !== 'inherit' && inheritAttr.includes(key)) {
        inherits[key] = value;
        continue;
      }
      if (value !== 'inherit') {
        other[key] = value;
      }
    }
    Object.setPrototypeOf(inherits, parentStyle.inherits);
  }

  return { ...other, inherits };
}
