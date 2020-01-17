import { transform } from '@babel/core';
import plugin from '../src/index';

it('button', () => {
    const example = `
        import React from 'react';
        import { Button } from 'reactstrap';

        export default (props) => {
            return (
                <Button color="danger">Danger!</Button>
            );
        };
    `;

    const { code } = transform(example, {
        presets: [
            '@babel/preset-react'
        ],
        plugins: [
            [plugin, {
                library: 'reactstrap',
                module: 'lib/[big-camel]'       
            }]
        ]
    });
    
    expect(code).toMatchSnapshot();
});