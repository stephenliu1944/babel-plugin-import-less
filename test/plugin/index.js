import { transform } from '@babel/core';
import plugin from '../../src/index';
import { join } from 'path';

// import styles from './home.scss';
// import React, { Component } from 'react';
// import { Button as B, Input, Steps, DatePicker } from 'antd';
// import { SCHeader } from 'antd';
// import { LeftBlueMenu } from 'antd';
var example = `
import { DateTime } from '@material-ui/core';
`;

// var example = `
// import { Form, Input, Row, Col, message } from 'antd';
// const FormItem = Form.Item;

// class MyInfo extends Component {
//     render() {
//         const { getFieldDecorator } = this.props.form;

//         return (
//             <Form>                    
//                 <FormItem label="姓名">
//                     {getFieldDecorator('contact', {
//                         rules: [{ required: false, message: '请输入姓名' }]
//                      })(
//                         <Input
//                             style={{ width: 300 }}
//                             placeholder=""
//                             autoComplete="off"
//                         />
//                     )}
//                 </FormItem>
//   			</Form>
// 		);
// 	}
// }
// export default Form.create()(MyInfo);
// `;

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
                // little-camel, big-camel, dash, underline, function.
                library: '@material-ui/core',
                // importDefault: false             
                module: 'lib/[big-camel]',           
                style: '../less/[dash]'           
            }]
        ]
    });
    
    expect(code).toMatchSnapshot();
});

// it('path', () => {
//     console.log('xxx aaa: ', join('xxx', 'aaa', '../bbb'));
//     console.log('/xxx aaa ', join('/xxx', 'aaa'));
//     console.log('/xxx/ aaa: ', join('/xxx/', 'aaa'));
//     console.log('/xxx/ /aaa: ', join('/xxx/', '/aaa'));
//     console.log('/xxx /aaa: ', join('/xxx/bbb', './aaa'));
//     console.log('/xxx /aaa/: ', join('/xxx/bbb/', './aaa/'));
// });