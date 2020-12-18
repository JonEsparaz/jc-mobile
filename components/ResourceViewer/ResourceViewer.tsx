import {} from "@material-ui/core"
import { useNavigation, useRoute } from "@react-navigation/native"
import Amplify, { Analytics, API, Auth, graphqlOperation, Storage } from "aws-amplify"
import GRAPHQL_AUTH_MODE from "aws-amplify-react-native"
import { convertToRaw, EditorState } from "draft-js"
import { Container, Content } from "native-base"
import * as React from "react"
import {
  CreateResourceMenuItemMutationResult,
  CreateResourceRootMutationResult,
  DeleteResourceMenuItemMutationResult,
  GetGroupQueryResult,
  GetGroupQueryResultPromise,
  GetResourceRootQueryResult,
  GetResourceRootQueryResultPromise,
  GetUserQueryResult,
  GetUserQueryResultPromise,
  GroupMemberByUserQueryResult,
  GroupMemberByUserQueryResultPromise,
  ListResourceRootsQueryResult,
  ListResourceRootsQueryResultPromise,
  PageItemIndex,
  UpdateResourceMenuItemMutationResult,
} from "src/types"
import {
  CreateGroupInput,
  CreateResourceEpisodeInput,
  CreateResourceInput,
  CreateResourceMenuItemInput,
  CreateResourceRootInput,
  CreateResourceSeriesInput,
  ResourceMenuItemType,
  ResourcePageItemInput,
} from "../../src/API"
import awsconfig from "../../src/aws-exports"
import * as customQueries from "../../src/graphql-custom/queries"
import * as mutations from "../../src/graphql/mutations"
import * as queries from "../../src/graphql/queries"
import ErrorBoundary from "../ErrorBoundry"
import JCComponent from "../JCComponent/JCComponent"
import Validate from "../Validate/Validate"
import ResourceConfig from "./ResourceConfig"
import ResourceContent from "./ResourceContent"
//import { DataStore, Predicates } from '@aws-amplify/datastore'
import { ResourceContext, ResourceState } from "./ResourceContext"

Amplify.configure(awsconfig)

interface Props {
  navigation?: any
  groupId: any
  route?: any
  showConfig?: boolean

  // isEditable: boolean
}

class ResourceViewerImpl extends JCComponent<Props, ResourceState> {
  static Provider = ResourceContext.Provider
  constructor(props: Props) {
    super(props)
    this.state = {
      ...super.getInitialState(),
      resourceData: null,
      groupData: null,
      currentMenuItem: 0,
      currentResource: null,
      currentSeries: null,
      currentEpisode: null,
      isEditable: false,
      showMap: false,
      loadId: props.route.params.id,
      createNew:
        props.route.params.create === "true" || props.route.params.create === true ? true : false,
      canSave: false,
      canLeave: false,
      canJoin: false,
      canDelete: false,
      validationError: "",
      currentUser: null,
      currentUserProfile: null,
      memberIDs: [],
    }
  }
  componentDidMount() {
    this.setState({
      resourceData: null,
      groupData: null,
      currentMenuItem: 0,
      currentResource: null,
      currentSeries: null,
      currentEpisode: null,
      isEditable: false,
      showMap: false,
      loadId: this.props.route.params.id,
      createNew:
        this.props.route.params.create === "true" || this.props.route.params.create === true
          ? true
          : false,
      canSave: false,
      canLeave: false,
      canJoin: false,
      canDelete: false,
      validationError: "",
      currentUser: null,
      currentUserProfile: null,
      memberIDs: [],
    })
    Auth.currentAuthenticatedUser().then((user: any) => {
      this.setState({
        currentUser: user.username,
      })
      const getUser: GetUserQueryResultPromise = API.graphql(
        graphqlOperation(queries.getUser, { id: user["username"] })
      ) as GetUserQueryResultPromise
      getUser
        .then((json: GetUserQueryResult) => {
          this.setState(
            {
              currentUserProfile: json.data?.getUser,
            },
            () => {
              this.setInitialData(this.props)
            }
          )
        })
        .catch((e: any) => {
          console.log({
            "Error Loading User": e,
          })
        })
    })
  }
  setInitialData(props: Props): void {
    if (props.route.params.create === "true" || props.route.params.create === true) {
      console.log("creating Resource")
      Auth.currentAuthenticatedUser().then((user: any) => {
        const z: CreateGroupInput = {
          id: "resource-" + Date.now(),
          owner: user.username,
          type: "resource",
          name: "",
          description: "",
          memberCount: 1,
          isSponsored: "false",
          image: "temp",
          ownerOrgID: "0000000000000",
        }
        const isEditable = true
        this.setState(
          {
            groupData: z,
            isEditable: isEditable,
            canLeave: true && !isEditable,
            canJoin: true && !isEditable,
            canSave: !this.state.createNew && isEditable,
            createNew: this.state.createNew && isEditable,
            canDelete: !this.state.createNew && isEditable,
          },
          () => {
            this.setInitialResourceData()
          }
        )
      })
    } else {
      const getGroup: GetGroupQueryResultPromise = API.graphql({
        query: queries.getGroup,
        variables: { id: props.route.params.id },
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
      }) as GetGroupQueryResultPromise
      const processResults = (json: GetGroupQueryResult) => {
        const isEditable = json.data.getGroup.owner == this.state.currentUser

        this.setState(
          {
            groupData: json.data?.getGroup,
            memberIDs: json.data?.getGroup?.members?.items?.map((item) => item?.userID),
            isEditable: isEditable,
            canLeave: true && !isEditable,
            canJoin: true && !isEditable,
            canSave: !this.state.createNew && isEditable,
            createNew: this.state.createNew && isEditable,
            canDelete: !this.state.createNew && isEditable,
          },
          () => {
            this.setInitialResourceData()
            const groupMemberByUser: GroupMemberByUserQueryResultPromise = API.graphql({
              query: queries.groupMemberByUser,
              variables: {
                userID: this.state.currentUser,
                groupID: { eq: this.state.groupData.id },
              },
              authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
            }) as GroupMemberByUserQueryResultPromise
            groupMemberByUser.then((json: GroupMemberByUserQueryResult) => {
              console.log({ groupMemberByUser: json })
              if (
                json.data?.groupMemberByUser?.items &&
                json.data.groupMemberByUser.items.length > 0
              )
                this.setState({ canJoin: false, canLeave: true && !this.state.isEditable })
              else this.setState({ canJoin: true && !this.state.isEditable, canLeave: false })
            })
          }
        )
      }
      getGroup.then(processResults).catch(processResults)
    }
  }
  async setInitialResourceData(): Promise<void> {
    console.log(this.state.groupData)
    const listResourceRoots: ListResourceRootsQueryResultPromise = API.graphql({
      query: queries.listResourceRoots,
      variables: {
        limit: 100,
        filter: { groupId: { eq: this.state.groupData.id } },
        nextToken: null,
      },
      authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
    }) as ListResourceRootsQueryResultPromise

    listResourceRoots
      .then((json: ListResourceRootsQueryResult) => {
        console.log(json)
        if (json.data?.listResourceRoots?.items?.length == 0) {
          console.log("starting from scratch")
          this.createResourceRoot()
        } else {
          console.log("existing data")
          console.log({ json: json })
          if (json.data?.listResourceRoots?.items && json.data?.listResourceRoots?.items[0]) {
            console.log({ id: json.data?.listResourceRoots?.items[0].id })
            const getResourceRoot: GetResourceRootQueryResultPromise = API.graphql({
              query: customQueries.getResourceRoot,
              variables: { id: json.data?.listResourceRoots?.items[0].id },
              authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
            }) as GetResourceRootQueryResultPromise

            getResourceRoot
              .then((json) => {
                console.log(json)
                if (json.data?.getResourceRoot)
                  this.setState({ resourceData: json.data.getResourceRoot, currentResource: 0 })
              })
              .catch((e: any) => {
                console.log(e)
              })
          }
          //   console.log(getResourceRoot2)
        }
      })
      .catch((e: any) => {
        console.log(e)
      })

    //  const getResourceRoot2 = await DataStore.query(ResourceEpisode);
  }
  sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async createResourceRoot(): Promise<void> {
    console.log("test1")
    try {
      const resourceRoot: CreateResourceRootInput = {
        type: `curriculum`,
        groupId: this.state.groupData?.id,
        organizationId: "0",
      }
      const createResourceRoot: CreateResourceRootMutationResult = (await API.graphql({
        query: mutations.createResourceRoot,
        variables: { input: resourceRoot },
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
      })) as CreateResourceRootMutationResult
      console.log(createResourceRoot)
      if (createResourceRoot.data?.createResourceRoot) {
        const menuItem: CreateResourceMenuItemInput = {
          type: ResourceMenuItemType.menuItem,
          menuTitle: "Overview",
          order: "0",
          depth: "1",
          resourceRootID: createResourceRoot.data.createResourceRoot.id,
        }

        const createMenuItem: CreateResourceMenuItemMutationResult = (await API.graphql({
          query: mutations.createResourceMenuItem,
          variables: { input: menuItem },
          authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
        })) as CreateResourceMenuItemMutationResult
        console.log(createMenuItem)

        const getResourceRoot: GetResourceRootQueryResult = (await API.graphql({
          query: customQueries.getResourceRoot,
          variables: { id: createResourceRoot.data.createResourceRoot.id },
          authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
        })) as GetResourceRootQueryResult

        console.log(createResourceRoot)
        console.log({ resourceRoot: getResourceRoot })
        if (getResourceRoot.data?.getResourceRoot)
          this.setState({
            resourceData: getResourceRoot.data.getResourceRoot,
            currentResource: 0,
            currentEpisode: null,
            currentSeries: null,
          })
      }
    } catch (e) {
      console.log(e)
    }
  }

  /*    async DeleteAll(): Promise<void> {
            try {
                const listResourceRoots: any = API.graphql({
                    query: queries.listResourceRoots,
                    variables: { limit: 20, filter: { groupId: { eq: this.props.groupId } }, nextToken: null },
                    authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS
                });
                // Promise.all(q)
                return true
            }
            catch (e) {
                console.log(e)
            }
        }*/

  mapChanged = (): void => {
    this.setState({ showMap: !this.state.showMap })
  }
  validateGroup = (): boolean => {
    const validation: any = Validate.Resource(this.state.groupData)
    this.setState({ validationError: validation.validationError })
    return validation.result
  }
  createGroup = (): void => {
    if (this.validateGroup()) {
      const createGroup: any = API.graphql({
        query: mutations.createGroup,
        variables: { input: this.state.groupData },
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
      })
      createGroup
        .then((json: any) => {
          this.setState(
            {
              createNew: false,
              loadId: json.data.createGroup.id,
            },
            () => {
              this.setState({
                canSave: !this.state.createNew && this.state.isEditable,
                createNew: this.state.createNew && this.state.isEditable,
                canDelete: !this.state.createNew && this.state.isEditable,
              })
            }
          )
          console.log({ "Success mutations.createGroup": json })
        })
        .catch((err: any) => {
          console.log({ "Error mutations.createGroup": err })
        })
    }
  }
  clean(item): void {
    delete item.members
    delete item.messages
    delete item.organizerGroup
    delete item.organizerUser
    delete item.instructors
    delete item.backOfficeStaff
    delete item.ownerUser
    delete item._deleted
    delete item._lastChangedAt
    delete item.createdAt
    delete item.updatedAt
    delete item.ownerOrg
    return item
  }
  saveGroup = (): void => {
    if (this.validateGroup()) {
      const updateGroup: any = API.graphql({
        query: mutations.updateGroup,
        variables: { input: this.clean(this.state.groupData) },
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
      })
      updateGroup
        .then((json: any) => {
          // this.setState({ canDelete: true, canSave: true, createNew: false })
          console.log({ "Success mutations.updateGroup": json })
        })
        .catch((err: any) => {
          console.log({ "Error mutations.updateGroup": err })
        })
    }
  }
  leaveGroup = (): void => {
    Analytics.record({
      name: "leftResource",
      // Attribute values must be strings
      attributes: { id: this.state.groupData.id, name: this.state.groupData.name },
    })
    const groupMemberByUser: any = API.graphql({
      query: queries.groupMemberByUser,
      variables: { userID: this.state.currentUser, groupID: { eq: this.state.groupData.id } },
      authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
    })
    groupMemberByUser
      .then((json: any) => {
        console.log({ "Success queries.groupMemberByUser": json })

        json.data.groupMemberByUser.items.map((item) => {
          const deleteGroupMember: any = API.graphql({
            query: mutations.deleteGroupMember,
            variables: { input: { id: item.id } },
            authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
          })
          deleteGroupMember
            .then((json: any) => {
              console.log({ "Success mutations.deleteGroupMember": json })
            })
            .catch((err: any) => {
              console.log({ "Error mutations.deleteGroupMember": err })
            })
        })

        const remainingUsers = this.state.memberIDs.filter(
          (user) => user !== this.state.currentUser
        )
        this.setState({ canJoin: true, canLeave: false, memberIDs: remainingUsers })
        // this.renderButtons()
      })
      .catch((err: any) => {
        console.log({ "Error queries.groupMemberByUser": err })
      })
  }
  joinGroup = (): void => {
    Analytics.record({
      name: "joinedResource",
      // Attribute values must be strings
      attributes: { id: this.state.groupData.id, name: this.state.groupData.name },
    })
    const createGroupMember: any = API.graphql({
      query: mutations.createGroupMember,
      variables: { input: { groupID: this.state.groupData.id, userID: this.state.currentUser } },
      authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
    })
    createGroupMember
      .then((json: any) => {
        console.log({ "Success mutations.createGroupMember": json })
      })
      .catch((err: any) => {
        console.log({ "Error mutations.createGroupMember": err })
      })

    this.setState({
      canJoin: false,
      canLeave: true,
      memberIDs: this.state.memberIDs.concat(this.state.currentUser),
    })
    // this.renderButtons()
    console.log(this.state.memberIDs)
  }
  deleteGroup = (): void => {
    const deleteGroup: any = API.graphql({
      query: mutations.deleteGroup,
      variables: { input: { id: this.state.groupData.id } },
      authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
    })
    deleteGroup
      .then((json: any) => {
        console.log({ "Success mutations.deleteGroup": json })
        this.props.navigation.push("HomeScreen")
      })
      .catch((err: any) => {
        console.log({ "Error mutations.deleteGroup": err })
      })
  }
  showProfile = (id: string): void => {
    console.log("Navigate to profileScreen")
    this.props.navigation.push("ProfileScreen", { id: id, create: false })
  }
  updateValueGroup = (field: string, value: any): void => {
    const temp = this.state.groupData
    temp[field] = value
    this.setState({ groupData: temp })
  }

  setIsEditable = (val: boolean): void => {
    this.setState({ isEditable: val })
  }
  createMenuItem = async (menuItemType: ResourceMenuItemType): Promise<void> => {
    const menuItem: CreateResourceMenuItemInput = {
      type: menuItemType,
      menuTitle: "New Menu Title",
      resourceRootID: this.state.resourceData.id,
      order: this.state.resourceData?.menuItems.items.length + 1,
    }
    try {
      console.log("Creating Resource")

      const createMenuItem: CreateResourceMenuItemMutationResult = (await API.graphql({
        query: mutations.createResourceMenuItem,
        variables: { input: menuItem },
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
      })) as CreateResourceMenuItemMutationResult
      console.log(createMenuItem)
      const temp = this.state.resourceData
      temp.menuItems.items.push(createMenuItem.data?.createResourceMenuItem)
      console.log(temp)
      this.setState({ resourceData: temp }, () => this.forceUpdate())
    } catch (e) {
      console.log(e)
    }
  }
  createResource = async (): Promise<void> => {
    const resource: CreateResourceInput = {
      type: "curriculum",
      title: "New Title",
      image: null,
      description: "Enter description",
      extendedDescription: JSON.stringify(
        convertToRaw(EditorState.createEmpty().getCurrentContent())
      ),
      resourceID: this.state.resourceData.id,
      order: this.state.resourceData.resources.items.length + 1,
    }
    try {
      console.log("Creating Resource")

      const createResource: any = await API.graphql({
        query: mutations.createResource,
        variables: { input: resource },
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
      })
      console.log(createResource)
      const temp = this.state.resourceData
      temp.resources.items.push(createResource.data.createResource)
      console.log(temp)
      this.setState({ resourceData: temp }, () => this.forceUpdate())
    } catch (e) {
      console.log(e)
    }
  }
  createSeries = async (): Promise<void> => {
    if (this.state.currentResource == null || this.state.currentResource == undefined)
      throw new Error("Current Resource Not Set")

    const series: CreateResourceSeriesInput = {
      type: "curriculum",
      title: "New Title",
      image: null,
      description: "Enter description",
      seriesID: this.state.resourceData.resources.items[this.state.currentResource].id,
      //order: this.state.resourceData.resources.items[this.state.currentResource].series.items.length + 1
    }
    try {
      console.log("Creating Resource")

      const createResource: any = await API.graphql({
        query: mutations.createResourceSeries,
        variables: { input: series },
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
      })
      console.log(createResource)
      const temp = this.state.resourceData
      temp.resources.items[this.state.currentResource].series.items.push(
        createResource.data.createResourceSeries
      )
      this.setState({ resourceData: temp })
    } catch (e) {
      console.log(e)
    }
  }
  createEpisode = async (): Promise<void> => {
    if (this.state.currentResource == null || this.state.currentResource == undefined)
      throw new Error("Current Resource Not Set")
    if (this.state.currentSeries == null || this.state.currentSeries == undefined)
      throw new Error("Current Series Not Set")

    const episode: CreateResourceEpisodeInput = {
      type: "curriculum",
      title: "New Title",
      //image: null,
      description: "Enter description",
      videoPreview: "Enter Url",
      episodeID: this.state.resourceData.resources.items[this.state.currentResource].series.items[
        this.state.currentSeries
      ].id,
      //order: this.state.resourceData.resources.items[this.state.currentResource].series.items.length + 1
    }
    try {
      console.log("Creating Resource")

      const createResource: any = await API.graphql({
        query: mutations.createResourceEpisode,
        variables: { input: episode },
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
      })
      console.log(createResource)
      const temp = this.state.resourceData
      temp.resources.items[this.state.currentResource].series.items[
        this.state.currentSeries
      ].episodes.items.push(createResource.data.createResourceEpisode)
      this.setState({ resourceData: temp })
    } catch (e) {
      console.log(e)
    }
  }
  changeEpisode = (index: number): void => {
    console.log({ changeEpisode: index })
    this.setState({ currentEpisode: index })
  }
  changeSeries = (index: number): void => {
    console.log({ changeSeries: index })
    this.setState({ currentSeries: index, currentEpisode: null })
  }
  changeResource = (index: number): void => {
    console.log({ changeResource: index })
    this.setState({ currentSeries: null, currentResource: index, currentEpisode: null })
  }
  changeMenuItem = (index: number): void => {
    console.log({ changeResource: index })
    this.setState({ currentMenuItem: index })
  }
  updateMenuItem = async (menuItemIndex: number, item: string, value: any): Promise<void> => {
    try {
      console.log({ "Updating MenuItem": menuItemIndex })

      const updateMenuItem: UpdateResourceMenuItemMutationResult = (await API.graphql({
        query: mutations.updateResourceMenuItem,
        variables: {
          input: {
            id: this.state.resourceData?.menuItems?.items[menuItemIndex].id,
            [item]: value,
          },
        },
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
      })) as UpdateResourceMenuItemMutationResult
      console.log(updateMenuItem)
      const temp = this.state.resourceData
      temp.menuItems.items[menuItemIndex][item] = value
      this.setState({ resourceData: temp })
    } catch (e) {
      console.log(e)
    }
  }
  updateToRoot(
    rootPageItems: ResourcePageItemInput[],
    pageItemIndex: PageItemIndex,
    value: ResourcePageItemInput
  ): any {
    let rootPageItems2 = rootPageItems
    console.log({ rootPageItems2, pageItemIndex, value })
    if (pageItemIndex.length == 1) {
      return rootPageItems2
    } else {
      //      if (rootPageItems2.pageItems == null) rootPageItems2.pageItems = []
      console.log({ pageItemIndexA: pageItemIndex })
      let z = this.updateToRoot(
        rootPageItems2[pageItemIndex[0]][pageItemIndex[1]]
          ? rootPageItems2[pageItemIndex[0]][pageItemIndex[1]]
          : [],

        pageItemIndex.slice(2),
        value
      )
      console.log({ pageItemIndexB: pageItemIndex })

      rootPageItems2[pageItemIndex[0]][pageItemIndex[1]] = z

      return rootPageItems2
    }
  }
  addToRoot(
    rootPageItems: ResourcePageItemInput[],
    pageItem: ResourcePageItemInput,
    pageItemIndex: PageItemIndex
  ): any {
    let rootPageItems2 = rootPageItems
    console.log({ rootPageItems2, pageItem, pageItemIndex })
    if (pageItemIndex.length == 0) {
      rootPageItems2.push(pageItem)
      console.log(rootPageItems)
      return rootPageItems2
    } else {
      //      if (rootPageItems2.pageItems == null) rootPageItems2.pageItems = []
      console.log({ pageItemIndexA: pageItemIndex })
      let z = this.addToRoot(
        rootPageItems2[pageItemIndex[0]][pageItemIndex[1]]
          ? rootPageItems2[pageItemIndex[0]][pageItemIndex[1]]
          : [],
        pageItem,
        pageItemIndex.slice(2)
      )
      console.log({ pageItemIndexB: pageItemIndex })
      console.log({ z: z })
      rootPageItems2[pageItemIndex[0]][pageItemIndex[1]] = z
      console.log({ rootPageItems2222: rootPageItems2 })
      return rootPageItems2
    }
  }
  deleteToRoot(
    rootPageItems: ResourcePageItemInput[],

    pageItemIndex: PageItemIndex
  ): any {
    let rootPageItems2 = rootPageItems
    console.log({ rootPageItems2, pageItemIndex })
    if (pageItemIndex.length == 1) {
      rootPageItems2.splice(pageItemIndex[0] as number, 1)
      console.log(rootPageItems)
      return rootPageItems2
    } else {
      //      if (rootPageItems2.pageItems == null) rootPageItems2.pageItems = []
      console.log({ pageItemIndexA: pageItemIndex })
      let z = this.deleteToRoot(
        rootPageItems2[pageItemIndex[0]][pageItemIndex[1]]
          ? rootPageItems2[pageItemIndex[0]][pageItemIndex[1]]
          : [],
        pageItemIndex.slice(2)
      )
      console.log({ pageItemIndexB: pageItemIndex })
      console.log({ z: z })
      rootPageItems2[pageItemIndex[0]][pageItemIndex[1]] = z
      console.log({ rootPageItems2222: rootPageItems2 })
      return rootPageItems2
    }
  }
  createPageItem = async (
    menuItemIndex: number,
    pageItemIndex: PageItemIndex,
    pageItem: ResourcePageItemInput
  ): Promise<void> => {
    try {
      console.log({
        "Creating PageItem": menuItemIndex,
        PageIndex: pageItemIndex,
        pageItem: pageItem,
      })
      let rootPageItems: ResourcePageItemInput[] = this.state.resourceData.menuItems.items[
        menuItemIndex
      ].pageItems
      console.log(rootPageItems)
      if (!rootPageItems) rootPageItems = []
      rootPageItems = this.addToRoot(rootPageItems, pageItem, pageItemIndex)
      console.log({ rootPageItems: rootPageItems })
      const updateMenuItem: UpdateResourceMenuItemMutationResult = (await API.graphql({
        query: mutations.updateResourceMenuItem,
        variables: {
          input: {
            id: this.state.resourceData.menuItems.items[menuItemIndex].id,
            pageItems: rootPageItems,
          },
        },
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
      })) as UpdateResourceMenuItemMutationResult
      console.log(updateMenuItem)
      const temp = this.state.resourceData
      console.log({ Root: rootPageItems })
      temp.menuItems.items[menuItemIndex].pageItems = rootPageItems
      this.setState({ resourceData: temp })
    } catch (e) {
      console.log(e)
    }
  }
  updatePageItem = async (
    menuItemIndex: number,
    pageItemIndex: PageItemIndex,
    value: ResourcePageItemInput
  ): Promise<void> => {
    try {
      console.log({ "Updating MenuItem": menuItemIndex, value: value })
      let rootPageItems: ResourcePageItemInput[] = this.state.resourceData.menuItems.items[
        menuItemIndex
      ].pageItems
      rootPageItems = this.updateToRoot(rootPageItems, pageItemIndex, value)

      const updateMenuItem: UpdateResourceMenuItemMutationResult = (await API.graphql({
        query: mutations.updateResourceMenuItem,
        variables: {
          input: {
            id: this.state.resourceData.menuItems.items[menuItemIndex].id,
            pageItems: rootPageItems,
          },
        },
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
      })) as UpdateResourceMenuItemMutationResult
      console.log(updateMenuItem)
      const temp = this.state.resourceData
      temp.menuItems.items[menuItemIndex].pageItems = rootPageItems
      this.setState({ resourceData: temp })
    } catch (e) {
      console.log(e)
    }
  }
  deletePageItem = async (menuItemIndex: number, pageItemIndex: PageItemIndex): Promise<void> => {
    try {
      console.log({ "Updating MenuItem": menuItemIndex })
      let rootPageItems: ResourcePageItemInput[] = this.state.resourceData.menuItems.items[
        menuItemIndex
      ].pageItems
      rootPageItems = this.deleteToRoot(rootPageItems, pageItemIndex)
      const updateMenuItem: UpdateResourceMenuItemMutationResult = (await API.graphql({
        query: mutations.updateResourceMenuItem,
        variables: {
          input: {
            id: this.state.resourceData.menuItems.items[menuItemIndex].id,
            pageItems: rootPageItems,
          },
        },
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
      })) as UpdateResourceMenuItemMutationResult
      console.log(updateMenuItem)
      const temp = this.state.resourceData
      temp.menuItems.items[menuItemIndex].pageItems = rootPageItems
      this.setState({ resourceData: temp })
    } catch (e) {
      console.log(e)
    }
  }
  updateResource = async (index: number, item: string, value: any): Promise<void> => {
    try {
      console.log({ "Updating Resource": index })

      const updateResource: any = await API.graphql({
        query: mutations.updateResource,
        variables: {
          input: {
            id: this.state.resourceData.resources.items[index].id,
            [item]: value,
          },
        },
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
      })
      console.log(updateResource)
      const temp = this.state.resourceData
      temp.resources.items[index][item] = value
      this.setState({ resourceData: temp })
    } catch (e) {
      console.log(e)
    }
  }
  updateResourceOrder = (): void => {
    try {
      this.state.resourceData.resources.items.forEach((item, index: number) => {
        this.updateResource(index, "order", index)
      })

      /* var temp = this.state.data
             temp.resources.items.forEach((item, index) => {
                 temp.resources.items[index].order = index
             }
             )
             this.setState({ data: temp })*/
    } catch (e) {
      console.log(e)
    }
  }

  deleteMenuItem = async (menuItemIndex: number) => {
    try {
      console.log({ "Deleting MenuItem": menuItemIndex })
      const deleteMenuItem: DeleteResourceMenuItemMutationResult = (await API.graphql({
        query: mutations.deleteResourceMenuItem,
        variables: { input: { id: this.state.resourceData.menuItems.items[menuItemIndex].id } },
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
      })) as DeleteResourceMenuItemMutationResult
      console.log(deleteMenuItem)
      const temp = this.state.resourceData
      temp.menuItems.items.splice(menuItemIndex, 1)
      this.setState({ resourceData: temp }, this.updateResourceOrder)
    } catch (e) {
      console.log(e)
    }
  }
  deleteResource = async (index: number) => {
    console.log({ "Deleting resource": index })
    try {
      console.log({ "Deleting Resource": index })
      const deleteResource: any = await API.graphql({
        query: mutations.deleteResource,
        variables: { input: { id: this.state.resourceData.resources.items[index].id } },
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
      })
      console.log(deleteResource)
      const temp = this.state.resourceData
      temp.resources.items.splice(index, 1)
      this.setState({ resourceData: temp, currentResource: 0 }, this.updateResourceOrder)
    } catch (e) {
      console.log(e)
    }
  }
  updateSeriesOrder = (resourceIndex: number) => {
    try {
      this.state.resourceData.resources.items[resourceIndex].series.items.forEach(
        (item, index: number) => {
          this.updateSeries(resourceIndex, index, "order", index.toString())
        }
      )
    } catch (e) {
      console.log(e)
    }
  }
  updateSeries = async (
    resourceIndex: number,
    seriesIndex: number,
    item: string,
    value: string
  ): Promise<void> => {
    try {
      console.log({ "Updating Resource": { resource: resourceIndex, series: seriesIndex } })

      const updateResource: any = await API.graphql({
        query: mutations.updateResourceSeries,
        variables: {
          input: {
            id: this.state.resourceData.resources.items[resourceIndex].series.items[seriesIndex].id,
            [item]: value,
          },
        },
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
      })
      console.log(updateResource)
      const temp = this.state.resourceData
      temp.resources.items[resourceIndex].series.items[seriesIndex][item] = value
      this.setState({ resourceData: temp })
    } catch (e) {
      console.log(e)
    }
  }
  deleteSeries = async (resourceIndex: number, seriesIndex: number): Promise<void> => {
    try {
      console.log({ "Deleting Series": { resource: resourceIndex, series: seriesIndex } })
      const deleteResource: any = await API.graphql({
        query: mutations.deleteResourceSeries,
        variables: {
          input: {
            id: this.state.resourceData.resources.items[resourceIndex].series.items[seriesIndex].id,
          },
        },
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
      })
      console.log(deleteResource)
      const temp = this.state.resourceData
      temp.resources.items[resourceIndex].series.items.splice(seriesIndex, 1)
      console.log(temp.resources.items[resourceIndex])
      this.setState({ resourceData: temp }, () => {
        this.updateSeriesOrder(resourceIndex)
      })
    } catch (e) {
      console.log(e)
    }
  }
  updateEpisodesOrder = (resourceIndex: number, seriesIndex: number): void => {
    try {
      this.state.resourceData.resources.items[resourceIndex].series.items[
        seriesIndex
      ].episodes.items.forEach((item, index: number) => {
        this.updateEpisode(resourceIndex, seriesIndex, index, "order", index.toString())
      })
    } catch (e) {
      console.log(e)
    }
  }
  updateEpisode = async (
    resourceIndex: number,
    seriesIndex: number,
    episodeIndex: number,
    item: string,
    value: string
  ): Promise<void> => {
    try {
      console.log({
        "Updating Resource": {
          resource: resourceIndex,
          series: seriesIndex,
          episode: episodeIndex,
        },
      })

      const updateResourceEpisode: any = await API.graphql({
        query: mutations.updateResourceEpisode,
        variables: {
          input: {
            id: this.state.resourceData.resources.items[resourceIndex].series.items[seriesIndex]
              .episodes.items[episodeIndex].id,
            [item]: value,
          },
        },
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
      })
      console.log(updateResourceEpisode)
      const temp = this.state.resourceData
      temp.resources.items[resourceIndex].series.items[seriesIndex].episodes.items[episodeIndex][
        item
      ] = value
      this.setState({ resourceData: temp })
    } catch (e) {
      console.log(e)
    }
  }
  clearEpisode = (): void => {
    this.setState({ currentEpisode: null })
  }
  clearSeries = (): void => {
    this.setState({ currentSeries: null, currentEpisode: null })
  }
  deleteEpisode = async (
    resourceIndex: number,
    seriesIndex: number,
    episodeIndex: number
  ): Promise<void> => {
    try {
      console.log({
        "Deleting Episode": { resource: resourceIndex, series: seriesIndex, episode: episodeIndex },
      })
      const deleteResource: any = await API.graphql({
        query: mutations.deleteResourceEpisode,
        variables: {
          input: {
            id: this.state.resourceData.resources.items[resourceIndex].series.items[seriesIndex]
              .episodes.items[episodeIndex].id,
          },
        },
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
      })
      console.log(deleteResource)
      const temp = this.state.resourceData
      temp.resources.items[resourceIndex].series.items[seriesIndex].episodes.items.splice(
        episodeIndex,
        1
      )
      this.setState({ resourceData: temp }, () => {
        this.updateEpisodesOrder(resourceIndex, seriesIndex)
      })
    } catch (e) {
      console.log(e)
    }
  }
  getValueFromKey(myObject: unknown, string: string) {
    const key = Object.keys(myObject).filter((k) => k.includes(string))
    return key.length ? myObject[key[0]] : ""
  }
  updateResourceImage = async (
    menuItemIndex: number,
    pageItemIndex: PageItemIndex,
    e
  ): Promise<void> => {
    const file = e.target.files[0]
    const lastDot = file.name.lastIndexOf(".")
    const ext = file.name.substring(lastDot + 1)
    const user = await Auth.currentCredentials()
    const userId = user.identityId
    const tempPageItems = this.state.resourceData.menuItems.items[menuItemIndex].pageItems

    const fn =
      "resources/upload/group-" +
      tempPageItems[pageItemIndex].id +
      "-" +
      new Date().getTime() +
      "-upload." +
      ext
    const fnSave = fn
      .replace("/upload", "")
      .replace("-upload.", "-[size].")
      .replace("." + ext, ".png")

    Storage.put(fn, file, {
      level: "protected",
      contentType: file.type,
      identityId: userId,
    })
      .then(() => {
        Storage.get(fn, {
          level: "protected",
          identityId: userId,
        }).then((result2) => {
          console.log(result2)
          tempPageItems[pageItemIndex].image = {
            userId: userId,
            filenameUpload: fn,
            filenameLarge: fnSave.replace("[size]", "large"),
            filenameMedium: fnSave.replace("[size]", "medium"),
            filenameSmall: fnSave.replace("[size]", "small"),
          }
          this.updatePageItem(menuItemIndex, pageItemIndex, tempPageItems)
        })

        // console.log(result)
      })
      .catch((err) => console.log(err))
  }

  render(): React.ReactNode {
    return this.state.resourceData != null ? (
      <ErrorBoundary>
        <ResourceViewerImpl.Provider
          value={{
            resourceState: {
              ...this.state,
            },
            resourceActions: {
              createPageItem: this.createPageItem,
              updatePageItem: this.updatePageItem,
              deletePageItem: this.deletePageItem,
              createMenuItem: this.createMenuItem,
              changeMenuItem: this.changeMenuItem,
              updateMenuItem: this.updateMenuItem,
              deleteMenuItem: this.deleteMenuItem,
              createResource: this.createResource,
              changeResource: this.changeResource,
              updateResource: this.updateResource,
              deleteResource: this.deleteResource,
              updateResourceImage: this.updateResourceImage,
              changeSeries: this.changeSeries,
              createSeries: this.createSeries,
              deleteSeries: this.deleteSeries,
              updateSeries: this.updateSeries,
              createEpisode: this.createEpisode,
              deleteEpisode: this.deleteEpisode,
              updateEpisode: this.updateEpisode,
              clearEpisode: this.clearEpisode,
              clearSeries: this.clearSeries,
              changeEpisode: this.changeEpisode,
              mapChanged: this.mapChanged,
              validateGroup: this.validateGroup,
              createGroup: this.createGroup,
              saveGroup: this.saveGroup,
              leaveGroup: this.leaveGroup,
              joinGroup: this.joinGroup,
              deleteGroup: this.deleteGroup,
              showProfile: this.showProfile,
              updateValueGroup: this.updateValueGroup,
            },
          }}
        >
          <Container style={{ padding: 0, margin: 0 }}>
            <ErrorBoundary>
              <Content>
                {this.props.showConfig ? (
                  <ResourceConfig></ResourceConfig>
                ) : this.state.currentResource == 0 ? (
                  <>
                    <ResourceContent pageItemIndex={[]} isBase={true}></ResourceContent>
                  </>
                ) : (
                  <>
                    <ResourceContent pageItemIndex={[]} isBase={true}></ResourceContent>
                  </>
                )}
              </Content>
            </ErrorBoundary>
          </Container>
        </ResourceViewerImpl.Provider>
      </ErrorBoundary>
    ) : null
  }
}

export default function ResourceViewer(props: Props): JSX.Element {
  const route = useRoute()
  const navigation = useNavigation()
  return <ResourceViewerImpl {...props} navigation={navigation} route={route} />
}
