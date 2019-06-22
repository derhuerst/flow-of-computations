'use strict'

const replaceAt = (arr, idx, val) => [
	...arr.slice(0, idx), val, ...arr.slice(idx + 1)
]

module.exports = {
	replaceAt
}
