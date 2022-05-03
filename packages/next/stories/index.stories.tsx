import React from 'react';

import { Story, Meta } from '@storybook/react/types-6-0';

import NodeDemo from './uiTest';

export default {
  title: 'Example',
} as Meta;

export const nodeDemo = (args) => <NodeDemo {...args} />;
