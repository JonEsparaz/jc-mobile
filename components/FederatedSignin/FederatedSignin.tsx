//import { Auth } from 'aws-amplify';
import React from 'react';
import { Button, View }  from "react-native"
//import * as Facebook from 'expo-facebook';
//import { Authenticator } from 'aws-amplify-react-native';
// To federated sign in from Facebook
interface Props{}
interface State{}
export default class FederatedSignin extends React.Component<Props,State> {
    constructor(props:Props) {
        super(props);
       
    }

    async login() {
 /*       try {
          const {
            type,
            token,
            expires,
            permissions,
            declinedPermissions,
          } = await Facebook.logInWithReadPermissionsAsync('579712102531269', {
            permissions: ['public_profile'],
          });
          if (type === 'success') {
            // Get the user's name using Facebook's Graph API
            const response = await fetch(`https://graph.facebook.com/me?access_token=${token}`);
            Alert.alert('Logged in!', `Hi ${(await response.json()).name}!`);
          } else {
            // type === 'cancel'
          }
        } catch ({ message }) {
          alert(`Facebook Login Error: ${message}`);
        }
        */
      }
    async signIn() {
      /*
        console.log('test');
        const { type, token, expires } = await Facebook.logInWithReadPermissionsAsync('579712102531269', {
            permissions: ['public_profile'],
          });
        if (type === 'success') {
          // sign in with federated identity
          console.log('Success');
          Auth.federatedSignIn('facebook', { token, expires_at: expires}, { name: 'USER_NAME' })
            .then(credentials => {
              console.log('get aws credentials', credentials);
            }).catch(e => {
              console.log(e);
            });
        }
        */
      }
    

    render() {
        return (
          <View>
                <Button onPress={this.login} title="Use Facebook Account"></Button>
                <Button onPress={this.login} title="Use Google Account"></Button>
           </View>
        );
    }
}