const HttpStatus = require('http-status-codes');
const User = require('../models/User');

/**
 * Save user to database.
 *
 * @param email of user to create.
 * @returns appropriate status.
 */
const saveUser = async (email) => {
  try {
    const doc = await User.findOne({ email: email });
    if (doc) {
      return {
        status: HttpStatus.CONFLICT,
        message: 'User already saved'
      };
    } else {
      const user = new User({
        email: email,
        workflows: []
      });
      await user.save();
      return {
        status: HttpStatus.CREATED,
        message: 'User saved successfully'
      };
    }
  } catch (err) {
    return {
      status: HttpStatus.SERVICE_UNAVAILABLE,
      message: err
    };
  }
};

/**
 * GET user refresh token given the email.
 *
 * @param email of user to look up
 * @returns refresh token with appropriate status code or just status code
 */
const getToken = async (email) => {
  try {
    const entry = await User.findOne({ email: email });
    if (entry) {
      return {
        token: entry.refresh_token,
        status: HttpStatus.OK,
        message: 'OK'
      };
    } else {
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'User not found'
      };
    }
  } catch (err) {
    return {
      status: HttpStatus.SERVICE_UNAVAILABLE,
      message: err
    };
  }
};

/**
 * @param email of the user to add the workflow
 * @param workflow to be added (if not yet existing).
 * @returns appropriate status.
 */
const addWorkflow = async (email, workflow) => {
  try {
    const user = await User.findOne({ email: email });
    if (user) {
      const workflows = user.workflows;
      for (let i = 0; i < workflows.length; i++) {
        const wf = workflows[i];
        if (wf.workflowId === workflow.workflowId) {
          return {
            status: HttpStatus.CONFLICT,
            message: 'Workflow with that id already exists'
          };
        }
      }
      workflows.unshift(workflow);

      await User.updateOne(
        { email: email },
        { $set: { workflows: workflows } },
        { upsert: false }
      );

      return {
        status: HttpStatus.OK,
        message: 'Workflow added successfully'
      };
    } else {
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'No such user'
      };
    }
  } catch (err) {
    return {
      status: HttpStatus.SERVICE_UNAVAILABLE,
      message: err
    };
  }
};

/**
 * Get user workflows.
 *
 * @param email of the user
 * @returns list of workflows, empty array if user has none,
 * with appropriate status code, or just status code in case of error
 */
const getWorkflows = async (email) => {
  try {
    const user = await User.findOne({ email: email });
    if (user) {
      return {
        workflows: user.workflows || [],
        status: HttpStatus.OK,
        message: 'OK'
      };
    } else {
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'No such user'
      };
    }
  } catch (err) {
    return {
      status: HttpStatus.SERVICE_UNAVAILABLE,
      message: err
    };
  }
};

/**
 * @param email of user to update the token.
 * @param refreshToken argument.
 * @returns appropriate status.
 */
const updateRefreshToken = async (email, refreshToken) => {
  const filter = { email: email };
  const update = { refresh_token: refreshToken };

  try {
    const doc = await User.findOneAndUpdate(filter, update, { upsert: true });
    if (doc) {
      return {
        status: HttpStatus.OK,
        message: 'Updated successfully!'
      };
    } else {
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'No such user'
      };
    }
  } catch (err) {
    return {
      status: HttpStatus.SERVICE_UNAVAILABLE,
      message: err
    };
  }
};

/**
 * Update status of a user's workflow in database.
 *
 * @param email of user to create.
 * @param workflowId id of workflow to update status
 * @param status to update workflow in database with
 * @returns appropriate status.
 */
const updateStatus = async (email, workflowId, status) => {
  try {
    const ret = await User.findOneAndUpdate({
      email: email,
      workflows: { $elemMatch: { workflowId: workflowId } }
    },
    { $set: { 'workflows.$.status': status } },
    { new: true, safe: true, upsert: true });

    if (ret) {
      return {
        status: HttpStatus.OK,
        message: 'Workflow status updated successfully!'
      };
    } else {
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'No user with given email, or workflowId found'
      };
    }
  } catch (err) {
    return {
      status: HttpStatus.SERVICE_UNAVAILABLE,
      message: err
    };
  }
};

/**
 * GET status of workflow given the email of user and workflowId.
 *
 * @param email of user
 * @param workflowId id of workflow to retrieve the status of
 * @returns status of workflow appropriate status code or just status code
 */
const getStatus = async (email, workflowId) => {
  const filter = { email: email };

  try {
    const user = await User.findOne(filter);
    if (user) {
      const workflows = user.workflows;
      let workflowStatus;
      for (let i = 0; i < workflows.length; i++) {
        if (workflows[i].workflowId === workflowId) {
          workflowStatus = workflows[i].status;
        }
      }

      if (!workflowStatus) {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Workflow with given workflowID not found'
        };
      }

      return {
        workflowStatus: workflowStatus,
        status: HttpStatus.OK,
        message: 'Success'
      };
    } else {
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'User with given email not found'
      };
    }
  } catch (err) {
    return {
      status: HttpStatus.SERVICE_UNAVAILABLE,
      message: err
    };
  }
};

module.exports = {
  saveUser,
  getToken,
  addWorkflow,
  getWorkflows,
  updateRefreshToken,
  updateStatus,
  getStatus
};
