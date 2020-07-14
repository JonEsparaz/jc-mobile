import { Left, Body, StyleProvider, Card, CardItem, ListItem, Right, Container } from 'native-base';
import JCButton, { ButtonTypes } from '../../components/Forms/JCButton'
import ReactTooltip from "react-tooltip";
import * as React from 'react';
import { Text, Dimensions } from 'react-native'

import getTheme from '../../native-base-theme/components';
import { Image } from 'react-native'
import * as customQueries from '../../src/graphql-custom/queries';
import * as queries from '../../src/graphql/queries';
import * as mutations from '../../src/graphql/mutations';
import GRAPHQL_AUTH_MODE from 'aws-amplify-react-native'
import { API, Auth, Analytics } from 'aws-amplify';
import ProfileImage from '../../components/ProfileImage/ProfileImage'
import { TouchableOpacity } from 'react-native-gesture-handler';
import { constants } from '../../src/constants'
import ErrorBoundry from '../../components/ErrorBoundry'
import moment from 'moment-timezone';
import JCComponent, { JCState } from '../JCComponent/JCComponent';

interface Props {
  navigation: any
  wrap: boolean
  type: string
  showMore: boolean
  onDataload(mapData: MapData[]): void
  showMy?: boolean
}
interface State extends JCState {
  myFilter: boolean
  eventFilter: boolean
  myTitleScreen: string
  openSingle: string
  openMultiple: string
  type: string
  cardWidth: any
  createString: string
  titleString: string
  data: any
  showCreateButton: boolean
  currentUser: string
  nextToken: string
  canLeave: any
  isOwner: any
}
export interface MapData {
  latitude: any
  longitude: any
  name: string
  user?: any
  event?: any
  link: string
  type: any
}


export default class MyGroups extends JCComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    if (props.type == "event") {
      this.state = {
        ...super.getInitialState(),
        myFilter: false || this.props.showMy,
        eventFilter: false,
        myTitleScreen: "My Events",
        openSingle: "EventScreen",
        openMultiple: "EventsScreen",
        createString: "+ Create Event",
        titleString: "Events",
        type: props.type,
        cardWidth: 350,
        data: null,
        showCreateButton: false,
        currentUser: null,
        nextToken: null,
        canLeave: [],
        isOwner: []
      }

    }
    else if (props.type == "group") {
      this.state =
      {
        ...super.getInitialState(),
        myFilter: false || this.props.showMy,
        eventFilter: false,
        myTitleScreen: "My Groups",
        openSingle: "GroupScreen",
        openMultiple: "GroupsScreen",
        createString: "+ Create Group",
        titleString: "Groups",
        type: props.type,
        cardWidth: 350,
        data: [],
        showCreateButton: false,
        currentUser: null,
        nextToken: null,
        canLeave: [],
        isOwner: []
      }
    }
    else if (props.type == "resource") {
      this.state =
      {
        ...super.getInitialState(),
        myFilter: false,
        eventFilter: false,
        myTitleScreen: "My Resources",
        openSingle: "ResourceScreen",
        openMultiple: "ResourcesScreen",
        createString: "+ Create Resource",
        titleString: "Resources",
        type: props.type,
        cardWidth: 200,
        data: [],
        showCreateButton: false,
        currentUser: null,
        nextToken: null,
        canLeave: [],
        isOwner: []
      }

    }
    else if (props.type == "organization") {
      this.state =
      {
        ...super.getInitialState(),
        myFilter: false,
        eventFilter: false,
        myTitleScreen: "My Organizations",
        openSingle: "OrganizationScreen",
        openMultiple: "OrganizationsScreen",
        createString: "+ Create Organization",
        titleString: "Organizations",
        type: props.type,
        cardWidth: 200,
        data: [],
        showCreateButton: false,
        currentUser: null,
        nextToken: null,
        canLeave: [],
        isOwner: []
      }

    }
    else if (props.type == "course") {
      this.state =
      {
        ...super.getInitialState(),
        myFilter: false,
        eventFilter: false,
        myTitleScreen: "My Courses",
        openSingle: "CourseOverviewScreen",
        openMultiple: "CoursesScreen",
        createString: "+ Create Course",
        titleString: "Courses",
        type: props.type,
        cardWidth: 200,
        data: [],
        showCreateButton: false,
        currentUser: null,
        nextToken: null,
        canLeave: [],
        isOwner: []
      }

    }
    else if (props.type == "profile") {
      this.state =
      {
        ...super.getInitialState(),
        myFilter: false,
        eventFilter: false,
        myTitleScreen: "My Profiles",
        openSingle: "ProfileScreen",
        openMultiple: "ProfilesScreen",
        createString: "+ Create Profile",
        titleString: "Profiles",
        type: props.type,
        cardWidth: 200,
        data: [],
        showCreateButton: false,
        currentUser: null,
        nextToken: null,
        canLeave: [],
        isOwner: []
      }

    }
    else {
      this.state =
      {
        ...super.getInitialState(),
        myTitleScreen: "",
        myFilter: false,
        eventFilter: false,
        openSingle: "",
        openMultiple: "",
        type: props.type,
        titleString: "",
        createString: "",
        cardWidth: 300,
        data: [],
        showCreateButton: false,
        currentUser: null,
        nextToken: null,
        canLeave: [],
        isOwner: [],
      }
    }

  }
  componentDidMount(): void {
    this.setInitialData(this.props)
    const user = Auth.currentAuthenticatedUser();
    user.then((user: any) => {
      this.setState({ currentUser: user.username })
      if (this.props.type != "profile")
        this.setState({ showCreateButton: user.signInUserSession.accessToken.payload["cognito:groups"].includes("verifiedUsers") })
    })
  }
  convertProfileToMapData(data: any): MapData[] {
    return data.map((dataItem) => {
      if (dataItem.location && dataItem.location.latitude && dataItem.location.longitude)
        return {
          latitude: dataItem.location.latitude,
          longitude: dataItem.location.longitude,
          name: dataItem.given_name + " " + dataItem.family_name,
          user: dataItem,
          link: "",
          type: "profile"
        } as MapData
      else return null
    }).filter(o => o)
  }

  convertEventToMapData(data: any): MapData[] {
    return data.map((dataItem) => {
      if (dataItem && dataItem.locationLatLong && dataItem.locationLatLong.latitude && dataItem.locationLatLong.longitude && moment(dataItem.time).isAfter(moment().subtract(3, 'day')))
        return {
          latitude: dataItem.locationLatLong.latitude,
          longitude: dataItem.locationLatLong.longitude,
          name: dataItem.name,
          event: dataItem,
          link: "",
          type: "event"
        } as MapData
      else return null
    }).filter(o => o)
  }
  convertToMapData(data: any): MapData[] {
    switch (this.state.type) {
      case "group":
        return []
      case "event":
        return this.convertEventToMapData(data)
      case "resource":
        return []
      case "organization":
        return []
      case "course":
        return []
      case "profile":
        return this.convertProfileToMapData(data)
    }

  }
  setInitialData(props: Props): void {
    if (props.type == "profile") {
      const listUsers: any = API.graphql({
        query: queries.listUsers,
        variables: { limit: 20, filter: { profileState: { eq: "Complete" } }, nextToken: this.state.nextToken },
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS
      });
      const processList = (json) => {
        //console.log({ profile: json })

        let temp: any[]
        if (this.state.data)
          temp = [...this.state.data, ...json.data.listUsers.items]
        else
          temp = [...json.data.listUsers.items]
        this.setState({
          data: temp,
          nextToken: json.data.listUsers.nextToken
        }, () => { this.props.onDataload(this.convertToMapData(this.state.data)) })
      }
      listUsers.then(processList).catch(processList)
    }
    else {
      const listGroup: any = API.graphql({
        query: customQueries.groupByTypeForMyGroups,
        variables: { limit: 20, type: props.type, nextToken: this.state.nextToken },
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS
      });

      const processList = (json) => {
        //console.log({ profile: json })
        this.setCanLeave(json.data.groupByType.items)
        this.setIsOwner(json.data.groupByType.items)
        let temp: any[]
        if (this.state.data)
          temp = [...this.state.data, ...json.data.groupByType.items]
        else
          temp = [...json.data.groupByType.items]
        this.setState({
          data: temp,
          nextToken: json.data.groupByType.nextToken
        }, async () => { this.props.onDataload(this.convertToMapData(this.state.data)) })
      }
      listGroup.then(processList).catch(processList)
    }
  }
  openSingle(id: string): void {
    console.log({ "Navigate to": this.state.openSingle })
    // console.log(id)
    this.props.navigation.push(this.state.openSingle, { id: id, create: false })
  }
  createSingle(): void {
    console.log({ "Navigate to": this.state.openSingle })
    this.props.navigation.push(this.state.openSingle, { create: true })
  }
  openMultiple(): void {
    console.log({ "Navigate to": this.state.openMultiple })
    this.props.navigation.push(this.state.openMultiple);
  }
  async setCanLeave(data: any): Promise<void> {
    data.forEach((item: any) => {
      const groupMemberByUser: any = API.graphql({
        query: queries.groupMemberByUser,
        variables: { userID: this.state.currentUser, groupID: { eq: item.id } },
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS
      });
      groupMemberByUser.then((json: any) => {
        // console.log({ "groupMemberByUser": json })
        if (json.data.groupMemberByUser.items.length > 0) {
          this.setState({ canLeave: this.state.canLeave.concat([item.id]) })
        }
      }).catch((err: any) => {
        console.log({ "Error query.groupMemberByUser": err });
      });
    });
  }

  async setIsOwner(data: any): Promise<void> {
    data.forEach((item: any) => {
      const getGroup: any = API.graphql({
        query: customQueries.getGroupForOwner,
        variables: { id: item.id },
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS
      });
      getGroup.then((json: any) => {
        if (json.data.getGroup.owner === this.state.currentUser) {
          this.setState({ isOwner: this.state.isOwner.concat([item.id]) })
        }
      }).catch((err: any) => {
        console.log({ "Error query.getGroup": err });
      });
    });
  }
  canLeave(id: string): boolean {
    const test = this.state.canLeave.filter((elem) => elem === id)
    if (test.length > 0)
      return true
    else
      return false
  }
  canJoin(id: string): boolean {
    const test = this.state.canLeave.filter((elem) => elem === id)
    if (test.length > 0)
      return false
    else
      return true
  }
  isOwner(id: string): boolean {
    const test = this.state.isOwner.filter((elem) => elem === id)
    if (test.length > 0)
      return true
    else
      return false
  }

  join(group: any, groupType: any): void {
    Analytics.record({
      name: 'joined' + groupType,
      // Attribute values must be strings
      attributes: { id: group.id, name: group.name }
    });

    const createGroupMember: any = API.graphql({
      query: mutations.createGroupMember,
      variables: { input: { groupID: group.id, userID: this.state.currentUser } },
      authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS
    });
    createGroupMember.then((json: any) => {
      console.log({ "Success mutations.createGroupMember": json });
    }).catch((err: any) => {
      console.log({ "Error mutations.createGroupMember": err });
    });

    this.setState({ canLeave: this.state.canLeave.concat([group.id]) })
    this.renderByType(group, groupType)
  }
  openConversation(initialUser: string, name: string): void {
    console.log("Navigate to conversationScreen")
    this.props.navigation.push("ConversationScreen", { initialUserID: initialUser, initialUserName: name });
  }
  leave(group: any, groupType: any): void {
    Analytics.record({
      name: 'left' + groupType,
      // Attribute values must be strings
      attributes: { id: group.id, name: group.name }
    });
    const groupMemberByUser: any = API.graphql({
      query: queries.groupMemberByUser,
      variables: { userID: this.state.currentUser, groupID: { eq: group.id } },
      authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS
    });
    groupMemberByUser.then((json: any) => {
      console.log({ "Success queries.groupMemberByUser": json });

      json.data.groupMemberByUser.items.map((item) => {
        const deleteGroupMember: any = API.graphql({
          query: mutations.deleteGroupMember,
          variables: { input: { id: item.id } },
          authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS
        });
        deleteGroupMember.then((json: any) => {

          console.log({ "Success mutations.deleteGroupMember": json });
        }).catch((err: Error) => {
          console.log({ "Error mutations.deleteGroupMember": err });
        });
      })

      const index = this.state.canLeave.indexOf(group.id)
      const canLeave = this.state.canLeave
      canLeave.splice(index, 1)
      this.setState({ canLeave: canLeave })
      this.renderByType(group, groupType)

    }).catch((err: Error) => {
      console.log({ "Error queries.groupMemberByUser": err });
    });

  }

  renderByType(item: any, type: string): React.ReactNode {
    switch (type) {
      case "group":
        return this.renderGroup(item)
      case "event":
        return this.renderEvent(item)
      case "resource":
        return this.renderResource(item)
      case "organization":
        return this.renderOrganization(item)
      case "course":
        return this.renderCourse(item)
      case "profile":
        return this.renderProfile(item)
    }
  }

  renderGroup(item: any): React.ReactNode {
    return <Card style={[this.styles.style.groupCard, { width: this.state.cardWidth }]} >
      <CardItem bordered style={{ paddingLeft: 0, paddingRight: 0, paddingTop: 0, paddingBottom: 0, width: this.state.cardWidth, right: 5 }} >
        <Image style={{ margin: 0, padding: 0, width: this.state.cardWidth, height: 70 }} source={require('../../assets/svg/pattern.svg')}></Image>
      </CardItem>
      {item.name.length > 54 || item.name.length == 54 ?
        <CardItem style={{ height: 100 }}><Text ellipsizeMode='tail' numberOfLines={3} style={this.styles.style.fontTitleGroup} data-tip={item.name}>{item.name}</Text>
          <ReactTooltip place="top" type="dark" effect="solid" backgroundColor="#F0493E" />
        </CardItem>
        : <CardItem style={{ height: 100 }}><Text ellipsizeMode='tail' numberOfLines={3} style={this.styles.style.fontTitleGroup}>{item.name}</Text>
        </CardItem>}
      <CardItem style={{ height: 100 }}><Text ellipsizeMode='tail' numberOfLines={3} style={this.styles.style.fontDetailMiddle}>{item.description}</Text></CardItem>
      {constants.SETTING_ISVISIBLE_MEMBER_COUNT ?
        <CardItem>
          <Image style={{ width: "22px", height: "22px", marginRight: 5 }} source={require('../../assets/svg/user.svg')}></Image>
          <Text ellipsizeMode='tail' numberOfLines={1} style={this.styles.style.fontDetailBottom}>Members: {item.memberCount}</Text>
        </CardItem>
        : null}
      {this.canJoin(item.id) && !this.isOwner(item.id) ? <CardItem ><JCButton buttonType={ButtonTypes.Solid} onPress={() => { this.join(item, "Group") }}>Join</JCButton><Right></Right></CardItem> : null}
      {this.canLeave(item.id) && !this.isOwner(item.id) ? <CardItem ><JCButton buttonType={ButtonTypes.Solid} onPress={() => { this.leave(item, "Group") }}>Leave</JCButton><Right></Right></CardItem> : null}
      {this.isOwner(item.id) ? <CardItem ><JCButton buttonType={ButtonTypes.Solid} onPress={() => null}>Owner</JCButton><Right></Right></CardItem> : null}
    </Card >
  }
  renderProfile(item: any): React.ReactNode {
    return <Card key={item.id} style={this.styles.style.profilesCard}>
      <CardItem style={this.styles.style.profileCard}>
        <Left style={{ paddingTop: 20 }}>
          <ProfileImage user={item} size="small"></ProfileImage>
          <Body>
            <Text style={this.styles.style.fontConnectWithName}>{item.given_name} {item.family_name}</Text>
            <Text style={this.styles.style.fontConnectWithRole}>{item.currentRole}</Text>
            <JCButton buttonType={ButtonTypes.OutlineSmall} onPress={() => { this.openConversation(item.id, item.user.given_name + " " + item.user.family_name) }}>Start Conversation</JCButton>
          </Body>
        </Left>
      </CardItem>
    </Card>
  }
  renderEvent(item: any): React.ReactNode {
    const zone = moment.tz.guess()
    return <Card style={[this.styles.style.eventCard, { width: this.state.cardWidth }]}>
      <CardItem ><Text ellipsizeMode='tail' numberOfLines={1} style={this.styles.style.fontDetailTop}>{moment.tz(item.time, zone).format('ddd, MMM D, h:mm a')} {moment.tz.zone(zone).abbr(+moment(item.time).format('x'))}</Text></CardItem>
      {item.name.length > 54 || item.name.length == 54 ?
        <CardItem style={{ height: 60, marginTop: 8 }}><Text ellipsizeMode='tail' numberOfLines={3} style={this.styles.style.fontTitle} data-tip={item.name}>{item.name}</Text>
          <ReactTooltip place="top" type="dark" effect="solid" backgroundColor="#F0493E" />
        </CardItem>
        : <CardItem style={{ height: 60, marginTop: 8 }}><Text ellipsizeMode='tail' numberOfLines={3} style={this.styles.style.fontTitle}>{item.name}</Text>
        </CardItem>
      }
      <CardItem style={{ height: 80 }}><Text ellipsizeMode='tail' numberOfLines={3} style={this.styles.style.fontDetailMiddle}>{item.description}</Text></CardItem>

      <CardItem>
        <Image style={{ width: "22px", height: "22px", marginRight: 5 }} source={require('../../assets/svg/pin 2.svg')}></Image>
        {item.eventType == "location" ?
          <Text ellipsizeMode='tail' numberOfLines={1} style={this.styles.style.fontDetailBottom}><a target="_blank" rel="noreferrer" href={"https://www.google.com/maps/dir/?api=1&destination=" + escape(item.location)}>{item.location}</a></Text>
          : item.eventType == "eventbrite" ?
            <Text ellipsizeMode='tail' numberOfLines={1} style={this.styles.style.fontDetailBottom}><a target="_blank" rel="noreferrer" href={item.eventUrl}>Eventbrite</a></Text>
            : <Text ellipsizeMode='tail' numberOfLines={1} style={this.styles.style.fontDetailBottom}><a target="_blank" rel="noreferrer" href={item.eventUrl}>Zoom</a></Text>
        }
      </CardItem>
      {this.canJoin(item.id) && !this.isOwner(item.id) ? <CardItem ><JCButton buttonType={ButtonTypes.Solid} onPress={() => { this.join(item, "Event") }}>Attend</JCButton><Right></Right></CardItem> : null}
      {this.canLeave(item.id) && !this.isOwner(item.id) ? <CardItem ><JCButton buttonType={ButtonTypes.Solid} onPress={() => { this.leave(item, "Event") }}>Don&apos;t Attend</JCButton><Right></Right></CardItem> : null}
      {this.isOwner(item.id) ? <CardItem ><JCButton buttonType={ButtonTypes.Solid} onPress={() => null}>Owner</JCButton><Right></Right></CardItem> : null}
    </Card>
  }
  renderResource(item: any): React.ReactNode {
    return <Card style={[this.styles.style.resourceCard, { width: this.state.cardWidth }]}>
      <CardItem bordered style={{ paddingLeft: 0, paddingRight: 0, paddingTop: 0, paddingBottom: 0, width: this.state.cardWidth, right: 5 }}>
        <Image style={{ margin: 0, padding: 0, width: this.state.cardWidth, height: 70 }} source={require('../../assets/svg/pattern.svg')}></Image>
      </CardItem>
      {item.name.length > 17 || item.name.length == 17 ?
        <CardItem ><Text ellipsizeMode='tail' numberOfLines={3} style={this.styles.style.fontTitleGroup} data-tip={item.name}>{item.name}</Text>
          <ReactTooltip place="top" type="dark" effect="solid" backgroundColor="#F0493E" /></CardItem>
        : <CardItem ><Text ellipsizeMode='tail' numberOfLines={3} style={this.styles.style.fontTitleGroup}>{item.name}</Text></CardItem>}
      <CardItem ><Text ellipsizeMode='tail' numberOfLines={1} style={this.styles.style.fontDetailMiddle}>Last Updated: {item.lastupdated}</Text></CardItem>
      {this.canJoin(item.id) && !this.isOwner(item.id) ? <CardItem ><JCButton buttonType={ButtonTypes.Solid} onPress={() => { this.join(item, "Resource") }}>Join</JCButton><Right></Right></CardItem> : null}
      {this.canLeave(item.id) && !this.isOwner(item.id) ? <CardItem ><JCButton buttonType={ButtonTypes.Solid} onPress={() => { this.leave(item, "Resource") }}>Leave</JCButton><Right></Right></CardItem> : null}
      {this.isOwner(item.id) ? <CardItem ><JCButton buttonType={ButtonTypes.Solid} onPress={() => null}>Owner</JCButton><Right></Right></CardItem> : null}
    </Card>
  }
  renderOrganization(item: any): React.ReactNode {
    return <Card style={[this.styles.style.orgCard, { width: this.state.cardWidth }]}>
      <CardItem bordered style={{ paddingLeft: 0, paddingRight: 0, paddingTop: 0, paddingBottom: 0 }}>
        <Image style={{ margin: 0, padding: 0, width: this.state.cardWidth, height: 20 }} source={require('../../assets/svg/pattern.svg')}></Image>
      </CardItem>
      <CardItem ><Text ellipsizeMode='tail' numberOfLines={3} style={this.styles.style.fontTitle}>{item.name}</Text></CardItem>
      <CardItem ><Text ellipsizeMode='tail' numberOfLines={1} style={this.styles.style.fontDetail}>{item.kind}</Text></CardItem>
      {true ? <CardItem ><JCButton buttonType={ButtonTypes.Solid} onPress={() => { this.join(item, "Organization") }}>Join</JCButton><Right></Right></CardItem> : null}
      {false ? <CardItem ><JCButton buttonType={ButtonTypes.Solid} onPress={() => { this.leave(item, "Organization") }}>Leave</JCButton><Right></Right></CardItem> : null}
    </Card>
  }
  renderCourse(item: any): React.ReactNode {
    return <Card style={[this.styles.style.courseCard, { width: this.state.cardWidth }]}>
      <CardItem bordered style={{ paddingLeft: 0, paddingRight: 0, paddingTop: 0, paddingBottom: 0, width: this.state.cardWidth, right: 5 }}>
        <Image style={{ margin: 0, padding: 0, width: this.state.cardWidth, height: 70 }} source={require('../../assets/svg/pattern.svg')}></Image>
      </CardItem>
      <CardItem ><Text ellipsizeMode='tail' numberOfLines={3} style={this.styles.style.fontTitleGroup}>{item.name}</Text></CardItem>
      <CardItem ><Text ellipsizeMode='tail' numberOfLines={1} style={this.styles.style.fontDetail}>Last Updated: {item.lastupdated}</Text></CardItem>
      {true ? <CardItem ><JCButton buttonType={ButtonTypes.Solid} onPress={() => { this.join(item, "Course") }}>Join</JCButton><Right></Right></CardItem> : null}
      {false ? <CardItem ><JCButton buttonType={ButtonTypes.Solid} onPress={() => { this.leave(item, "Course") }}>Leave</JCButton><Right></Right></CardItem> : null}
    </Card>
  }
  filterMy = (item: any): boolean => {
    return !this.state.myFilter || this.canLeave(item.id) || this.isOwner(item.id)
  }
  filterEvent = (item: any): boolean => {
    return !(this.props.type === "event") ||
      this.state.eventFilter && !moment(item.time).isSameOrAfter(moment.now()) ||
      !this.state.eventFilter && moment(item.time).isSameOrAfter(moment.now())
  }
  render(): React.ReactNode {
    const deviceWidth = Dimensions.get('window').width;

    if (!constants["SETTING_ISVISIBLE_" + this.state.type])
      return null
    else if (this.state.type == "course" && !this.isMemberOf("courseUser")) {
      return null
    }
    else
      if (this.state.titleString == null)
        return null
      else
        return (
          <ErrorBoundry>
            <StyleProvider style={getTheme()}>

              <Container style={{ padding: 10, minHeight: 525, width: "100%", flexDirection: 'column', justifyContent: 'flex-start' }}>
                <Container style={this.styles.style.sectionHeadingDashboard} >
                  <JCButton buttonType={ButtonTypes.TransparentBoldBlack} onPress={() => { this.openMultiple() }}>{this.state.titleString}</JCButton>
                  <Container style={{ maxHeight: 45, flexDirection: 'row', justifyContent: 'flex-end', alignItems: "flex-start" }}>
                    <JCButton buttonType={ButtonTypes.TransparentBoldOrange} data-testid={"mygroup-showall-" + this.state.titleString} onPress={() => { this.openMultiple() }}>Show All</JCButton>
                    {constants["SETTING_ISVISIBLE_SHOWRECOMMENDED"] ? <JCButton buttonType={ButtonTypes.TransparentBoldOrange} data-testid={"mygroup-recommmended-" + this.state.titleString} onPress={() => { this.openMultiple() }}>Show Recommended</JCButton> : null}
                    {constants["SETTING_ISVISIBLE_SHOWMYFILTER"] ? <JCButton buttonType={ButtonTypes.TransparentBoldOrange} data-testid={"mygroup-showmyfilter-" + this.state.titleString} onPress={() => { this.setState({ myFilter: !this.state.myFilter }) }}>{this.state.myTitleScreen}</JCButton> : null}
                    {constants["SETTING_ISVISIBLE_SHOWEVENTFILTER"] && this.props.type == "event" && deviceWidth >= 720 ? <JCButton buttonType={ButtonTypes.TransparentBoldOrange} data-testid={"mygroup-showeventfilter-" + this.state.titleString} onPress={() => { this.setState({ eventFilter: !this.state.eventFilter }) }}>{this.state.eventFilter ? "Upcoming Events" : "Previous Events"}</JCButton> : null}
                    {this.state.showCreateButton && constants["SETTING_ISVISIBLE_CREATE_" + this.state.type] ?
                      <JCButton buttonType={ButtonTypes.OutlineBold} data-testid={"mygroup-create-" + this.state.titleString} onPress={() => { this.createSingle() }}>{deviceWidth < 720 ? "+" : this.state.createString}</JCButton>
                      : null
                    }
                  </Container>
                </Container>

                <Container style={(this.props.wrap && this.props.type != "profile") ? this.styles.style.ResourcesMyGroupsWrap : (this.props.wrap && this.props.type == "profile") ? this.styles.style.profileMyGroupsWrap : this.styles.style.ResourcesMyGroupsNoWrap}>
                  {this.state.data ?
                    this.state.data.filter(this.filterMy).filter(this.filterEvent).length > 0 ?
                      this.state.data.filter(this.filterMy).filter(this.filterEvent).map((item, index) => {

                        return (
                          <ErrorBoundry key={index}>
                            <ListItem noBorder style={this.styles.style.conversationsCard} button onPress={() => { this.openSingle(item.id) }}>
                              {this.renderByType(item, this.state.type)}
                            </ListItem>
                          </ErrorBoundry>
                        )
                      })
                      : <Text style={this.styles.style.noCardFontTitle}>No {this.state.type == "event" ? this.state.eventFilter ? "previous " : "upcoming " : ""}{this.state.type}s</Text>
                    : <Text style={this.styles.style.loadingFontTitle}>Loading {this.state.type}s</Text>
                  }
                  {this.state.nextToken ?
                    this.props.showMore ?
                      <TouchableOpacity style={{ top: 15, height: 80 }} onPress={() => { this.setInitialData(this.props) }} >
                        <Card style={[this.styles.style.groupMoreCard, { width: this.state.cardWidth }]}>
                          <CardItem style={{ backgroundColor: "none", alignItems: "center" }}  ><Text ellipsizeMode='tail' numberOfLines={3} style={this.styles.style.conversationsLoadMoreFont}>Load more...</Text></CardItem>
                        </Card>
                      </TouchableOpacity>
                      : null
                    : null}
                </Container>
              </Container>
            </StyleProvider>
          </ErrorBoundry>
        )
  }
}