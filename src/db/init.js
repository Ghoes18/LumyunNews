const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://root:Iam4Ctnn3GsioloE@cluster0.nkidv.mongodb.net/lumyun?retryWrites=true&w=majority').then(() => {
    console.log('Connected to database');
}).catch(err => {
    console.log('Connection failed', err.message);
});

module.exports = mongoose;