﻿import React from 'react';
import { Container, Content, Text, Footer } from 'native-base';
import Header from '../../components/Header/Header'
import FooterJC from '../../components/Footer/Footer'
import MyMap from '../../components/MyMap/MyMap';
import MyConversations from '../../components/MyConversations/MyConversations';
import MyGroups from '../../components/MyGroups/MyGroups';
import MyPeople from '../../components/MyPeople/MyPeople';
interface Props {
  navigation: any
}
interface State {
  showMap: boolean
}


export default class HomeScreen extends React.Component<Props, State>{
  constructor(props: Props) {
    super(props);
    this.state = {
      showMap: false
    }
  }
  mapChanged = () => {
    this.setState({ showMap: !this.state.showMap })
  }

  render() {
    console.log("Homepage")
    return (
      <Container >
        <Header title="Jesus Collective" navigation={this.props.navigation} onMapChange={this.mapChanged} />
        <MyMap navigation={this.props.navigation} visible={this.state.showMap}></MyMap>

        <Container style={{ flexGrow: 1, overflow: "scroll" }}>
          <Container style={{display: "block"}}>
            <Container style={{ height:2000,flex: 1, display: "flex", flexDirection: "row" }}>
              <Container style={{ flex: 70, flexDirection: "column" }}>
                <MyGroups type="event" wrap={false} navigation={this.props.navigation}></MyGroups>
                <MyGroups type="group" wrap={false} navigation={this.props.navigation}></MyGroups>
                <MyGroups type="resource" wrap={false} navigation={this.props.navigation}></MyGroups>
                <MyGroups type="organization" wrap={false} navigation={this.props.navigation}></MyGroups>
                <MyGroups type="course" wrap={false} navigation={this.props.navigation}></MyGroups>
              </Container>
              <Container style={{ flex: 30, flexDirection: "column" }}>
                <MyPeople wrap={false} navigation={this.props.navigation}></MyPeople>
                <MyConversations navigation={this.props.navigation}> </MyConversations>
                <Container style={{ flex: 10 }}></Container>
              </Container>
            </Container>

           
          <FooterJC title="Jesus Collective" navigation={this.props.navigation} ></FooterJC>

          </Container>

        </Container>



      </Container>
    );
  }
}