const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.ObjectId;

/**
 * @swagger
 *  components:
 *    schemas:
 *      User:
 *        type: object
 *        required:
 *          - email
 *          - workflows
 *        properties:
 *          email:
 *            type: string
 *            format: email
 *            description: Unique
 *          workflows:
 *            type: array
 *            description: List of user's workflows
 *        example:
 *          email: ok@example.com
 *          workflows: []
 */
const UserSchema = new Schema({
  id: ObjectId,
  email: String,
  workflows: [{
    workflowId: String,
    submitted: Date,
    finished: Date,
    algorithm: String,
    species: String,
    projectId: String,
    sampleName: String,
    single: Boolean,
    status: String
  }],
  refresh_token: String
});

module.exports = mongoose.model('User', UserSchema);
