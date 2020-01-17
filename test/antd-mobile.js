import { transform } from '@babel/core';
import plugin from '../src/index';

it('form', () => {
    const example = `
        import { Form, Input, Row, Col, message } from 'antd-mobile';
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

    const { code } = transform(example, {
        presets: [
            '@babel/preset-react'
        ],
        plugins: [
            [plugin, {
                library: 'antd-mobile',
                module: 'es/[dash]',           
                style: 'style'           
            }]
        ]
    });
    
    expect(code).toMatchSnapshot();
});