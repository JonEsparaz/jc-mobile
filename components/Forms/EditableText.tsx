import React from 'react';
import { Input } from 'native-base';
import { Text } from 'react-native'

interface Props {
    value: string,
    isEditable: boolean,
    textStyle: any,
    inputStyle?: any,
    multiline: boolean,
    placeholder?: string,
    onChange?(string),
    "data-testid"?: any
}
interface State {
    // value: string,
    isEditable: boolean,
    // textStyle: any,
    //   inputStyle: any,
    //   multiline: boolean,
    //   placeholder: string,
    value: string
}
export default class EditableText extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            value: props.value,
            isEditable: props.isEditable,
            // textStyle: props.textStyle,
            // inputStyle: props.inputStyle,
            // multiline: props.multiline,
            // placeholder: props.placeholder

        }
        // console.log(props)
    }
    onChanged(val: any) {
        console.log(val)
        this.props.onChange(val)
    }
    render() {


        if (this.state.isEditable)
            return <Input data-testid={this.props["data-testid"]}

                onBlur={(val) => { this.onChanged(val.target.value) }}
                onSubmitEditing={(val) => { this.onChanged(val.target.value) }}
                onChange={(val) => { this.setState({ value: val.target.value }) }}



                //onChange={(value) => { this.onChanged(value) }}
                placeholder={this.props.placeholder}
                multiline={this.props.multiline}
                style={this.props.inputStyle} value={this.state.value}></Input>
        else
            return <Text style={this.props.textStyle}>{this.props.value}</Text>
    }
}