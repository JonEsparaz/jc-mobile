import React from 'react';

import SignUpSidebar from '../../components/SignUpSidebar/SignUpSidebar'
import { Platform, TextInput, Text, NativeSyntheticEvent, TextInputKeyPressEventData, TouchableOpacity, ActivityIndicator } from 'react-native';
import { View } from 'native-base';
import JCButton, { ButtonTypes } from '../../components/Forms/JCButton';
import { Dimensions } from 'react-native'
import MainStyles from '../../components/style';
import { Auth } from 'aws-amplify';
import { Entypo } from '@expo/vector-icons';
import { Copyright } from './Copyright';

interface Props {
    authState: string;
    onStateChange(state: string): any;
}

interface State {
    email: string;
    authError: string;
    codeSent: boolean;
    code: string;
    newPass: string;
    newPass2: string;
    sendingCode: boolean;
    reseting: boolean;
}

class MyForgotPassword extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            email: '',
            authError: '',
            codeSent: false,
            code: '',
            newPass: '',
            newPass2: '',
            sendingCode: false,
            reseting: false,
        }
    }

    changeAuthState(state: string): void {
        this.setState({
            email: '',
            authError: '',
            codeSent: false,
            code: '',
            newPass: '',
            newPass2: '',
            sendingCode: false,
            reseting: false,
        })
        this.props.onStateChange(state);
    }

    async sendCode(): Promise<void> {
        try {
            this.setState({ sendingCode: true })
            await Auth.forgotPassword(this.state.email.toLowerCase()).then(() => this.setState({ codeSent: true }))
        } catch (e) {
            this.setState({ authError: e.message, sendingCode: false })
        }
    }

    async resetPass(): Promise<void> {
        try {
            if (this.state.newPass !== this.state.newPass2) {
                this.setState({ authError: 'Passwords do not match' })
                return;
            }
            this.setState({ reseting: true })
            await Auth.forgotPasswordSubmit(this.state.email.toLowerCase(), this.state.code, this.state.newPass).then(() => { this.changeAuthState('signIn') });
        } catch (e) {
            this.setState({ authError: e.message, reseting: false })
        }
    }

    handleEnter(keyEvent: NativeSyntheticEvent<TextInputKeyPressEventData>): void {
        if (keyEvent.nativeEvent.key === 'Enter') {
            if (this.state.codeSent) {
                this.resetPass();
            } else {
                this.sendCode();
            }
        }
    }

    styles: MainStyles = MainStyles.getInstance();
    componentDidMount(): void {
        Dimensions.addEventListener('change', () => { this.styles.updateStyles(this) })
    }
    componentWillUnmount(): void {
        Dimensions.removeEventListener("change", () => { this.styles.updateStyles(this) });
    }
    render(): React.ReactNode {
        return (
            this.props.authState === 'forgotPassword' ?
                (<View style={{ width: "100%", left: 0, top: 0, height: "100%" }}>
                    <View style={this.styles.style.signUpBackButtonWrapper} >
                        <TouchableOpacity onPress={() => { this.changeAuthState('signIn') }}>
                            <Text style={{ alignSelf: 'flex-end', marginRight: 30, fontSize: 20, fontFamily: 'Graphik-Regular-App', lineHeight: 24, color: '#333333' }}><Entypo name="chevron-left" size={20} color="#333333" />Back</Text>
                        </TouchableOpacity>
                    </View>
                    {!this.state.codeSent ? <View style={this.styles.style.authView2}>
                        <Text style={{ width: "100%", marginBottom: '5.5%', fontFamily: 'Graphik-Regular-App', fontWeight: 'bold', fontSize: 22, lineHeight: 30 }}>Reset your password</Text>
                        <TextInput autoCompleteType="email" textContentType="emailAddress" keyboardType="email-address" onKeyPress={(e) => this.handleEnter(e)} placeholder="Enter your email" value={this.state.email} onChange={e => this.setState({ email: e.nativeEvent.text })} secureTextEntry={false} style={{ borderBottomWidth: 1, borderColor: "#00000020", width: "100%", marginBottom: '4.2%', paddingTop: 10, paddingRight: 10, paddingBottom: 10, paddingLeft: 5, fontFamily: 'Graphik-Regular-App', fontSize: 18, lineHeight: 24 }}></TextInput>
                        <JCButton buttonType={ButtonTypes.SolidSignIn} onPress={() => this.sendCode()}>{this.state.sendingCode ? <ActivityIndicator animating color="#333333" /> : 'Send'}</JCButton>
                        <TouchableOpacity onPress={() => this.setState({ codeSent: true, authError: '' })}>
                            <Text style={{ alignSelf: 'flex-end', marginRight: 30, fontSize: 14, fontFamily: 'Graphik-Regular-App', lineHeight: 22, color: '#333333', opacity: 0.7, marginTop: 20 }}>Submit a code</Text>
                        </TouchableOpacity>
                        <Text style={{ alignSelf: 'center', alignItems: 'center', fontSize: 14, fontFamily: 'Graphik-Regular-App', lineHeight: 22, marginTop: 20 }} >{this.state.authError ? <Entypo name="warning" size={18} color="#F0493E" /> : null} {this.state.authError}</Text>
                        <Copyright />
                    </View>
                        : <View style={this.styles.style.authView2}>
                            <Text style={{ width: "100%", marginBottom: '5.5%', fontFamily: 'Graphik-Regular-App', fontWeight: 'bold', fontSize: 22, lineHeight: 30 }}>Reset your password</Text>
                            <TextInput autoCompleteType="email" textContentType="emailAddress" keyboardType="email-address" placeholder="Enter your email" value={this.state.email} onChange={e => this.setState({ email: e.nativeEvent.text })} secureTextEntry={false} style={{ borderBottomWidth: 1, borderColor: "#00000020", width: "100%", marginBottom: '1.4%', paddingTop: 10, paddingRight: 10, paddingBottom: 10, paddingLeft: 5, fontFamily: 'Graphik-Regular-App', fontSize: 18, lineHeight: 24 }}></TextInput>
                            <TextInput textContentType="oneTimeCode" keyboardType="number-pad" placeholder="One-time security code" value={this.state.code} onChange={e => this.setState({ code: e.nativeEvent.text })} secureTextEntry={false} style={{ borderBottomWidth: 1, borderColor: "#00000020", width: "100%", marginBottom: '5.5%', paddingTop: 10, paddingRight: 10, paddingBottom: 10, paddingLeft: 5, fontFamily: 'Graphik-Regular-App', fontSize: 18, lineHeight: 24 }}></TextInput>
                            <View style={{ display: 'flex', flexDirection: 'row', marginBottom: '5.5%', }}>
                                <TextInput textContentType="newPassword" onKeyPress={(e) => this.handleEnter(e)} placeholder="New password" value={this.state.newPass} onChange={e => this.setState({ newPass: e.nativeEvent.text })} secureTextEntry={true} style={{ borderBottomWidth: 1, borderColor: "#00000020", width: "100%", marginRight: 30, paddingTop: 10, paddingRight: 10, paddingBottom: 10, paddingLeft: 5, fontFamily: 'Graphik-Regular-App', fontSize: 18, lineHeight: 24 }}></TextInput>
                                <TextInput textContentType="newPassword" onKeyPress={(e) => this.handleEnter(e)} placeholder="Confirm new password" value={this.state.newPass2} onChange={e => this.setState({ newPass2: e.nativeEvent.text })} secureTextEntry={true} style={{ borderBottomWidth: 1, borderColor: "#00000020", width: "100%", paddingTop: 10, paddingRight: 10, paddingBottom: 10, paddingLeft: 5, fontFamily: 'Graphik-Regular-App', fontSize: 18, lineHeight: 24 }}></TextInput>
                            </View>
                            <JCButton buttonType={ButtonTypes.SolidSignIn} onPress={() => this.resetPass()}>{this.state.reseting ? <ActivityIndicator animating color="#333333" /> : 'Submit'}</JCButton>
                            <Text style={{ alignSelf: 'center', alignItems: 'center', fontSize: 14, fontFamily: 'Graphik-Regular-App', lineHeight: 22, marginTop: 20 }} >{this.state.authError ? <Entypo name="warning" size={18} color="#F0493E" /> : null} {this.state.authError}</Text>
                            <Copyright />
                        </View>}
                    {Platform.OS === 'web' && Dimensions.get('window').width > 720 ? <SignUpSidebar text="It’s time to unite, equip, and amplify a Jesus-centred movement." /> : null}
                </View>)
                : null
        );
    }
}
export default MyForgotPassword 