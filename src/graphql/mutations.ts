// tslint:disable
// this is an auto generated file. This will be overwritten

export const createTnSeries = `mutation CreateTnSeries($input: CreateTNSeriesInput!) {
  createTNSeries(input: $input) {
    id
    TNident
    title
    description
    imageUrl
    public
    thumbnail
    startDate
    endDate
    sermonCommentCount
    homeChurchCommentCount
    sermons {
      items {
        id
        TNident
        title
        speaker
        deliveryDate
        description
        audioUrl
        mediaEntries {
          type
          contentType
          kind
          label
          url
        }
        public
        series_FK
        series {
          id
          TNident
          title
          description
          imageUrl
          public
          thumbnail
          startDate
          endDate
          sermonCommentCount
          homeChurchCommentCount
          sermons {
            items {
              id
              TNident
              title
              speaker
              deliveryDate
              description
              audioUrl
              mediaEntries {
                type
                contentType
                kind
                label
                url
              }
              public
              series_FK
              series {
                id
                TNident
                title
                description
                imageUrl
                public
                thumbnail
                startDate
                endDate
                sermonCommentCount
                homeChurchCommentCount
                sermons {
                  items {
                    id
                    TNident
                    title
                    speaker
                    deliveryDate
                    description
                    audioUrl
                    mediaEntries {
                      type
                      contentType
                      kind
                      label
                      url
                    }
                    public
                    series_FK
                    series {
                      id
                      TNident
                      title
                      description
                      imageUrl
                      public
                      thumbnail
                      startDate
                      endDate
                      sermonCommentCount
                      homeChurchCommentCount
                    }
                    sermonNoteCount
                    quoteNoteCount
                    homeChurchNoteCount
                    sermonCommentCount
                  }
                  nextToken
                }
              }
              sermonNoteCount
              quoteNoteCount
              homeChurchNoteCount
              sermonCommentCount
            }
            nextToken
          }
        }
        sermonNoteCount
        quoteNoteCount
        homeChurchNoteCount
        sermonCommentCount
      }
      nextToken
    }
  }
}
`;
export const updateTnSeries = `mutation UpdateTnSeries($input: UpdateTNSeriesInput!) {
  updateTNSeries(input: $input) {
    id
    TNident
    title
    description
    imageUrl
    public
    thumbnail
    startDate
    endDate
    sermonCommentCount
    homeChurchCommentCount
    sermons {
      items {
        id
        TNident
        title
        speaker
        deliveryDate
        description
        audioUrl
        mediaEntries {
          type
          contentType
          kind
          label
          url
        }
        public
        series_FK
        series {
          id
          TNident
          title
          description
          imageUrl
          public
          thumbnail
          startDate
          endDate
          sermonCommentCount
          homeChurchCommentCount
          sermons {
            items {
              id
              TNident
              title
              speaker
              deliveryDate
              description
              audioUrl
              mediaEntries {
                type
                contentType
                kind
                label
                url
              }
              public
              series_FK
              series {
                id
                TNident
                title
                description
                imageUrl
                public
                thumbnail
                startDate
                endDate
                sermonCommentCount
                homeChurchCommentCount
                sermons {
                  items {
                    id
                    TNident
                    title
                    speaker
                    deliveryDate
                    description
                    audioUrl
                    mediaEntries {
                      type
                      contentType
                      kind
                      label
                      url
                    }
                    public
                    series_FK
                    series {
                      id
                      TNident
                      title
                      description
                      imageUrl
                      public
                      thumbnail
                      startDate
                      endDate
                      sermonCommentCount
                      homeChurchCommentCount
                    }
                    sermonNoteCount
                    quoteNoteCount
                    homeChurchNoteCount
                    sermonCommentCount
                  }
                  nextToken
                }
              }
              sermonNoteCount
              quoteNoteCount
              homeChurchNoteCount
              sermonCommentCount
            }
            nextToken
          }
        }
        sermonNoteCount
        quoteNoteCount
        homeChurchNoteCount
        sermonCommentCount
      }
      nextToken
    }
  }
}
`;
export const deleteTnSeries = `mutation DeleteTnSeries($input: DeleteTNSeriesInput!) {
  deleteTNSeries(input: $input) {
    id
    TNident
    title
    description
    imageUrl
    public
    thumbnail
    startDate
    endDate
    sermonCommentCount
    homeChurchCommentCount
    sermons {
      items {
        id
        TNident
        title
        speaker
        deliveryDate
        description
        audioUrl
        mediaEntries {
          type
          contentType
          kind
          label
          url
        }
        public
        series_FK
        series {
          id
          TNident
          title
          description
          imageUrl
          public
          thumbnail
          startDate
          endDate
          sermonCommentCount
          homeChurchCommentCount
          sermons {
            items {
              id
              TNident
              title
              speaker
              deliveryDate
              description
              audioUrl
              mediaEntries {
                type
                contentType
                kind
                label
                url
              }
              public
              series_FK
              series {
                id
                TNident
                title
                description
                imageUrl
                public
                thumbnail
                startDate
                endDate
                sermonCommentCount
                homeChurchCommentCount
                sermons {
                  items {
                    id
                    TNident
                    title
                    speaker
                    deliveryDate
                    description
                    audioUrl
                    mediaEntries {
                      type
                      contentType
                      kind
                      label
                      url
                    }
                    public
                    series_FK
                    series {
                      id
                      TNident
                      title
                      description
                      imageUrl
                      public
                      thumbnail
                      startDate
                      endDate
                      sermonCommentCount
                      homeChurchCommentCount
                    }
                    sermonNoteCount
                    quoteNoteCount
                    homeChurchNoteCount
                    sermonCommentCount
                  }
                  nextToken
                }
              }
              sermonNoteCount
              quoteNoteCount
              homeChurchNoteCount
              sermonCommentCount
            }
            nextToken
          }
        }
        sermonNoteCount
        quoteNoteCount
        homeChurchNoteCount
        sermonCommentCount
      }
      nextToken
    }
  }
}
`;
export const createTnSermon = `mutation CreateTnSermon($input: CreateTNSermonInput!) {
  createTNSermon(input: $input) {
    id
    TNident
    title
    speaker
    deliveryDate
    description
    audioUrl
    mediaEntries {
      type
      contentType
      kind
      label
      url
    }
    public
    series_FK
    series {
      id
      TNident
      title
      description
      imageUrl
      public
      thumbnail
      startDate
      endDate
      sermonCommentCount
      homeChurchCommentCount
      sermons {
        items {
          id
          TNident
          title
          speaker
          deliveryDate
          description
          audioUrl
          mediaEntries {
            type
            contentType
            kind
            label
            url
          }
          public
          series_FK
          series {
            id
            TNident
            title
            description
            imageUrl
            public
            thumbnail
            startDate
            endDate
            sermonCommentCount
            homeChurchCommentCount
            sermons {
              items {
                id
                TNident
                title
                speaker
                deliveryDate
                description
                audioUrl
                mediaEntries {
                  type
                  contentType
                  kind
                  label
                  url
                }
                public
                series_FK
                series {
                  id
                  TNident
                  title
                  description
                  imageUrl
                  public
                  thumbnail
                  startDate
                  endDate
                  sermonCommentCount
                  homeChurchCommentCount
                  sermons {
                    items {
                      id
                      TNident
                      title
                      speaker
                      deliveryDate
                      description
                      audioUrl
                      public
                      series_FK
                      sermonNoteCount
                      quoteNoteCount
                      homeChurchNoteCount
                      sermonCommentCount
                    }
                    nextToken
                  }
                }
                sermonNoteCount
                quoteNoteCount
                homeChurchNoteCount
                sermonCommentCount
              }
              nextToken
            }
          }
          sermonNoteCount
          quoteNoteCount
          homeChurchNoteCount
          sermonCommentCount
        }
        nextToken
      }
    }
    sermonNoteCount
    quoteNoteCount
    homeChurchNoteCount
    sermonCommentCount
  }
}
`;
export const updateTnSermon = `mutation UpdateTnSermon($input: UpdateTNSermonInput!) {
  updateTNSermon(input: $input) {
    id
    TNident
    title
    speaker
    deliveryDate
    description
    audioUrl
    mediaEntries {
      type
      contentType
      kind
      label
      url
    }
    public
    series_FK
    series {
      id
      TNident
      title
      description
      imageUrl
      public
      thumbnail
      startDate
      endDate
      sermonCommentCount
      homeChurchCommentCount
      sermons {
        items {
          id
          TNident
          title
          speaker
          deliveryDate
          description
          audioUrl
          mediaEntries {
            type
            contentType
            kind
            label
            url
          }
          public
          series_FK
          series {
            id
            TNident
            title
            description
            imageUrl
            public
            thumbnail
            startDate
            endDate
            sermonCommentCount
            homeChurchCommentCount
            sermons {
              items {
                id
                TNident
                title
                speaker
                deliveryDate
                description
                audioUrl
                mediaEntries {
                  type
                  contentType
                  kind
                  label
                  url
                }
                public
                series_FK
                series {
                  id
                  TNident
                  title
                  description
                  imageUrl
                  public
                  thumbnail
                  startDate
                  endDate
                  sermonCommentCount
                  homeChurchCommentCount
                  sermons {
                    items {
                      id
                      TNident
                      title
                      speaker
                      deliveryDate
                      description
                      audioUrl
                      public
                      series_FK
                      sermonNoteCount
                      quoteNoteCount
                      homeChurchNoteCount
                      sermonCommentCount
                    }
                    nextToken
                  }
                }
                sermonNoteCount
                quoteNoteCount
                homeChurchNoteCount
                sermonCommentCount
              }
              nextToken
            }
          }
          sermonNoteCount
          quoteNoteCount
          homeChurchNoteCount
          sermonCommentCount
        }
        nextToken
      }
    }
    sermonNoteCount
    quoteNoteCount
    homeChurchNoteCount
    sermonCommentCount
  }
}
`;
export const deleteTnSermon = `mutation DeleteTnSermon($input: DeleteTNSermonInput!) {
  deleteTNSermon(input: $input) {
    id
    TNident
    title
    speaker
    deliveryDate
    description
    audioUrl
    mediaEntries {
      type
      contentType
      kind
      label
      url
    }
    public
    series_FK
    series {
      id
      TNident
      title
      description
      imageUrl
      public
      thumbnail
      startDate
      endDate
      sermonCommentCount
      homeChurchCommentCount
      sermons {
        items {
          id
          TNident
          title
          speaker
          deliveryDate
          description
          audioUrl
          mediaEntries {
            type
            contentType
            kind
            label
            url
          }
          public
          series_FK
          series {
            id
            TNident
            title
            description
            imageUrl
            public
            thumbnail
            startDate
            endDate
            sermonCommentCount
            homeChurchCommentCount
            sermons {
              items {
                id
                TNident
                title
                speaker
                deliveryDate
                description
                audioUrl
                mediaEntries {
                  type
                  contentType
                  kind
                  label
                  url
                }
                public
                series_FK
                series {
                  id
                  TNident
                  title
                  description
                  imageUrl
                  public
                  thumbnail
                  startDate
                  endDate
                  sermonCommentCount
                  homeChurchCommentCount
                  sermons {
                    items {
                      id
                      TNident
                      title
                      speaker
                      deliveryDate
                      description
                      audioUrl
                      public
                      series_FK
                      sermonNoteCount
                      quoteNoteCount
                      homeChurchNoteCount
                      sermonCommentCount
                    }
                    nextToken
                  }
                }
                sermonNoteCount
                quoteNoteCount
                homeChurchNoteCount
                sermonCommentCount
              }
              nextToken
            }
          }
          sermonNoteCount
          quoteNoteCount
          homeChurchNoteCount
          sermonCommentCount
        }
        nextToken
      }
    }
    sermonNoteCount
    quoteNoteCount
    homeChurchNoteCount
    sermonCommentCount
  }
}
`;
export const createResource = `mutation CreateResource($input: CreateResourceInput!) {
  createResource(input: $input) {
    id
  }
}
`;
export const updateResource = `mutation UpdateResource($input: UpdateResourceInput!) {
  updateResource(input: $input) {
    id
  }
}
`;
export const deleteResource = `mutation DeleteResource($input: DeleteResourceInput!) {
  deleteResource(input: $input) {
    id
  }
}
`;
export const createVideo = `mutation CreateVideo($input: CreateVideoInput!) {
  createVideo(input: $input) {
    id
    createdBy
    createdDate
    locations {
      id
      url
      site_name
      directions
      welcome
      welcome_img
      welcome_vid_youtube
      phone
      email
      instagram
      twitter
      facebook
      location {
        longitude
        latitude
        address
      }
      visible
    }
    episodeTitle
    episodeNumber
    seriesTitle
    publishedDate
    recordedDate
    description
    closedCaptioning
    referencedMedia
    campaigns
    bibleVerses
    topics
    qandeh
    length
    YoutubeIdent
    Youtube {
      id
      kind
      etag
      snippet {
        publishedAt
        channelId
        title
        description
        thumbnails {
          default {
            url
            width
            height
          }
          medium {
            url
            width
            height
          }
          high {
            url
            width
            height
          }
          standard {
            url
            width
            height
          }
          maxres {
            url
            width
            height
          }
        }
        channelTitle
        localized {
          title
          description
        }
      }
      contentDetails {
        videoId
        videoPublishedAt
      }
    }
    videoTypes
  }
}
`;
export const updateVideo = `mutation UpdateVideo($input: UpdateVideoInput!) {
  updateVideo(input: $input) {
    id
    createdBy
    createdDate
    locations {
      id
      url
      site_name
      directions
      welcome
      welcome_img
      welcome_vid_youtube
      phone
      email
      instagram
      twitter
      facebook
      location {
        longitude
        latitude
        address
      }
      visible
    }
    episodeTitle
    episodeNumber
    seriesTitle
    publishedDate
    recordedDate
    description
    closedCaptioning
    referencedMedia
    campaigns
    bibleVerses
    topics
    qandeh
    length
    YoutubeIdent
    Youtube {
      id
      kind
      etag
      snippet {
        publishedAt
        channelId
        title
        description
        thumbnails {
          default {
            url
            width
            height
          }
          medium {
            url
            width
            height
          }
          high {
            url
            width
            height
          }
          standard {
            url
            width
            height
          }
          maxres {
            url
            width
            height
          }
        }
        channelTitle
        localized {
          title
          description
        }
      }
      contentDetails {
        videoId
        videoPublishedAt
      }
    }
    videoTypes
  }
}
`;
export const deleteVideo = `mutation DeleteVideo($input: DeleteVideoInput!) {
  deleteVideo(input: $input) {
    id
    createdBy
    createdDate
    locations {
      id
      url
      site_name
      directions
      welcome
      welcome_img
      welcome_vid_youtube
      phone
      email
      instagram
      twitter
      facebook
      location {
        longitude
        latitude
        address
      }
      visible
    }
    episodeTitle
    episodeNumber
    seriesTitle
    publishedDate
    recordedDate
    description
    closedCaptioning
    referencedMedia
    campaigns
    bibleVerses
    topics
    qandeh
    length
    YoutubeIdent
    Youtube {
      id
      kind
      etag
      snippet {
        publishedAt
        channelId
        title
        description
        thumbnails {
          default {
            url
            width
            height
          }
          medium {
            url
            width
            height
          }
          high {
            url
            width
            height
          }
          standard {
            url
            width
            height
          }
          maxres {
            url
            width
            height
          }
        }
        channelTitle
        localized {
          title
          description
        }
      }
      contentDetails {
        videoId
        videoPublishedAt
      }
    }
    videoTypes
  }
}
`;
export const createBlog = `mutation CreateBlog($input: CreateBlogInput!) {
  createBlog(input: $input) {
    id
    createdBy
    createdDate
    postedDate
    locations {
      id
      url
      site_name
      directions
      welcome
      welcome_img
      welcome_vid_youtube
      phone
      email
      instagram
      twitter
      facebook
      location {
        longitude
        latitude
        address
      }
      visible
    }
    title
    content
    version
  }
}
`;
export const updateBlog = `mutation UpdateBlog($input: UpdateBlogInput!) {
  updateBlog(input: $input) {
    id
    createdBy
    createdDate
    postedDate
    locations {
      id
      url
      site_name
      directions
      welcome
      welcome_img
      welcome_vid_youtube
      phone
      email
      instagram
      twitter
      facebook
      location {
        longitude
        latitude
        address
      }
      visible
    }
    title
    content
    version
  }
}
`;
export const deleteBlog = `mutation DeleteBlog($input: DeleteBlogInput!) {
  deleteBlog(input: $input) {
    id
    createdBy
    createdDate
    postedDate
    locations {
      id
      url
      site_name
      directions
      welcome
      welcome_img
      welcome_vid_youtube
      phone
      email
      instagram
      twitter
      facebook
      location {
        longitude
        latitude
        address
      }
      visible
    }
    title
    content
    version
  }
}
`;
export const createNews = `mutation CreateNews($input: CreateNewsInput!) {
  createNews(input: $input) {
    id
    createdBy
    createdDate
    postedDate
    locations {
      id
      url
      site_name
      directions
      welcome
      welcome_img
      welcome_vid_youtube
      phone
      email
      instagram
      twitter
      facebook
      location {
        longitude
        latitude
        address
      }
      visible
    }
    title
    content
    startDate
    endDate
  }
}
`;
export const updateNews = `mutation UpdateNews($input: UpdateNewsInput!) {
  updateNews(input: $input) {
    id
    createdBy
    createdDate
    postedDate
    locations {
      id
      url
      site_name
      directions
      welcome
      welcome_img
      welcome_vid_youtube
      phone
      email
      instagram
      twitter
      facebook
      location {
        longitude
        latitude
        address
      }
      visible
    }
    title
    content
    startDate
    endDate
  }
}
`;
export const deleteNews = `mutation DeleteNews($input: DeleteNewsInput!) {
  deleteNews(input: $input) {
    id
    createdBy
    createdDate
    postedDate
    locations {
      id
      url
      site_name
      directions
      welcome
      welcome_img
      welcome_vid_youtube
      phone
      email
      instagram
      twitter
      facebook
      location {
        longitude
        latitude
        address
      }
      visible
    }
    title
    content
    startDate
    endDate
  }
}
`;
export const createEvent = `mutation CreateEvent($input: CreateEventInput!) {
  createEvent(input: $input) {
    id
    createdBy
    createdDate
    postedDate
    locations {
      id
      url
      site_name
      directions
      welcome
      welcome_img
      welcome_vid_youtube
      phone
      email
      instagram
      twitter
      facebook
      location {
        longitude
        latitude
        address
      }
      visible
    }
    startTime
    endTime
    title
    description
  }
}
`;
export const updateEvent = `mutation UpdateEvent($input: UpdateEventInput!) {
  updateEvent(input: $input) {
    id
    createdBy
    createdDate
    postedDate
    locations {
      id
      url
      site_name
      directions
      welcome
      welcome_img
      welcome_vid_youtube
      phone
      email
      instagram
      twitter
      facebook
      location {
        longitude
        latitude
        address
      }
      visible
    }
    startTime
    endTime
    title
    description
  }
}
`;
export const deleteEvent = `mutation DeleteEvent($input: DeleteEventInput!) {
  deleteEvent(input: $input) {
    id
    createdBy
    createdDate
    postedDate
    locations {
      id
      url
      site_name
      directions
      welcome
      welcome_img
      welcome_vid_youtube
      phone
      email
      instagram
      twitter
      facebook
      location {
        longitude
        latitude
        address
      }
      visible
    }
    startTime
    endTime
    title
    description
  }
}
`;
export const createGroup = `mutation CreateGroup($input: CreateGroupInput!) {
  createGroup(input: $input) {
    id
    canJoin
    visibleToNonMembers
    status
    name
    admin {
      sub
      title
      name
      phone
      email
      instagram
      twitter
      facebook
      website
      status
    }
    members {
      sub
      title
      name
      phone
      email
      instagram
      twitter
      facebook
      website
      status
    }
    type
  }
}
`;
export const updateGroup = `mutation UpdateGroup($input: UpdateGroupInput!) {
  updateGroup(input: $input) {
    id
    canJoin
    visibleToNonMembers
    status
    name
    admin {
      sub
      title
      name
      phone
      email
      instagram
      twitter
      facebook
      website
      status
    }
    members {
      sub
      title
      name
      phone
      email
      instagram
      twitter
      facebook
      website
      status
    }
    type
  }
}
`;
export const deleteGroup = `mutation DeleteGroup($input: DeleteGroupInput!) {
  deleteGroup(input: $input) {
    id
    canJoin
    visibleToNonMembers
    status
    name
    admin {
      sub
      title
      name
      phone
      email
      instagram
      twitter
      facebook
      website
      status
    }
    members {
      sub
      title
      name
      phone
      email
      instagram
      twitter
      facebook
      website
      status
    }
    type
  }
}
`;
export const createOrganization = `mutation CreateOrganization($input: CreateOrganizationInput!) {
  createOrganization(input: $input) {
    id
    canJoin
    visibleToNonMembers
    status
    name
    admin {
      sub
      title
      name
      phone
      email
      instagram
      twitter
      facebook
      website
      status
    }
    members {
      sub
      title
      name
      phone
      email
      instagram
      twitter
      facebook
      website
      status
    }
    location
    address
    phone
    email
    instagram
    twitter
    facebook
    website
    sites {
      id
      url
      site_name
      directions
      welcome
      welcome_img
      welcome_vid_youtube
      phone
      email
      instagram
      twitter
      facebook
      location {
        longitude
        latitude
        address
      }
      visible
    }
  }
}
`;
export const updateOrganization = `mutation UpdateOrganization($input: UpdateOrganizationInput!) {
  updateOrganization(input: $input) {
    id
    canJoin
    visibleToNonMembers
    status
    name
    admin {
      sub
      title
      name
      phone
      email
      instagram
      twitter
      facebook
      website
      status
    }
    members {
      sub
      title
      name
      phone
      email
      instagram
      twitter
      facebook
      website
      status
    }
    location
    address
    phone
    email
    instagram
    twitter
    facebook
    website
    sites {
      id
      url
      site_name
      directions
      welcome
      welcome_img
      welcome_vid_youtube
      phone
      email
      instagram
      twitter
      facebook
      location {
        longitude
        latitude
        address
      }
      visible
    }
  }
}
`;
export const deleteOrganization = `mutation DeleteOrganization($input: DeleteOrganizationInput!) {
  deleteOrganization(input: $input) {
    id
    canJoin
    visibleToNonMembers
    status
    name
    admin {
      sub
      title
      name
      phone
      email
      instagram
      twitter
      facebook
      website
      status
    }
    members {
      sub
      title
      name
      phone
      email
      instagram
      twitter
      facebook
      website
      status
    }
    location
    address
    phone
    email
    instagram
    twitter
    facebook
    website
    sites {
      id
      url
      site_name
      directions
      welcome
      welcome_img
      welcome_vid_youtube
      phone
      email
      instagram
      twitter
      facebook
      location {
        longitude
        latitude
        address
      }
      visible
    }
  }
}
`;
export const createLocation = `mutation CreateLocation($input: CreateLocationInput!) {
  createLocation(input: $input) {
    id
    url
    site_name
    directions
    welcome
    welcome_img
    welcome_vid_youtube
    phone
    email
    instagram
    twitter
    facebook
    location {
      longitude
      latitude
      address
    }
    visible
  }
}
`;
export const updateLocation = `mutation UpdateLocation($input: UpdateLocationInput!) {
  updateLocation(input: $input) {
    id
    url
    site_name
    directions
    welcome
    welcome_img
    welcome_vid_youtube
    phone
    email
    instagram
    twitter
    facebook
    location {
      longitude
      latitude
      address
    }
    visible
  }
}
`;
export const deleteLocation = `mutation DeleteLocation($input: DeleteLocationInput!) {
  deleteLocation(input: $input) {
    id
    url
    site_name
    directions
    welcome
    welcome_img
    welcome_vid_youtube
    phone
    email
    instagram
    twitter
    facebook
    location {
      longitude
      latitude
      address
    }
    visible
  }
}
`;
export const createStaff = `mutation CreateStaff($input: CreateStaffInput!) {
  createStaff(input: $input) {
    sub
    title
    name
    phone
    email
    instagram
    twitter
    facebook
    website
    status
  }
}
`;
export const updateStaff = `mutation UpdateStaff($input: UpdateStaffInput!) {
  updateStaff(input: $input) {
    sub
    title
    name
    phone
    email
    instagram
    twitter
    facebook
    website
    status
  }
}
`;
export const deleteStaff = `mutation DeleteStaff($input: DeleteStaffInput!) {
  deleteStaff(input: $input) {
    sub
    title
    name
    phone
    email
    instagram
    twitter
    facebook
    website
    status
  }
}
`;
export const createRegion = `mutation CreateRegion($input: CreateRegionInput!) {
  createRegion(input: $input) {
    id
    name
    status
    sites {
      id
      url
      site_name
      directions
      welcome
      welcome_img
      welcome_vid_youtube
      phone
      email
      instagram
      twitter
      facebook
      location {
        longitude
        latitude
        address
      }
      visible
    }
  }
}
`;
export const updateRegion = `mutation UpdateRegion($input: UpdateRegionInput!) {
  updateRegion(input: $input) {
    id
    name
    status
    sites {
      id
      url
      site_name
      directions
      welcome
      welcome_img
      welcome_vid_youtube
      phone
      email
      instagram
      twitter
      facebook
      location {
        longitude
        latitude
        address
      }
      visible
    }
  }
}
`;
export const deleteRegion = `mutation DeleteRegion($input: DeleteRegionInput!) {
  deleteRegion(input: $input) {
    id
    name
    status
    sites {
      id
      url
      site_name
      directions
      welcome
      welcome_img
      welcome_vid_youtube
      phone
      email
      instagram
      twitter
      facebook
      location {
        longitude
        latitude
        address
      }
      visible
    }
  }
}
`;
