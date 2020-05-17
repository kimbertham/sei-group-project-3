const Group = require('../models/Group')
const User = require('../models/user')

// --------------- CREATE NEW GROUP ---------------
// post request: /groups/new/:userId
// body required = {
// name: string,
// description: String,
// }
// requires a valid token
async function createGroup(req,res,next) {
  try {
    console.log('CREATING GROUP')
    
    const user = await User.findById(req.params.userId)
    if ( !user.equals(req.currentUser._id)){
      throw new Error('Not authorized to do this')
    }
    req.body.owner = req.currentUser
    const newGroup = await Group.create(req.body)
    res.status(201).json(newGroup)
  } catch (err){
    next(err)
  }
}


// --------------- DELETE GROUP ---------------
// post request: /groups/:groupId/:userId
// NO body required
// only creator can delete the group, requires correct token
async function deleteGroup(req,res,next) {
  try {
    console.log('DELETE GROUP')
    const user = await User.findById(req.params.userId)
    if ( !user.equals(req.currentUser._id)){
      throw new Error('Not authorized to do this')
    }
    const groupToDelete = await Group.findById(req.params.groupId)
    if (!groupToDelete){
      throw new Error('Not Found')
    }
    await groupToDelete.remove()
    res.status(201).json('SUCCESSFULLY DELETED')
  } catch (err){
    next(err)
  }
}

// -------------- JOIN A GROUP --------------------
// PUT request: /groups/:groupId/join/:userId
// No body required
// Any valid token required

async function joinGroup(req,res,next) {
  try {
    console.log('JOIN GROUP')
    const user = await User.findById(req.params.userId)
    const group = await Group.findById(req.params.groupId)
    if (!user || !group){
      throw new Error('Not Found')
    }
    group.members.push(user)
    await group.save()
    res.status(201).json('JOINED GROUP SUCCESSFULLY')
  } catch (err){
    next(err)
  }
}

// -------------- LEAVE A GROUP --------------------
// PUT request: /groups/:groupId/leave/:userId
// No body required
// Any valid token required

async function leaveGroup(req,res,next) {
  try {
    console.log('LEAVE GROUP')
    const user = await User.findById(req.params.userId)
    const group = await Group.findById(req.params.groupId)
    if (!user || !group){
      throw new Error('Not Found')
    }
    if (!user.equals(req.currentUser._id)){
      throw new Error('Not authorized to do this')
    }
    console.log(group.members)
    group.members.pull(user)
    await group.save()
    res.status(201).json('LEFT GROUP SUCCESSFULLY')
  } catch (err){
    next(err)
  }
}

// -------------- POST IN GROUP --------------------
// POST request: /groups/:groupId/post/:userId
// body required = {
//  content: String
// }
// Any valid token required

async function postInGroup(req,res,next) {
  try {
    console.log('POST IN GROUP')
    const user = await User.findById(req.params.userId)
    const group = await Group.findById(req.params.groupId)
    if (!user || !group){
      throw new Error('Not Found')
    }
    if (!user.equals(req.currentUser._id)){
      throw new Error('Not authorized to do this')
    }
    req.body.owner = req.params.userId
    group.posts.push(req.body)
    await group.save()
    res.status(201).json('POSTED TO GROUP SUCCESSFULLY')
  } catch (err){
    next(err)
  }
}

// -------------- DELETE POST FROM GROUP --------------------
// DELETE request: /groups/:groupId/post/:postId/delete
// No body required
// valid token required of owner of post OR owner of group

async function deleteGroupPost(req,res,next) {
  console.log('DELETING POST')
  
  try {
    const group = await Group.findById(req.params.groupId)
    const postToDelete = group.posts.id(req.params.postId)
    if (!group || !postToDelete) {
      throw new Error('Not Found')
    }
    if (!postToDelete.owner.equals(req.currentUser._id) && !group.owner.equals(req.currentUser._id)){
      throw new Error('Not authorized to do this')
    }
    await postToDelete.remove()
    await group.save()
    res.status(201).json('post deleted successfully')

  } catch (err){
    next(err)
  }
}



// -------------- TOGGLES LIKE ON A POST FROM GROUP --------------------
// this will like a post or Unlike a post if the user has already liked it
// PUT request: /groups/:groupId/post/:postId/like
// No body required
// valid token required

async function toggleLike(req,res,next){
  try {
    const group = await Group.findById(req.params.groupId)
    const post = group.posts.id(req.params.postId)
    if (!group || !post) {
      throw new Error('Not Found')
    }
    if (post.likes.includes(req.currentUser._id)) {
      post.likes.pull(req.currentUser)
    } else {
      post.likes.push(req.currentUser)
    }
    
    
    await group.save()
    res.status(201).json('post liked/unliked successfully')

  } catch (err){
    next(err)
  }
}






module.exports = {
  new: createGroup,
  delete: deleteGroup,
  join: joinGroup,
  leave: leaveGroup,
  post: postInGroup,
  deletePost: deleteGroupPost,
  like: toggleLike
}