import React, { useEffect } from 'react';
import F6 from '../../src';
import TreeGraph from '../../src/extends/graph/treeGraph';
import data from './data';
import equityCompanyNode from './node';
import equityCompanyNodeF6UI from './uiNode';
import { createUI } from '@antv/f6-ui';

export default () => {
  const ref = React.useRef(null);
  const height = window.innerHeight - 32; // demos padding
  const width = window.innerWidth - 32;

  function renderUI(graph) {
    const w = 200;
    const h = 200;
    const bg = 'black';
    const html = `
    <root class="f6_ui_node">
      <div class="test_div_1">
      123
      </div>  
    </root>
  `;

    const css = `
    root {
      background: black;
      width: 300;
      height: 300;
      color: yellow;
      flex-direction: row;
      overflow: hidden;
    }
    .test_div {
      margin-left: 10;
      background: red;
      line-height: 12;
      text-align: center;
      text-overflow: ellipsis;
      justify-content: center;
      align-items: center;
      width: 100;
      height: 30;
    }
    .test_div_1{
      margin-left: 100;
      width: 100;
      height: 100;
      background: blue;
      padding: 10;
      white-space: normal;
      justify-content: center;
      align-items: center;
      text-align: right;
    }
    
    shape{
      background: yellow;
    }
    img{
      width: 20;
      height: 20;
    }
  `;
    const group = graph.get('uiGroup');
    const ui = createUI(html, css, group);

    // 测试查询
    let node = ui.root.query('.test_div_1');

    // 事件测试
    node.on('tap', (e) => {
      console.log(e.uiNode === node);
    });

    // setTimeout(() => {
    //   // display 测试
    //   node.css('display', 'flex');
    //   node.attr('class', 'test_div');
    // }, 2000);
    // setTimeout(() => {
    //   // class 切换测试
    //   node.attr('class', 'test_div_1');
    //   node.css('display', 'flex');
    // }, 4000);

    // setTimeout(() => {
    // append 测试
    // const testNode = node.appendChild(
    //   ui.createElement('div', {
    //     style: `width:100; height: 100; background: red; font-size: 10;color: black;`,
    //   }),
    // );
    // testNode.appendChild(ui.createTextNode('fajksdjfaksd'));

    // }, 6000);
    console.log('ui', ui);
  }

  let graph = null;
  useEffect(() => {
    if (!graph) {
      // debugger
      F6.registerNode('EQUITY_GRAPH_NODE_TYPE_COMPANY', equityCompanyNode, 'rect');
      // F6.registerNode('EQUITY_GRAPH_NODE_TYPE_COMPANY_F6UI', equityCompanyNodeF6UI, 'rect');
      F6.registerGraph('TreeGraph', TreeGraph);
      graph = new F6.TreeGraph({
        container: ref.current,
        width,
        height,
        fitView: true,
        linkCenter: true,
        defaultNode: {
          type: 'rect',
          maxTextCount: 20,
          size: [242, 106],
          style: {
            radius: 0,
            fill: '#FFFFFF',
            stroke: '#91D5FF',
          },
          labelCfg: {
            style: {
              fill: '#333333',
              fontSize: 20,
              textAlign: 'center',
            },
          },
          anchorPoints: [
            [0.5, 0],
            [0.5, 1],
          ],
        },
        modes: {
          default: ['drag-node', 'zoom-canvas'],
        },
        layout: {
          type: 'compactBox',
          direction: 'V',
          getId: function getId(d) {
            return d.id;
          },
          getHeight: function getHeight() {
            return 106;
          },
          getWidth: function getWidth() {
            return 242;
          },
          getVGap: function getVGap() {
            return 154 / 2;
          },
          getHGap: function getHGap() {
            return 24 / 2;
          },
          getSide: function getSide(node) {
            switch (node.data.side) {
              case 'up':
                return 'left';
              case 'down':
                return 'right';
              default:
                return 'left';
            }
          },
        },
        defaultEdge: {
          color: '#999',
          style: {
            stroke: '#C5C5C5',
          },
          labelCfg: {
            style: {
              fill: '#000',
              fontSize: 20,
              textAlign: 'left',
              fontStyle: 'Italic',
            },
          },
        },
      });
      graph.data(data);
      graph.render();
      renderUI(graph);
    }
  }, []);

  return <div ref={ref}></div>;
};
