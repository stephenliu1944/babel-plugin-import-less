import { transform } from '@babel/core';
import plugin from '../src/index';

it('input', () => {
    const example = `
        import React, { Component } from 'react';
        import { Input } from 'antd';
        var name = Input.name;

        export default function(props) {
            return (
                <div>
                    <Input name={Input.name} >{Input.name}</Input>
                    <div>{Input.name}</div>
                </div>
            );
        }
    `;

    const { code } = transform(example, {
        presets: [
            '@babel/preset-react'
        ],
        plugins: [
            [plugin, {
                library: 'antd',
                module: 'es/[dash]',
                style: 'style'           
            }]
        ]
    });
    
    expect(code).toMatchSnapshot();
});

it('form', () => {
    const example = `
        import { Form, Input } from 'antd';
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
                                <Input style={{ width: 300 }} placeholder="" autoComplete="off" />
                            )}
                        </FormItem>
                    </Form>
                );
            }
        }
        export default Form.create()(MyInfo);
    `;

    const { code } = transform(example, {
        presets: [
            '@babel/preset-react'
        ],
        plugins: [
            [plugin, {
                library: 'antd',
                module: 'es/[dash]',
                style: 'style'           
            }]
        ]
    });
    
    expect(code).toMatchSnapshot();
});