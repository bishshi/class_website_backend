module.exports = ({ env }) => ({
  graphql: {
    enabled: true,
    config: {
      endpoint: '/graphql',
      shadowCRUD: true,
      
      depthLimit: 7,
      amountLimit: 100,
      
      apolloServer: {
        // 生产环境关闭追踪
        tracing: env.bool('GRAPHQL_TRACING', false),
        
        // 生产环境必须关闭 Introspection (防止 Schema 泄露)
        introspection: env.bool('NODE_ENV') !== 'production', 
      },
      landingPage: env('NODE_ENV') !== 'production', 
    },
  },

  reactions: {
    enabled: true,
    config: {
      gql: {
        reactionRelated: ['Article', 'Student', 'Teacher'],
      },
    },
  },
	'publisher': {
		enabled: true,
		config: {
				hooks: {
					beforePublish: async ({ strapi, uid, entity }) => {
						// Return false to prevent publish; any other value (or no return) allows it
						console.log('beforePublish');
						// return false
					},
					afterPublish: async ({ strapi, uid, entity }) => {
						console.log('afterPublish');
					},
					beforeUnpublish: async ({ strapi, uid, entity }) => {
						// Return false to prevent unpublish; any other value (or no return) allows it
						console.log('beforeUnpublish');
						// return false
					},
					afterUnpublish: async ({ strapi, uid, entity }) => {
						console.log('afterUnpublish');
					},
				},
		},
	},
	// ..
});