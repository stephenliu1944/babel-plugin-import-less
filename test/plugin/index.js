import { transform } from '@babel/core';
import plugin from '../../src/index';

// import styles from './home.scss';
// import React, { Component } from 'react';
// import { Button as B, Input, Steps, DatePicker } from 'antd';
// import { SCHeader } from 'antd';
// import { LeftBlueMenu } from 'antd';
var example = `
import { Form, Input, Row, Col, message } from 'antd';
const FormItem = Form.Item;

class MyInfo extends Component {
    render() {
        const { getFieldDecorator } = this.props.form;

        return (
            <Form>                    
                <FormItem label="姓名">
                    {getFieldDecorator('contact', {
                        rules: [{ required: false, message: '请输入姓名' }]
                     })(
                        <Input
                            style={{ width: 300 }}
                            placeholder=""
                            autoComplete="off"
                        />
                    )}
                </FormItem>
  			</Form>
		);
	}
}
export default Form.create()(MyInfo);
`;

it('works', () => {
    const { code } = transform(example, {
        presets: [
            // ['@babel/preset-env', {
            //     targets: [
            //         'last 2 version',
            //         'ie >= 9'
            //     ],
            //     modules: 'commonjs'     
            // }],
            '@babel/preset-react'
        ],
        plugins: [
            [plugin, {
                library: 'antd',
                directory: 'lib',                // default is 'lib'
                namingRule: (name) => {
                    // return name === 'Button' ? name : 'dash';   // little-camel, big-camel, dash, function, default is big-camel.
                    return name === 'SCHeader' ? 'scHeader' : 'little-camel';
                }
                // importDefault: false                 // default true
                // style: {                              // true or object, default is null
                //     directory: 'style',       // 'style' or '/less/component', default is upper directory.
                //     namingRule: 'index',              // little-camel, big-camel, dash, string, function, default is null.
                //     ext: 'css'                        // js, css, less, sass, default is null.
                // }
            }]
        ]
    });
    
    expect(code).toMatchSnapshot();
});