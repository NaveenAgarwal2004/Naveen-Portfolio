/**
 * Data Transfer Objects (DTOs)
 * Define the structure of data passed between layers
 */

/**
 * @typedef {Object} CreateProjectDTO
 * @property {string} title
 * @property {string} description
 * @property {string} [detailedDescription]
 * @property {'AI'|'Web'} category
 * @property {boolean} [featured]
 * @property {number} [order]
 * @property {string[]} techStack
 * @property {string} [githubUrl]
 * @property {string} [liveUrl]
 * @property {string} [problem]
 * @property {string} [solution]
 * @property {string} [outcome]
 * @property {string} [image]
 * @property {string} [imagePublicId]
 * @property {Object} [demoCredentials]
 * @property {string} [demoCredentials.username]
 * @property {string} [demoCredentials.password]
 */

/**
 * @typedef {Partial<CreateProjectDTO>} UpdateProjectDTO
 */

/**
 * @typedef {Object} ProjectFiltersDTO
 * @property {string} [category]
 * @property {boolean} [featured]
 * @property {number} [page]
 * @property {number} [limit]
 */

/**
 * @typedef {Object} PaginationMeta
 * @property {number} page
 * @property {number} limit
 * @property {number} total
 * @property {number} totalPages
 * @property {boolean} hasNextPage
 * @property {boolean} hasPrevPage
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {*} [data]
 * @property {string} [message]
 * @property {string} [error]
 * @property {PaginationMeta} [pagination]
 */

module.exports = {};
