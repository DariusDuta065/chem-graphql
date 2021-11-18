const queries: {
  [key: string]: {
    [key: string]: {
      operationName: string;
      query: string;
    };
  };
} = {
  auth: {
    profile: {
      operationName: `ProfileQuery`,
      query: `
        query ProfileQuery {
          profile {
            id
            email
            firstName
            lastName
            role
          }
        }
      `,
    },
    adminRoute: {
      operationName: `AdminRouteQuery`,
      query: `
        query AdminRouteQuery {
          adminRoute
        }
      `,
    },
    userRoute: {
      operationName: `UserRouteQuery`,
      query: `
        query UserRouteQuery {
          userRoute
        }
      `,
    },
    publicRoute: {
      operationName: `PublicRouteQuery`,
      query: `
        query PublicRouteQuery {
          publicRoute
        }
      `,
    },
  },
  groups: {
    groups: {
      operationName: `Groups`,
      query: `
        query Groups {
          groups {
            id
            grade
            notes
            users {
              userId
            }
            contents {
              id
            }
          }
        }
      `,
    },
    group: {
      operationName: `Group`,
      query: `
        query Group($groupId: Int!) {
          group(groupId: $groupId) {
            id
            grade
            notes
            scheduleDay
            scheduleHour
            scheduleMinute
          }
        }
      `,
    },
  },
  users: {
    users: {
      operationName: `Users`,
      query: `
        query Users {
          users {
            userId
            email
            firstName
            lastName
            role
            group {
              id
              grade
              notes
              scheduleDay
              scheduleHour
              scheduleMinute
            }
          }
        }
      `,
    },
    user: {
      operationName: `User`,
      query: `
        query User($userId: Int!) {
          user(userId: $userId) {
            userId
            email
            firstName
            lastName
            role
            group {
              id
              grade
              notes
              scheduleDay
              scheduleHour
              scheduleMinute
            }
          }
        }
      `,
    },
  },
  contents: {
    contents: {
      operationName: `Contents`,
      query: `
        query Contents {
          contents {
            id
            blockID
            lastEditedAt
            title
            type
            blocks
          }
        }
      `,
    },
    content: {
      operationName: `Content`,
      query: `
        query Content($contentId: Int!) {
          content(contentId: $contentId) {
            id
            blockID
            lastEditedAt
            title
            type
            blocks
          }
        }
      `,
    },
  },
};

export default queries;
