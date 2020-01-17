import { transform } from '@babel/core';
import plugin from '../src/index';

it('isEmpty', () => {
    const example = `
        import { isEmpty } from 'lodash';

        isEmpty(null);
    `;

    const { code } = transform(example, {
        plugins: [
            [plugin, {
                library: 'lodash',
                module: '[little-camel]'
            }]
        ]
    });
    
    expect(code).toMatchSnapshot();
});