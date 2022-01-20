import { isSelectorMatchDom, selectorToArr, walkDomSelector } from '../utils';
import cssParse from './css';
import { parseAttr } from './valueParser';

// 是否继承， 是否reflow
const CssProper = {
  position: 0b01,
  display: 0b01,
  width: 0b01,
  height: 0b01,
  minWidth: 0b01,
  minHeight: 0b01,
  top: 0b01,
  left: 0b01,
  right: 0b01,
  bottom: 0b01,
  flex: 0b01,
  margin: 0b01,
  marginLeft: 0b01,
  marginRight: 0b01,
  marginTop: 0b01,
  marginBottom: 0b01,
  padding: 0b01,
  paddingLeft: 0b01,
  paddingRight: 0b01,
  paddingTop: 0b01,
  paddingBottom: 0b01,
  borderWidth: 0b01,
  borderLeftWidth: 0b01,
  borderRightWidth: 0b01,
  borderTopWidth: 0b01,
  borderBottomWidth: 0b01,
  flexDirection: 0b01,
  justifyContent: 0b01,
  alignItems: 0b01,
  alignSelf: 0b01,
  flexWrap: 0b01,
  zIndex: 0b01,
  background: 0b00,
  backgroundAttachment: 0b00,
  backgroundColor: 0b00,
  backgroundImage: 0b00,
  backgroundPosition: 0b00,
  backgroundRepeat: 0b00,
  overflow: 0b00,
  strokeDasharray: 0b00,
  strokeDashoffset: 0b00,
  textDecoration: 0b00,
  verticalAlign: 0b00,
  font: 0b10,
  fontFamily: 0b10,
  fontWeight: 0b10,
  fontSize: 0b10,
  fontVariant: 0b10,
  fontStretch: 0b10,
  textIndent: 0b10,
  textAlign: 0b10,
  textShadow: 0b10,
  lineHeight: 0b10,
  color: 0b10,
  wordSpacing: 0b10,
  letterSpacing: 0b10,
  captionSide: 0b10,
  borderCollapse: 0b10,
  emptyCells: 0b10,
  visibility: 0b10,
  cursor: 0b10,
  pointerEvents: 0b10,
};

export function isReflow(proper) {
  if (typeof CssProper[proper] !== 'undefined') {
    return CssProper[proper] & 0b01;
  }
  return true;
}

export function isInherit(proper) {
  if (typeof CssProper[proper] !== 'undefined') {
    return CssProper[proper] & 0b10;
  }
  return false;
}

// 生成特殊性
function genSpecificity(selector) {
  const idCount = selector.match(/#\w+/g)?.length || 0;
  const classCount = selector.match(/\.\w+/g)?.length || 0;
  const arr = selector.split(/\s+|#|\./).filter((s) => s !== '');
  const tagCount = arr.length - idCount - classCount;
  return idCount * 100 + classCount * 10 + tagCount;
}

// rule string转对象
function genStyleFromRule(rule) {
  const style = {};
  rule?.declarations.forEach((dn) => {
    let value = dn.value;
    style[dn.property] = String(value).toLocaleLowerCase();
  });
  return style;
}

function genKeySelector(ruleSel) {
  const selector = selectorToArr(ruleSel, /\s/).pop();

  let matchs = selector.match(/(#[^\.#]+)/);
  if (matchs?.length > 0) return matchs[0];

  matchs = selector.match(/\.[^\.#]+/);
  if (matchs?.length > 0) return matchs[0];

  return selector;
}

// css字符串 -> rule哈希
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

function parseInlineRule(uiNode) {
  const text = uiNode?.dom?.attrs?.style;
  if (!text || !text.trim()) {
    return;
  }
  const sheet = cssParse(`
   inline {
    ${text}
   }`);
  return genStyleFromRule(sheet.stylesheet.rules[0]);
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

  // 内嵌样式塞进去
  const inlineStyle = parseInlineRule(uiNode);
  inlineStyle && finaleRules.push({ style: inlineStyle });

  // 按顺序合并style，高优先级覆盖
  const finalStyle = finaleRules.reduce((prev, cur) => Object.assign({}, prev, cur.style), {});

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
  // hack 目前文本布局依赖容器宽度，强制硬编码个flex属性
  if (uiNode.dom.tagName === 'text') {
    jsStyle['flex'] = 1;
  }
  return jsStyle;
}

const defaultStyle = {
  position: 'relative',
  display: 'flex',
  width: 0,
  height: 0,
  minWidth: 0,
  minHeight: 0,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  flex: 0,
  margin: 0,
  marginLeft: 0,
  marginRight: 0,
  marginTop: 0,
  marginBottom: 0,
  padding: 0,
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: 0,
  paddingBottom: 0,
  borderWidth: 0,
  borderLeftWidth: 0,
  borderRightWidth: 0,
  borderTopWidth: 0,
  borderBottomWidth: 0,
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  alignSelf: 'flex-start',
  flexWrap: 'nowrap',
  zIndex: 0,
  backgroundAttachment: 'scroll',
  backgroundColor: '#ffffff',
  backgroundImage: '',
  backgroundPosition: 0,
  backgroundRepeat: 'repeat',
  overflow: 'auto',
  strokeDasharray: 'none',
  strokeDashoffset: 0,
  textDecoration: 0,
  verticalAlign: 'baseline',
  fontFamily: '',
  fontWeight: 'normal',
  fontSize: 12,
  fontVariant: 'normal',
  fontStretch: 'normal',
  textIndent: 0,
  textAlign: 'left',
  textShadow: 'none',
  lineHeight: 12,
  color: '#000000',
  wordSpacing: 0,
  letterSpacing: 0,
  visibility: 'visible',
  pointerEvents: 'normal',
  textOverflow: 'normal',
  fillOpacity: 1,
  opacity: 1,
};

export function getMergedStyle(style) {
  return Object.assign({}, defaultStyle, style);
}
