module.exports = ({ env }) => ({
  // ..
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