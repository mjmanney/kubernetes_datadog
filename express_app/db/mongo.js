const mongoose = require('mongoose')
      mongoose.promise = global.promise

// const server   = '127.0.0.1:27017'
// in the case of docker we can use the mongo service name that we specify i
const database = 'hackdb'

function Database() {
	this._connect = function() {
		mongoose.connect(`mongodb://mongodb/${database}`)
				.then(() => console.log('Connection succesful'))
				.catch(err => console.error('Unable to connect to DB. Msg: ' + err))
	}
}

module.exports = new Database()