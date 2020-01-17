import { transform } from '@babel/core';
import plugin from '../src/index';

it('button', () => {
    var example = `
        import { Button } from '@material-ui/core';

        function App() {
            return (
                <Button variant="contained" color="primary">
                    Hello World
                </Button>
            );
        }
    `;

    const { code } = transform(example, {
        presets: [
            '@babel/preset-react'
        ],
        plugins: [
            [plugin, {
                library: '@material-ui/core',
                module: '[big-camel]'          
            }]
        ]
    });
    
    expect(code).toMatchSnapshot();
});