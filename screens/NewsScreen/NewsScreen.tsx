﻿import React from 'react';
import Amplify from 'aws-amplify';
import awsConfig from '../../src/aws-exports';
Amplify.configure(awsConfig);

import { Container } from 'native-base';

import Header from '../../components/Header/Header'
import { NavigationScreenProp } from 'react-navigation';
interface Props {
  navigation: NavigationScreenProp<any, any>
}
interface State {

}
export default class NewsScreen extends React.Component<Props, State>{

  render() {
    // const { navigate } = this.props.navigation;
    return (
      <Container>
        <Header title="News" navigation={this.props.navigation} />


      </Container>

    );
  }
}